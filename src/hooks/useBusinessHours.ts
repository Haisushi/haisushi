
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { BusinessHour, dayNames } from '@/types/businessHours';

export const useBusinessHours = () => {
  const { supabase } = useAuth();
  const { toast } = useToast();
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBusinessHours = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('operating_hours')
        .select('*')
        .order('weekday');

      if (error) throw error;
      
      // Map the data to our BusinessHour type
      const mappedData: BusinessHour[] = data.map(item => ({
        id: item.id,
        weekday: item.weekday,
        open_time: item.open_time,
        close_time: item.close_time,
        is_open: item.is_open
      }));
      
      setBusinessHours(mappedData);
    } catch (error) {
      console.error('Error fetching business hours:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os horários de funcionamento.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleOpenStatus = async (hour: BusinessHour) => {
    try {
      const { error } = await supabase
        .from('operating_hours')
        .update({ is_open: !hour.is_open })
        .eq('id', hour.id);

      if (error) throw error;

      fetchBusinessHours();
      toast({
        title: hour.is_open ? 'Dia fechado' : 'Dia aberto',
        description: `${dayNames[hour.weekday]} ${
          hour.is_open ? 'marcado como fechado' : 'marcado como aberto'
        }.`,
      });
    } catch (error) {
      console.error('Error toggling status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status do dia.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchBusinessHours();
  }, []);

  return {
    businessHours,
    loading,
    fetchBusinessHours,
    toggleOpenStatus
  };
};
