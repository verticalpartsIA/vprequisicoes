import { describe, it, expect } from 'vitest';
import { productRequestSchema } from '@/lib/validation/schemas';

// Estes testes validam a extração do fields-extract.json e as regras do M1-products
describe('productRequestSchema', () => {
  it('deve aceitar requisição válida com um item completo', () => {
    const input = {
      solicitante: 'Gelson',
      departamento: 'Manutenção',
      centroCusto: 'CP001',
      justificativa: 'Necessidade de reparo na bomba principal de sucção',
      itens: [
        { nome: 'Parafuso M8', quantidade: 100 }
      ]
    };
    
    expect(() => productRequestSchema.parse(input)).not.toThrow();
    const result = productRequestSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('deve rejeitar item sem nome (Extraído do fields-extract.json)', () => {
    const input = {
      solicitante: 'Gelson',
      departamento: 'Manutenção',
      centroCusto: 'CP001',
      justificativa: 'Necessidade de reparo na bomba principal',
      itens: [
        { nome: '', quantidade: 100 }
      ]
    };
    
    const result = productRequestSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Nome do produto é obrigatório');
    }
  });

  it('deve rejeitar quantidade zero ou negativa', () => {
    const input = {
      solicitante: 'Gelson',
      departamento: 'Vendas',
      centroCusto: 'VC02',
      justificativa: 'Uso de escritório central da empresa',
      itens: [
        { nome: 'Caneta Azul', quantidade: 0 }
      ]
    };
    
    const result = productRequestSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('deve aceitar múltiplos itens válidos (Requisito Módulo M1)', () => {
    const input = {
      solicitante: 'Gelson',
      departamento: 'TI',
      centroCusto: 'Infra',
      justificativa: 'Novos setups para desenvolvedores e estagiários',
      itens: [
        { nome: 'Monitor 27', quantidade: 2 },
        { nome: 'Teclado Mecânico', quantidade: 2 },
        { nome: 'Mouse Gamer', quantidade: 2 }
      ]
    };
    
    const result = productRequestSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('deve rejeitar array vazio de itens', () => {
    const input = {
      solicitante: 'Gelson',
      departamento: 'RH',
      centroCusto: 'ADM',
      justificativa: 'Teste vazio para validação',
      itens: []
    };
    
    const result = productRequestSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Adicione pelo menos um produto');
    }
  });
});
