
import { useState, useEffect } from 'react';
import { Order } from '@/types/Order';
import { MenuItem } from '@/types/MenuItem';
import { useAuth } from '@/contexts/AuthContext';

export const useOrderItems = (order: Order | null) => {
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { supabase } = useAuth();

  useEffect(() => {
    const fetchOrderItems = async () => {
      if (!order || !order.items) return;
      
      setIsLoading(true);
      
      try {
        // Parse items if they're a string
        let items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        
        if (!Array.isArray(items) || items.length === 0) {
          setOrderItems([]);
          return;
        }
        
        // Get all item IDs
        const itemIds = items.map((item: any) => item.id).filter(Boolean);
        
        if (itemIds.length === 0) {
          setOrderItems([]);
          return;
        }
        
        // Fetch complete item data from menu_items
        const { data, error } = await supabase
          .from('menu_items')
          .select('id, name, price')
          .in('id', itemIds);
        
        if (error) {
          console.error("Error fetching menu items:", error);
          return;
        }
        
        // Match order items with menu data
        const processedItems = items.map((item: any) => {
          const menuItem = data?.find((mi: MenuItem) => mi.id === item.id);
          
          return {
            id: item.id,
            name: menuItem?.name || item.name || 'Item sem nome',
            price: menuItem?.price || item.price || 0,
            quantity: item.quantity || 1,
            subtotal: (item.quantity || 1) * (menuItem?.price || item.price || 0)
          };
        });
        
        setOrderItems(processedItems);
      } catch (error) {
        console.error("Error processing order items", error);
        setOrderItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrderItems();
  }, [order, supabase]);

  return { orderItems, isLoading };
};
