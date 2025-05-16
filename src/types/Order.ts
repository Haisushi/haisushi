
import { Json } from '@/integrations/supabase/types';

export type Order = {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  items: Json;
  total_amount: number | null;
  status: string | null;
  created_at: string | null;
};

export type OrderFormValues = {
  customer_name: string;
  customer_phone: string;
  items: string; // JSON string
  total_amount: number;
  status: string;
};

export const statusBadge = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  canceled: 'bg-red-100 text-red-800',
};

export const statusLabel = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  delivered: 'Entregue',
  canceled: 'Cancelado',
};
