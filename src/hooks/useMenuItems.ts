
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { MenuItem } from '@/types/MenuItem';

export const useMenuItems = () => {
  const { supabase } = useAuth();
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<boolean | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      let query = supabase.from('menu_items').select('*');

      if (availabilityFilter !== null) {
        query = query.eq('is_available', availabilityFilter);
      }

      if (categoryFilter) {
        query = query.eq('category_name', categoryFilter);
      }

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order('display_order');

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os itens do cardápio.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    try {
      const newStatus = !item.is_available;
      
      const { error } = await supabase
        .from('menu_items')
        .update({ is_available: newStatus })
        .eq('id', item.id);

      if (error) throw error;

      setMenuItems(prevItems => 
        prevItems.map(prevItem => 
          prevItem.id === item.id 
            ? { ...prevItem, is_available: newStatus } 
            : prevItem
        )
      );

      toast({
        title: newStatus ? 'Item ativado' : 'Item desativado',
        description: `O item foi ${newStatus ? 'ativado' : 'desativado'} com sucesso.`,
      });
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar a disponibilidade do item.',
        variant: 'destructive',
      });
    }
  };

  const moveItemInOrder = async (item: MenuItem, direction: 'up' | 'down') => {
    try {
      // Find the item's current position in the current view (filtered items)
      const currentIndex = menuItems.findIndex(mi => mi.id === item.id);
      if (currentIndex === -1) return;
      
      // Can't move up if at the top, can't move down if at the bottom
      if ((direction === 'up' && currentIndex === 0) || 
          (direction === 'down' && currentIndex === menuItems.length - 1)) {
        return;
      }
      
      // Get the adjacent item
      const adjacentIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      const adjacentItem = menuItems[adjacentIndex];
      
      // Swap display_order values
      const newOrder = adjacentItem.display_order || 0;
      const adjacentNewOrder = item.display_order || 0;
      
      // Update current item order
      await supabase
        .from('menu_items')
        .update({ display_order: newOrder })
        .eq('id', item.id);
        
      // Update adjacent item order
      await supabase
        .from('menu_items')
        .update({ display_order: adjacentNewOrder })
        .eq('id', adjacentItem.id);
      
      // Re-fetch items to get updated order
      fetchMenuItems();
      
    } catch (error) {
      console.error('Error changing item order:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível reordenar os itens.',
        variant: 'destructive',
      });
    }
  };

  const deleteMenuItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: 'Item excluído',
        description: 'O item do cardápio foi excluído com sucesso.',
      });
      fetchMenuItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o item do cardápio.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, [searchTerm, availabilityFilter, categoryFilter]);

  return {
    menuItems,
    loading,
    searchTerm,
    setSearchTerm,
    availabilityFilter,
    setAvailabilityFilter,
    categoryFilter,
    setCategoryFilter,
    fetchMenuItems,
    toggleAvailability,
    moveItemInOrder,
    deleteMenuItem
  };
};
