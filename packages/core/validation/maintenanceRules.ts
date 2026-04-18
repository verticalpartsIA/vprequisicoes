import { MaintenanceType, Priority } from '../../modules/M4-maintenance/types';
import { PRIORITY_OPTIONS } from '../../modules/M4-maintenance/constants';

/**
 * Centraliza a regra de bypass de cotação para manutenções com contrato vigente.
 * Se houver contrato, o status pula de SUBMITTED direto para APPROVED.
 */
export const shouldSkipQuotation = (covered_by_contract: boolean): boolean => {
  return covered_by_contract === true;
};

/**
 * Retorna o label amigável da prioridade.
 */
export const getMaintenancePriorityLabel = (priority: Priority): string => {
  return PRIORITY_OPTIONS.find(opt => opt.value === priority)?.label || priority;
};

/**
 * Identifica se a requisição é uma emergência crítica.
 */
export const isEmergencyRequest = (type: MaintenanceType, priority: Priority): boolean => {
  return type === 'corrective' && priority === 'emergency';
};
