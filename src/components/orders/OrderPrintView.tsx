
import { useState, useEffect } from 'react';
import { Order, AddressFormat } from '@/types/Order';
import { supabase } from '@/integrations/supabase/client';
import { MenuItem } from '@/types/MenuItem';
import { OrderReceiptContent } from './OrderReceiptContent';
import { Json } from '@/integrations/supabase/types';

interface OrderPrintViewProps {
  order: Order;
}

// Helper function to format address for display
const formatAddress = (address: Json | null): string => {
  if (!address) return 'N/A';
  
  // Se for uma string, retorna diretamente
  if (typeof address === 'string') return address;
  
  try {
    // Se for um array de objetos no formato especificado
    if (Array.isArray(address) && address.length > 0) {
      const addressObj = address[0] as AddressFormat; // Pega o primeiro item do array
      
      const parts = [];
      if (addressObj?.Logradouro) parts.push(addressObj.Logradouro);
      if (addressObj?.Número) parts.push(addressObj.Número);
      if (addressObj?.Complemento && addressObj.Complemento.trim() !== '') 
        parts.push(addressObj.Complemento);
      if (addressObj?.Bairro) parts.push(addressObj.Bairro);
      if (addressObj?.Localidade) parts.push(addressObj.Localidade);
      if (addressObj?.UF) parts.push(addressObj.UF);
      
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
        if (addressObj.bairro) parts.push(addressObj.bairro);
        
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

const OrderPrintView = ({ order }: OrderPrintViewProps) => {
  const [orderItems, setOrderItems] = useState<any[]>([]);
  
  useEffect(() => {
    const loadOrderItems = async () => {
      if (!order) return;
      
      try {
        // Parse order items from JSON if it's a string
        const items = typeof order.items === 'string' 
          ? JSON.parse(order.items) 
          : order.items;
          
        if (!Array.isArray(items) || items.length === 0) return;
        
        // Extract item IDs to fetch complete data
        const itemIds = items.map((item: any) => item.id).filter(Boolean);
        
        if (itemIds.length === 0) return;
        
        // Fetch item details from menu_items table
        const { data: menuItems } = await supabase
          .from('menu_items')
          .select('id, name, price')
          .in('id', itemIds);
        
        // Match order items with their details from the menu
        const completeItems = items.map((orderItem: any) => {
          const menuItem = menuItems?.find((item: MenuItem) => item.id === orderItem.id) || null;
          
          return {
            id: orderItem.id,
            name: menuItem?.name || 'Item não encontrado',
            price: menuItem?.price || orderItem.price || 0,
            quantity: orderItem.quantity || 1,
            subtotal: (orderItem.quantity || 1) * (menuItem?.price || orderItem.price || 0)
          };
        });
        
        setOrderItems(completeItems);
      } catch (error) {
        console.error('Erro ao processar itens do pedido:', error);
      }
    };
    
    loadOrderItems();
  }, [order?.items]);

  if (!order) return null;

  return (
    <div className="p-4 bg-white">
      <OrderReceiptContent order={order} orderItems={orderItems} />
    </div>
  );
};

export default OrderPrintView;
