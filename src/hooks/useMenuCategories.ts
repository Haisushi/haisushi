
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

// Since we don't use menu categories anymore, this hook is simplified
// to just extract unique categories from menu items instead
export const useMenuCategories = () => {
  const { supabase } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('menu_items')
        .select('category_name')
        .not('category_name', 'is', null);

      if (error) throw error;
      
      // Extract unique category names
      const uniqueCategories = Array.from(new Set(
        data
          .map(item => item.category_name)
          .filter(Boolean) // Remove nulls
      )) as string[];
      
      setCategories(uniqueCategories);
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

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    fetchCategories
  };
};
