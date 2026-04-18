import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(3, "Usuário deve ter pelo menos 3 caracteres"),
  password: z.string().min(4, "Senha deve ter pelo menos 4 caracteres"),
});

export const productItemSchema = z.object({
  nome: z.string().min(2, "Nome do produto é obrigatório"),
  quantidade: z.number().min(1, "Quantidade deve ser maior que 0"),
  especificacao: z.string().optional(),
});

export const productRequestSchema = z.object({
  solicitante: z.string().min(1, "Solicitante é obrigatório"),
  justificativa: z.string().min(10, "A justificativa deve ter no mínimo de 10 caracteres"),
  itens: z.array(productItemSchema).min(1, "Adicione pelo menos um produto"),
  // Campos técnicos mantidos ou absorvidos
  departamento: z.string().optional(),
  centroCusto: z.string().optional(),
});

export type ProductRequestInput = z.infer<typeof productRequestSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// --- MODULE: QUOTATION ---
export const MAX_SUPPLIERS_PER_ITEM = 3; // Redefinido aqui para evitar import circus em schemas

export const quotationSupplierSchema = z.object({
  name: z.string().min(2, 'Nome do fornecedor é obrigatório'),
  price: z.number().positive('Preço deve ser maior que zero'),
  delivery_days: z.number().int().min(0, 'Prazo inválido'),
  observations: z.string().optional(),
  contact_email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  is_winner: z.boolean().default(false),
});

export const quotationItemSchema = z.object({
  request_item_id: z.string(),
  suppliers: z.array(quotationSupplierSchema)
    .min(1, 'Adicione pelo menos uma cotação para o item')
    .max(MAX_SUPPLIERS_PER_ITEM, `Máximo de ${MAX_SUPPLIERS_PER_ITEM} fornecedores permitidos`),
  notes: z.string().optional(),
}).refine(data => {
  if (data.suppliers.length > 0) {
    const winners = data.suppliers.filter(s => s.is_winner);
    return winners.length === 1;
  }
  return true;
}, {
  message: "Selecione um fornecedor vencedor para este item",
  path: ["suppliers"]
});

export const quotationSchema = z.object({
  items: z.array(quotationItemSchema).min(1, 'A cotação deve ter pelo menos um item'),
});

export type QuotationSupplierInput = z.infer<typeof quotationSupplierSchema>;
export type QuotationItemInput = z.infer<typeof quotationItemSchema>;
export type QuotationInput = z.infer<typeof quotationSchema>;

// --- MODULE: APPROVAL ---
export const approvalDecisionSchema = z.discriminatedUnion('decision', [
  z.object({ 
    decision: z.literal('approve') 
  }),
  z.object({ 
    decision: z.literal('reject'), 
    reason: z.string().min(10, 'O motivo da reprovação deve ter pelo menos 10 caracteres') 
  }),
  z.object({ 
    decision: z.literal('revision'), 
    comment: z.string().min(5, 'O comentário de revisão deve ter pelo menos 5 caracteres') 
  })
]);

export type ApprovalDecisionInput = z.infer<typeof approvalDecisionSchema>;

// --- Módulo de Compras (Purchasing) ---

export const purchaseOrderItemSchema = z.object({
  description: z.string().min(3, "Descrição muito curta"),
  quantity: z.number().positive("Quantidade deve ser positiva"),
  unit_price: z.number().positive("Preço deve ser positivo"),
  subtotal: z.number().positive()
});

export const purchaseOrderSchema = z.object({
  method: z.enum(['auction', 'direct']),
  supplier_id: z.string().min(1, "Selecione um fornecedor"),
  supplier_name: z.string().min(1, "Nome do fornecedor obrigatório"),
  items: z.array(purchaseOrderItemSchema).min(1, "Lista de itens não pode estar vazia"),
  total_amount: z.number().positive("Valor total deve ser positivo"),
  delivery_address: z.string().min(10, "Endereço de entrega deve ter pelo menos 10 caracteres"),
  payment_terms: z.string().optional()
});

export type PurchaseOrderInput = z.infer<typeof purchaseOrderSchema>;

// --- Módulo de Recebimento (Receiving) ---

export const physicalReceivedItemSchema = z.object({
  purchase_order_item_id: z.string(),
  description: z.string(),
  quantity_purchased: z.number(),
  quantity_received: z.number().min(0, "Quantidade não pode ser negativa"),
  condition: z.enum(['ok', 'damaged', 'missing']),
  divergence_reason: z.string().optional()
});

export const receivingSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("physical"),
    received_by: z.string().min(3, "Identificação do recebedor obrigatória"),
    notes: z.string().optional(),
    items: z.array(physicalReceivedItemSchema).min(1, "Identifique os itens recebidos")
  }),
  z.object({
    type: z.literal("digital"),
    received_by: z.string().min(3, "Identificação obrigatória"),
    execution_confirmed: z.boolean().refine(val => val === true, "Você deve confirmar a execução para liberar"),
    notes: z.string().min(10, "Atestado exige uma breve descrição da execução")
  })
]);

export type ReceivingInput = z.infer<typeof receivingSchema>;

// --- Módulo de Viagens (M2) ---

