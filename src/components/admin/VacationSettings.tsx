
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Palmtree, CalendarOff } from 'lucide-react';
import { animate } from '@/lib/animations';
import { cn } from '@/lib/utils';

// Define schema for vacation settings form
const vacationFormSchema = z.object({
  vacation_message: z.string().max(500, {
    message: 'A mensagem de férias não pode ter mais de 500 caracteres',
  }),
  is_on_vacation: z.boolean(),
});

type VacationFormValues = z.infer<typeof vacationFormSchema>;

const VacationSettings = () => {
  const { supabase } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [processingVacation, setProcessingVacation] = useState(false);

  // Initialize form with default values
  const form = useForm<VacationFormValues>({
    resolver: zodResolver(vacationFormSchema),
    defaultValues: {
      vacation_message: '',
      is_on_vacation: false,
    },
  });

  const watchVacationMode = form.watch('is_on_vacation');

  // Fetch existing settings
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('restaurant_settings')
          .select('*')
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          form.reset({
            vacation_message: data.vacation_message || '',
            is_on_vacation: data.is_on_vacation || false,
          });
        }
      } catch (error) {
        console.error('Error fetching vacation settings:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as configurações de férias.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [supabase, toast]);

  // Update business hours when vacation mode changes
  const updateBusinessHours = async (isOnVacation: boolean) => {
    if (!isOnVacation) return; // Only update when vacation mode is turned ON
    
    setProcessingVacation(true);
    try {
      // Update all business hours to closed when vacation mode is enabled
      const { error } = await supabase
        .from('operating_hours')
        .update({ is_open: false })
        .neq('id', ''); // This condition applies to all records
        
      if (error) throw error;
      
      toast({
        title: 'Horários atualizados',
        description: 'Todos os dias foram marcados como fechados.',
      });
    } catch (error) {
      console.error('Error updating business hours:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar os horários de funcionamento.',
        variant: 'destructive',
      });
    } finally {
      setProcessingVacation(false);
    }
  };

  // Handle form submission
  const onSubmit = async (values: VacationFormValues) => {
    try {
      // Get settings id first (or create if doesn't exist)
      let settingsId: string;
      const { data: existingSettings, error: fetchError } = await supabase
        .from('restaurant_settings')
        .select('id')
        .limit(1)
        .single();
      
      if (fetchError && fetchError.code === 'PGRST116') {
        // Settings don't exist, create them
        const { data: newSettings, error: insertError } = await supabase
          .from('restaurant_settings')
          .insert({
            vacation_message: values.vacation_message,
            is_on_vacation: values.is_on_vacation,
          })
          .select('id')
          .single();
          
        if (insertError) throw insertError;
        settingsId = newSettings?.id;
      } else if (fetchError) {
        throw fetchError;
      } else {
        settingsId = existingSettings.id;
        
        // Update existing settings
        const { error: updateError } = await supabase
          .from('restaurant_settings')
          .update({
            vacation_message: values.vacation_message,
            is_on_vacation: values.is_on_vacation,
          })
          .eq('id', settingsId);
          
        if (updateError) throw updateError;
      }

      // If vacation mode was enabled, update business hours
      if (values.is_on_vacation) {
        await updateBusinessHours(values.is_on_vacation);
      }

      toast({
        title: 'Configurações atualizadas',
        description: 'As configurações de férias foram atualizadas com sucesso.',
      });
    } catch (error) {
      console.error('Error updating vacation settings:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações de férias.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className={cn("w-full border-none shadow-lg overflow-hidden bg-white/80 backdrop-blur-sm", animate({ variant: "fade-in", delay: 100 }))}>
      <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
        <CardTitle className="flex items-center text-xl text-amber-800">
          <Palmtree className="mr-2 h-5 w-5 text-amber-600" />
          Configurações de Férias
        </CardTitle>
        <CardDescription className="text-amber-700/80">
          Configure a mensagem que seus clientes verão quando você estiver de férias.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <div className="h-20 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="is_on_vacation"
                render={({ field }) => (
                  <FormItem className={cn(
                    "flex flex-row items-center justify-between rounded-lg border p-4",
                    field.value ? "bg-amber-50 border-amber-200" : "bg-white border-gray-200"
                  )}>
                    <div className="space-y-0.5">
                      <FormLabel className="text-base flex items-center">
                        <CalendarOff className={cn("mr-2 h-4 w-4", field.value ? "text-amber-600" : "text-gray-500")} />
                        Modo Férias
                      </FormLabel>
                      <FormDescription className={field.value ? "text-amber-700/80" : "text-gray-500"}>
                        Ative quando o restaurante estiver fechado por férias.
                        {field.value && " Todos os dias serão marcados como fechados."}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                        }}
                        className={field.value ? "data-[state=checked]:bg-amber-500" : ""}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vacation_message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensagem de Férias</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Estamos de férias e retornaremos no dia XX/XX. Agradecemos sua compreensão!"
                        {...field}
                        rows={4}
                        className="bg-white border border-gray-200"
                      />
                    </FormControl>
                    <FormDescription>
                      Essa mensagem será mostrada aos clientes quando o modo férias estiver ativo.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <CardFooter className="px-0">
                <Button 
                  type="submit" 
                  className={cn(
                    "ml-auto transition-all", 
                    watchVacationMode 
                      ? "bg-amber-500 hover:bg-amber-600" 
                      : "bg-restaurant-primary hover:bg-restaurant-primary/90"
                  )}
                  disabled={processingVacation}
                >
                  {processingVacation ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
                      Processando...
                    </>
                  ) : "Salvar Configurações"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
};

export default VacationSettings;
