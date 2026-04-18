import { describe, it, expect } from 'vitest';
import { equipmentReturnSchema } from '@/lib/validation/schemas';

describe('equipmentReturnSchema (M6)', () => {
  it('deve aceitar devolução em bom estado', () => {
    const result = equipmentReturnSchema.safeParse({
      condition_on_return: 'ok',
      late_return_days: 0,
    });
    expect(result.success).toBe(true);
  });

  it('deve aceitar devolução com atraso', () => {
    const result = equipmentReturnSchema.safeParse({
      condition_on_return: 'ok',
      late_return_days: 3,
    });
    expect(result.success).toBe(true);
  });

  it('deve rejeitar devolução danificada sem notas', () => {
    const result = equipmentReturnSchema.safeParse({
      condition_on_return: 'damaged',
      late_return_days: 0,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('mín 10 carac');
    }
  });

  it('deve rejeitar equipamento perdido sem notas suficientes', () => {
    const result = equipmentReturnSchema.safeParse({
      condition_on_return: 'lost',
      late_return_days: 0,
      damage_notes: 'Sumiu',
    });
    expect(result.success).toBe(false);
  });

  it('deve aceitar equipamento danificado com notas válidas', () => {
    const result = equipmentReturnSchema.safeParse({
      condition_on_return: 'damaged',
      late_return_days: 1,
      damage_notes: 'Tela trincada após queda acidental no transporte.',
    });
    expect(result.success).toBe(true);
  });

  it('deve rejeitar atraso negativo', () => {
    const result = equipmentReturnSchema.safeParse({
      condition_on_return: 'ok',
      late_return_days: -1,
    });
    expect(result.success).toBe(false);
  });
});
