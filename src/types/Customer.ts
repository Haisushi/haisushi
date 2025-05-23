import { Json } from '@/integrations/supabase/types';

export type Customer = {
  id: string;
  phone: string;
  name: string;
  address: Json;
  last_order_date: string | null;
  created_at: string;
};

export type CustomerFormValues = {
  phone: string;
  name: string;
  address: string;
};