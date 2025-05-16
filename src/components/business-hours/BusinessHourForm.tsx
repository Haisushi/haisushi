
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { BusinessHour, BusinessHourFormValues, dayNames } from '@/types/businessHours';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Clock } from 'lucide-react';
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// Define the form schema
const businessHourFormSchema = z.object({
  weekday: z.coerce.number().min(0).max(6),
  open_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Formato inválido. Use HH:MM (24h)',
  }),
  close_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Formato inválido. Use HH:MM (24h)',
  }),
  is_open: z.boolean().default(true),
});

interface BusinessHourFormProps {
  currentHour: BusinessHour | null;
  onSubmitSuccess: () => void;
}

const BusinessHourForm = ({ currentHour, onSubmitSuccess }: BusinessHourFormProps) => {
  const { supabase } = useAuth();
  const { toast } = useToast();

  const form = useForm<BusinessHourFormValues>({
    resolver: zodResolver(businessHourFormSchema),
    defaultValues: {
      weekday: currentHour?.weekday || 0,
      open_time: currentHour?.open_time || '08:00',
      close_time: currentHour?.close_time || '18:00',
      is_open: currentHour?.is_open ?? true,
    },
  });

  const onSubmit = async (values: BusinessHourFormValues) => {
    try {
      if (currentHour) {
        // Update existing hour
        const { error } = await supabase
          .from('operating_hours')
          .update({
            weekday: values.weekday,
            open_time: values.open_time,
            close_time: values.close_time,
            is_open: values.is_open,
          })
          .eq('id', currentHour.id);

        if (error) throw error;

        toast({
          title: 'Horário atualizado',
          description: 'O horário de funcionamento foi atualizado com sucesso.',
        });
      } else {
        // Check if day already exists
        const { data: existingData } = await supabase
          .from('operating_hours')
          .select('id')
          .eq('weekday', values.weekday)
          .single();

        if (existingData) {
          toast({
            title: 'Erro',
            description: 'Já existe um registro para este dia da semana.',
            variant: 'destructive',
          });
          return;
        }

        // Create new hour
        const { error } = await supabase
          .from('operating_hours')
          .insert({
            weekday: values.weekday,
            open_time: values.open_time,
            close_time: values.close_time,
            is_open: values.is_open,
          });

        if (error) throw error;

        toast({
          title: 'Horário criado',
          description: 'O horário de funcionamento foi criado com sucesso.',
        });
      }

      onSubmitSuccess();
    } catch (error) {
      console.error('Error saving business hour:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o horário de funcionamento.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {currentHour
            ? 'Editar Horário de Funcionamento'
            : 'Adicionar Horário de Funcionamento'}
        </DialogTitle>
        <DialogDescription>
          Defina o horário de funcionamento para um dia da semana.
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="weekday"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dia da Semana</FormLabel>
                <FormControl>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    {...field}
                    disabled={!!currentHour}
                  >
                    {dayNames.map((day, index) => (
                      <option key={day} value={index}>
                        {day}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="open_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horário de Abertura</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="08:00"
                        className="pl-8"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="close_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horário de Fechamento</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="18:00"
                        className="pl-8"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="is_open"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Status do Dia
                  </FormLabel>
                </div>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <span
                      className={`text-sm ${
                        field.value ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {field.value ? 'Aberto' : 'Fechado'}
                    </span>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button type="submit" className="bg-restaurant-primary hover:bg-restaurant-primary/90">
              {currentHour ? 'Salvar Alterações' : 'Adicionar Horário'}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
};

export default BusinessHourForm;
