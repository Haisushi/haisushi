
import { Json } from '@/integrations/supabase/types';

export type Order = {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  items: Json;
  order_amount: number | null;
  delivery_fee: number | null;
  total_amount: number | null;
  status: string | null;
  created_at: string | null;
  delivery_address: Json | null;
  bairro?: string | null;
  scheduled_date?: string | null;
};

export type AddressFormat = {
  UF: string;
  CEP: string;
  Bairro: string;
  Localidade: string;
  Logradouro: string;
  Número: string;
  Complemento: string;
};

// New address format to support the alternative structure
export type NewAddressFormat = {
  uf: string;
  CEP: string;
  bairro: string;
  cidade: string;
  endereco: string;
  numero: string;
};

export type OrderFormValues = {
  customer_name: string;
  customer_phone: string;
  items: string; // JSON string
  order_amount: number;
  delivery_fee: number;
  total_amount: number;
  status: string;
  scheduled_date?: string;
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
