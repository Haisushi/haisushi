
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Format currency values to Brazilian Real format
 */
export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'R$ 0,00';
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
};

/**
 * Format date to Brazilian format with time
 */
export const formatOrderDate = (dateString: string | null): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
};
