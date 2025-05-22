
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Json } from '@/integrations/supabase/types';
import { AddressFormat } from '@/types/Order';

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

/**
 * Format address for display
 */
export const formatAddress = (address: Json | null): string => {
  if (!address) return 'N/A';
  
  // Se for uma string, retorna diretamente
  if (typeof address === 'string') return address;
  
  try {
    // Se for um array de objetos no formato especificado
    if (Array.isArray(address) && address.length > 0) {
      const addressObj = address[0] as AddressFormat;
      
      const parts = [];
      if (addressObj?.Logradouro) parts.push(addressObj.Logradouro);
      if (addressObj?.Número) parts.push(addressObj.Número);
      if (addressObj?.Complemento && addressObj.Complemento.trim() !== '') 
        parts.push(addressObj.Complemento);
      
      return parts.filter(Boolean).join(', ');
    }
    
    // Se for um objeto com as propriedades antigas
    if (typeof address === 'object') {
      const addressObj = address as any;
      
      // Verificar se está usando o formato antigo (logradouro, numero, etc.)
      if (addressObj.logradouro || addressObj.numero) {
        const parts = [];
        if (addressObj.logradouro) parts.push(addressObj.logradouro);
        if (addressObj.numero) parts.push(addressObj.numero);
        if (addressObj.complemento) parts.push(addressObj.complemento);
        
        return parts.filter(Boolean).join(', ');
      }
    }
    
    // Fallback: converter para string JSON
    return JSON.stringify(address);
  } catch (e) {
    console.error("Erro ao formatar endereço:", e);
    return String(address);
  }
};

/**
 * Get bairro from address
 */
export const getBairroFromAddress = (address: Json | null): string => {
  if (!address) return '';
  
  try {
    if (Array.isArray(address) && address.length > 0) {
      const addressObj = address[0] as AddressFormat;
      return addressObj?.Bairro || '';
    }
    if (typeof address === 'object') {
      const addressObj = address as any;
      return addressObj?.bairro || addressObj?.Bairro || '';
    }
  } catch (e) {
    console.error("Erro ao obter bairro:", e);
  }
  return '';
};
