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
import { Palmtree } from 'lucide-react';

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

  // Initialize form with default values
  const form = useForm<VacationFormValues>({
    resolver: zodResolver(vacationFormSchema),
    defaultValues: {
      vacation_message: '',
      is_on_vacation: false,
    },
  });

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

  // Handle form submission
  const onSubmit = async (values: VacationFormValues) => {
    try {
      const { error } = await supabase
        .from('restaurant_settings')
        .update({
          vacation_message: values.vacation_message,
          is_on_vacation: values.is_on_vacation,
        })
        .eq('id', (await supabase.from('restaurant_settings').select('id').limit(1).single()).data?.id);

      if (error) throw error;

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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Palmtree className="mr-2 h-5 w-5" />
          Configurações de Férias
        </CardTitle>
        <CardDescription>
          Configure a mensagem que seus clientes verão quando você estiver de férias.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-20 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-restaurant-primary"></div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="is_on_vacation"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Modo Férias</FormLabel>
                      <FormDescription>
                        Ative quando o restaurante estiver fechado por férias.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
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
                <Button type="submit" className="ml-auto bg-restaurant-primary hover:bg-restaurant-primary/90">
                  Salvar Configurações
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
