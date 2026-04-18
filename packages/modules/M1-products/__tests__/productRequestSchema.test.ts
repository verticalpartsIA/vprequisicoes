import { describe, it, expect } from 'vitest';
import { productRequestSchema } from '@/lib/validation/schemas';

// Estes testes validam a extração do fields-extract.json e as regras do M1-products
describe('productRequestSchema', () => {
  it('deve aceitar requisição válida com um item completo', () => {
    const input = {
      department: 'Manutenção',
      costCenter: 'CP001',
      justification: 'Necessidade de reparo na bomba principal',
      items: [
        { name: 'Parafuso M8', quantity: 100 }
      ]
    };
    
    expect(() => productRequestSchema.parse(input)).not.toThrow();
    const result = productRequestSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('deve rejeitar item sem nome (Extraído do fields-extract.json)', () => {
    const input = {
      department: 'Manutenção',
      costCenter: 'CP001',
      justification: 'Teste',
      items: [
        { name: '', quantity: 100 }
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
      department: 'Vendas',
      costCenter: 'VC02',
      justification: 'Uso de escritório',
      items: [
        { name: 'Caneta Azul', quantity: 0 }
      ]
    };
    
    const result = productRequestSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('deve aceitar múltiplos itens válidos (Requisito Módulo M1)', () => {
    const input = {
      department: 'TI',
      costCenter: 'Infra',
      justification: 'Novos setups para desenvolvedores',
      items: [
        { name: 'Monitor 27', quantity: 2 },
        { name: 'Teclado Mecânico', quantity: 2 },
        { name: 'Mouse Gamer', quantity: 2 }
      ]
    };
    
    const result = productRequestSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('deve rejeitar array vazio de itens', () => {
    const input = {
      department: 'RH',
      costCenter: 'ADM',
      justification: 'Teste vazio',
      items: []
    };
    
    const result = productRequestSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Adicione pelo menos um produto');
    }
  });
});
