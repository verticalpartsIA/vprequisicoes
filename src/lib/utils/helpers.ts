/**
 * Helpers portados de helpers.php e utilidades gerais
 */

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
};

export const safeFilename = (name: string): string => {
  return name.replace(/[^A-Za-z0-9._-]/g, '_') || 'file';
};

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
