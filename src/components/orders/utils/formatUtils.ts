
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Json } from '@/integrations/supabase/types';
import { AddressFormat, NewAddressFormat } from '@/types/Order';

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
    // Se for um array de objetos
    if (Array.isArray(address) && address.length > 0) {
      const addressObj = address[0];
      
      // Check for new address format (endereco, numero)
      if ('endereco' in addressObj && 'numero' in addressObj) {
        const newFormat = addressObj as NewAddressFormat;
        
        const parts = [];
        if (newFormat?.endereco) parts.push(newFormat.endereco);
        if (newFormat?.numero) parts.push(newFormat.numero);
        
        return parts.filter(Boolean).join(', ');
      }
      
      // Check for old address format (Logradouro, Número)
      if ('Logradouro' in addressObj && 'Número' in addressObj) {
        const oldFormat = addressObj as AddressFormat;
        
        const parts = [];
        if (oldFormat?.Logradouro) parts.push(oldFormat.Logradouro);
        if (oldFormat?.Número) parts.push(oldFormat.Número);
        if (oldFormat?.Complemento && oldFormat.Complemento.trim() !== '') 
          parts.push(oldFormat.Complemento);
        
        return parts.filter(Boolean).join(', ');
      }
    }
    
    // Se for um objeto com as propriedades antigas (logradouro, numero)
    if (typeof address === 'object') {
      const addressObj = address as any;
      
      // Verificar formato antigo (logradouro, numero)
      if (addressObj.logradouro || addressObj.endereco || addressObj.numero) {
        const parts = [];
        if (addressObj.logradouro) parts.push(addressObj.logradouro);
        if (addressObj.endereco) parts.push(addressObj.endereco);
        if (addressObj.numero || addressObj.número) 
          parts.push(addressObj.numero || addressObj.número);
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
      const addressObj = address[0] as any;
      
      // Check new format (bairro)
      if (addressObj?.bairro) {
        return addressObj.bairro;
      }
      
      // Check old format (Bairro)
      if (addressObj?.Bairro) {
        return addressObj.Bairro;
      }
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

/**
 * Format full address with city and state for display
 */
export const formatFullAddress = (address: Json | null): string => {
  if (!address) return 'N/A';
  
  try {
    if (Array.isArray(address) && address.length > 0) {
      const addressObj = address[0] as any;
      
      const parts = [];
      // Format for new address format
      if ('endereco' in addressObj && 'numero' in addressObj) {
        if (addressObj.endereco) parts.push(addressObj.endereco);
        if (addressObj.numero) parts.push(addressObj.numero);
        
        // Add city and state
        if (addressObj.cidade) parts.push(`- ${addressObj.cidade}`);
        if (addressObj.uf) parts.push(`/${addressObj.uf}`);
        
        return parts.filter(Boolean).join(' ');
      }
      
      // Format for old address format
      if ('Logradouro' in addressObj && 'Número' in addressObj) {
        if (addressObj.Logradouro) parts.push(addressObj.Logradouro);
        if (addressObj.Número) parts.push(addressObj.Número);
        if (addressObj.Complemento && addressObj.Complemento.trim() !== '') 
          parts.push(addressObj.Complemento);
        
        // Add city and state from old format
        if (addressObj.Localidade) parts.push(`- ${addressObj.Localidade}`);
        if (addressObj.UF) parts.push(`/${addressObj.UF}`);
        
        return parts.filter(Boolean).join(' ');
      }
    }
    
    return formatAddress(address);
  } catch (e) {
    console.error("Erro ao formatar endereço completo:", e);
    return formatAddress(address);
  }
};

