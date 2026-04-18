# Especificação de Validação e Regras de Negócio Legadas

## Regras de Negócio (Viagens)
- **Hospedagem:** Para períodos superiores a 2 diárias, a contratação via **Airbnb** deve ser priorizada.
- **Veículos:** Locação de veículos de passeio limitada à categoria **Compacto Com Ar**.
- **Cancelamentos:** Alerta obrigatório sobre tarifas não reembolsáveis e multas.
- **Formulário:** O campo `declaroCiente` é obrigatório para submissão.

## Regras de Negócio (Munck)
- **Antecedência:** Prazo mínimo de **7 dias** antes do serviço para cotação e trâmites.
- **Comunicação:** Após contratação, o setor de compras sai do circuito e o solicitante trata diretamente com o fornecedor.

## Esquemas de Validação (Sugestões Zod)

### Viagem Schema
```typescript
const travelSchema = z.object({
  departamento: z.string().min(1, "Obrigatório"),
  email: z.string().email("Email inválido"),
  dataIda: z.string(),
  dataVolta: z.string(),
  // ... outros campos
  locacaoVeiculo: z.boolean(),
  tipoLocacao: z.string().optional().refine((val, ctx) => {
    if (ctx.parent.locacaoVeiculo && !val) return false;
    return true;
  }, "Tipo de locação é obrigatório se locação estiver marcada")
});
```

### Regras Sanitização
- **Arquivos:** Nomes de arquivos são sanitizados removendo caracteres especiais e espaços, substituindo por `_` e adicionando timestamp + random hash.
- **Strings:** `trim()` em nomes de usuário e campos de texto principais.
