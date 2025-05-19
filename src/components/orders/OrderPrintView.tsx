
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import { Order } from '@/types/Order';
import { formatPhone } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { MenuItem } from '@/types/MenuItem';

interface OrderPrintViewProps {
  order: Order;
}

const OrderPrintView = ({ order }: OrderPrintViewProps) => {
  const orderDate = format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR });
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

  // Format currency for display
  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'R$ 0,00';
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  return (
    <div className="p-4 bg-white">
      <div className="receipt-info space-y-2">
        <div><strong>Data:</strong> {orderDate}</div>
        <div><strong>Cliente:</strong> {order.customer_name || 'N/A'}</div>
        <div><strong>Telefone:</strong> {formatPhone(order.customer_phone)}</div>
        <div><strong>Endereço:</strong> {order.delivery_address || 'N/A'}</div>
        {order.bairro && <div><strong>Bairro:</strong> {order.bairro}</div>}
      </div>
      
      <div className="receipt-line my-2 border-t border-gray-300"></div>
      
      <div className="receipt-items space-y-1">
        <strong>ITENS DO PEDIDO:</strong>
        {orderItems.length > 0 ? (
          <div className="space-y-1">
            {orderItems.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span>{item.quantity}x {item.name}</span>
                <span>{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div>Carregando itens...</div>
        )}
      </div>
      
      <div className="receipt-line my-2 border-t border-gray-300"></div>
      
      <div className="receipt-total space-y-1">
        <div className="flex justify-between">
          <strong>Subtotal:</strong>
          <span>{formatCurrency(order.order_amount)}</span>
        </div>
        <div className="flex justify-between">
          <strong>Taxa de entrega:</strong>
          <span>{formatCurrency(order.delivery_fee)}</span>
        </div>
        <div className="flex justify-between">
          <strong>TOTAL:</strong>
          <span className="font-bold">{formatCurrency(order.total_amount)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderPrintView;
