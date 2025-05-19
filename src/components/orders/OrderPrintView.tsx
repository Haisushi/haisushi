
import { useState, useEffect } from 'react';
import { Order } from '@/types/Order';
import { supabase } from '@/integrations/supabase/client';
import { MenuItem } from '@/types/MenuItem';
import { useOrderItems } from './hooks/useOrderItems';
import { OrderReceiptContent } from './OrderReceiptContent';

interface OrderPrintViewProps {
  order: Order;
}

const OrderPrintView = ({ order }: OrderPrintViewProps) => {
  const [orderItems, setOrderItems] = useState<any[]>([]);
  
  useEffect(() => {
    const loadOrderItems = async () => {
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
  }, [order.items]);

  return (
    <div className="p-4 bg-white">
      <OrderReceiptContent order={order} orderItems={orderItems} />
    </div>
  );
};

export default OrderPrintView;