export const travelRequestSchema = z.object({
  traveler_name: z.string().min(3, "Nome do viajante obrigatório"),
  traveler_department: z.string().min(2, "Departamento obrigatório"),
  origin: z.string().min(3, "Cidade de origem obrigatória"),
  destination: z.string().min(3, "Cidade de destino obrigatória"),
  departure_date: z.string().min(1, "Data de partida obrigatória"),
  return_date: z.string().min(1, "Data de retorno obrigatória"),
  travel_type: z.enum(['visita_tecnica', 'evento', 'workshop', 'curso', 'outro']),
  is_international: z.boolean().default(false),
  transport_mode: z.enum(['aviao', 'onibus', 'carro_proprio', 'carro_locado']),
  needs_lodging: z.boolean().default(false),
  hotel_name: z.string().optional(),
  nights: z.number().optional(),
  needs_destination_car: z.boolean().default(false),
  pickup_location: z.string().optional(),
  rental_days: z.number().optional(),
  urgency_justification: z.string().optional()
}).superRefine((data, ctx) => {
  const dep = new Date(data.departure_date);
  const ret = new Date(data.return_date);
  const now = new Date();

  // Validação de intervalo de data
  if (ret < dep) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Data de retorno deve ser posterior à partida",
      path: ["return_date"]
    });
  }

  // Validação de urgência
  const diffDays = Math.ceil((dep.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 5 && (!data.urgency_justification || data.urgency_justification.length < 20)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Viagens com menos de 5 dias de antecedência exigem justificativa detalhada (mín 20 carac.)",
      path: ["urgency_justification"]
    });
  }
});

export type TravelRequestInput = z.infer<typeof travelRequestSchema>;

// --- Módulo de Serviços (M3) ---

export const milestoneSchema = z.object({
  name: z.string().min(3, "Nome da etapa é obrigatório"),
  percentage: z.number().min(1, "Mínimo 1%").max(100, "Máximo 100%"),
  description: z.string().optional()
});

export const serviceRequestSchema = z.object({
  requester_name: z.string().min(3, "Nome do solicitante obrigatório"),
  requester_department: z.string().min(2, "Departamento obrigatório"),
  service_type: z.enum(['maintenance', 'installation']),
  scope_description: z.string().min(10, "Descreva o escopo técnico (mín 10 carac.)"),
  location_address: z.string().min(5, "Endereço do serviço obrigatório"),
  
  // Instalação
  work_code: z.string().optional(),
  work_address: z.string().optional(),
  
  payment_by_milestone: z.boolean().default(false),
  milestones: z.array(milestoneSchema).optional(),
  
  provider_type: z.enum(['PF', 'PJ']),
  provider_name: z.string().min(3, "Nome/Razão Social obrigatório"),
  provider_document: z.string().refine(val => {
    const clean = val.replace(/\D/g, '');
    return clean.length === 11 || clean.length === 14;
  }, "Documento inválido (CPF: 11 dígitos ou CNPJ: 14 dígitos)"),
  provider_contact: z.string().optional(),
  estimated_value: z.number().positive("Valor estimado deve ser positivo").optional()
}).superRefine((data, ctx) => {
  // Se for instalação, Código da Obra é recomendado
  if (data.service_type === 'installation' && !data.work_code) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Código da obra é obrigatório para instalações",
      path: ["work_code"]
    });
  }

  // Validação de soma de Milestones
  if (data.payment_by_milestone && data.milestones) {
    const total = data.milestones.reduce((acc, m) => acc + (Number(m.percentage) || 0), 0);
    if (total !== 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `A soma das porcentagens deve ser exatamente 100% (Atual: ${total}%)`,
        path: ["milestones"]
      });
    }
  }
});

export type ServiceRequestInput = z.infer<typeof serviceRequestSchema>;

// --- Módulo de Manutenção (M4) ---

export const maintenanceRequestSchema = z.object({
  requester_name: z.string().min(3, "Nome do solicitante obrigatório"),
  requester_department: z.string().min(2, "Departamento obrigatório"),
  maintenance_type: z.enum(['preventive', 'corrective']),
  asset_name: z.string().min(2, "Identificação do ativo obrigatória"),
  location: z.string().min(5, "Localização detalhada obrigatória"),
  description: z.string().min(10, "Descreva o problema/escopo (mín 10 carac.)"),
  priority: z.enum(['emergency', 'high', 'medium', 'low']),
  covered_by_contract: z.boolean().default(false),
  contract_number: z.string().optional(),
  contract_provider: z.string().optional(),
  contract_valid_until: z.string().optional(),
  estimated_value: z.number().positive("Valor deve ser positivo").optional(),
  recurrence: z.enum(['one_time', 'monthly', 'quarterly', 'annual']).default('one_time')
}).superRefine((data, ctx) => {
  // Se NÃO coberto por contrato, valor estimado é obrigatório para cotação
  if (!data.covered_by_contract && (!data.estimated_value || data.estimated_value <= 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Valor estimado é obrigatório when not covered by contract",
      path: ["estimated_value"]
    });
  }

  // Se FOR emergência corretiva, descrição longa é obrigatória
  if (data.maintenance_type === 'corrective' && data.priority === 'emergency' && data.description.length < 30) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Descrições de emergência exigem mais detalhes técnicos (mín 30 carac.)",
      path: ["description"]
    });
  }
});

export type MaintenanceRequestInput = z.infer<typeof maintenanceRequestSchema>;
