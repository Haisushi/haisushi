
import { useState, useEffect } from 'react';
import { Order } from '@/types/Order';
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
  
  // If address is a string, return it directly
  if (typeof address === 'string') return address;
  
  // If address is an object with address properties, format it
  if (typeof address === 'object') {
    try {
      const addressObj = typeof address === 'string' ? JSON.parse(address) : address;
      const { logradouro, numero, complemento, bairro, localidade, uf } = addressObj as any;
      
      const addressParts = [];
      if (logradouro) addressParts.push(logradouro);
      if (numero) addressParts.push(numero);
      if (complemento) addressParts.push(complemento);
      
      return addressParts.filter(Boolean).join(', ');
    } catch (e) {
      return JSON.stringify(address);
    }
  }
  
  // Fallback: convert to string
  return String(address);
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
