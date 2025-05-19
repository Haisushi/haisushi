
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { BusinessHour, dayNames } from '@/types/businessHours';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Define props type
type BusinessHourFormProps = {
  currentHour: BusinessHour | null;
  onSubmitSuccess: () => void;
};

// Define form schema
const businessHourFormSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  open_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Horário inválido. Use o formato HH:MM (24h).',
  }),
  close_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Horário inválido. Use o formato HH:MM (24h).',
  }),
  is_open: z.boolean().default(true),
});

type BusinessHourFormValues = z.infer<typeof businessHourFormSchema>;

const BusinessHourForm = ({ currentHour, onSubmitSuccess }: BusinessHourFormProps) => {
  const { supabase } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const formatTimeForForm = (time: string) => {
    if (!time) return '00:00';
    // Extract HH:MM from HH:MM:SS
    return time.substring(0, 5);
  };

  const form = useForm<BusinessHourFormValues>({
    resolver: zodResolver(businessHourFormSchema),
    defaultValues: currentHour
      ? {
          weekday: currentHour.weekday,
          open_time: formatTimeForForm(currentHour.open_time),
          close_time: formatTimeForForm(currentHour.close_time),
          is_open: currentHour.is_open,
        }
      : {
          weekday: 0,
          open_time: '08:00',
          close_time: '18:00',
          is_open: true,
        },
  });

  const onSubmit = async (values: BusinessHourFormValues) => {
    setSubmitting(true);
    try {
      // Check if a business hour already exists for this weekday
      if (!currentHour) {
        const { data: existingData } = await supabase
          .from('operating_hours')
          .select('id')
          .eq('weekday', values.weekday)
          .maybeSingle();

        if (existingData) {
          toast({
            title: 'Erro',
            description: 'Já existe um horário definido para este dia da semana.',
            variant: 'destructive',
          });
          setSubmitting(false);
          return;
        }
      }

      if (currentHour) {
        // Update existing business hour
        const { error } = await supabase
          .from('operating_hours')
          .update({
            open_time: values.open_time,
            close_time: values.close_time,
            is_open: values.is_open,
          })
          .eq('id', currentHour.id);

        if (error) throw error;

        toast({
          title: 'Horário atualizado',
          description: `Horário de ${dayNames[currentHour.weekday]} atualizado.`,
        });
      } else {
        // Create new business hour
        const { error } = await supabase.from('operating_hours').insert({
          weekday: values.weekday,
          open_time: values.open_time,
          close_time: values.close_time,
          is_open: values.is_open,
        });

        if (error) throw error;

        toast({
          title: 'Horário adicionado',
          description: `Horário para ${dayNames[values.weekday]} adicionado.`,
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
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {currentHour ? 'Editar Horário' : 'Adicionar Horário'}
        </DialogTitle>
        <DialogDescription>
          {currentHour
            ? `Editar horário de funcionamento para ${dayNames[currentHour.weekday]}.`
            : 'Adicionar novo horário de funcionamento.'}
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {!currentHour && (
            <FormField
              control={form.control}
              name="weekday"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dia da Semana</FormLabel>
                  <FormControl>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      {...field}
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    >
                      {dayNames.map((day, index) => (
                        <option key={index} value={index}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="open_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horário de Abertura</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
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
                    <Input type="time" {...field} />
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
              <FormItem className="flex flex-row items-center justify-between">
                <FormLabel>Aberto</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button
              type="submit"
              className="bg-restaurant-primary hover:bg-restaurant-primary/90"
              disabled={submitting}
            >
              {submitting ? 'Salvando...' : currentHour ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
};

export default BusinessHourForm;
