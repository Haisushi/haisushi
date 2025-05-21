
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { MenuCategory } from '@/types/MenuItem';

export const useMenuCategories = () => {
  const { supabase } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as categorias.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (categoryId: string | null | undefined) => {
    if (!categoryId) return 'Sem categoria';
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Categoria desconhecida';
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    fetchCategories,
    getCategoryName
  };
};
