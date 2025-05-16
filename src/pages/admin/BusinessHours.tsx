
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Clock, Edit, Plus } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Define the business hour type
type BusinessHour = {
  id: number;
  day_of_week: number;
  opening_time: string;
  closing_time: string;
  is_open: boolean;
};

// Map day of week number to name
const dayNames = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

// Define the form schema
const businessHourFormSchema = z.object({
  day_of_week: z.coerce.number().min(0).max(6),
  opening_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Formato inválido. Use HH:MM (24h)',
  }),
  closing_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Formato inválido. Use HH:MM (24h)',
  }),
  is_open: z.boolean().default(true),
});

type BusinessHourFormValues = z.infer<typeof businessHourFormSchema>;

const BusinessHours = () => {
  const { supabase } = useAuth();
  const { toast } = useToast();
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentHour, setCurrentHour] = useState<BusinessHour | null>(null);

  const form = useForm<BusinessHourFormValues>({
    resolver: zodResolver(businessHourFormSchema),
    defaultValues: {
      day_of_week: 0,
      opening_time: '08:00',
      closing_time: '18:00',
      is_open: true,
    },
  });

  // Fetch business hours
  const fetchBusinessHours = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('business_hours')
        .select('*')
        .order('day_of_week');

      if (error) throw error;
      setBusinessHours(data || []);
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

  useEffect(() => {
    fetchBusinessHours();
  }, []);

  const openEditDialog = (hour: BusinessHour) => {
    setCurrentHour(hour);
    form.reset({
      day_of_week: hour.day_of_week,
      opening_time: hour.opening_time,
      closing_time: hour.closing_time,
      is_open: hour.is_open,
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setCurrentHour(null);
    form.reset({
      day_of_week: 0,
      opening_time: '08:00',
      closing_time: '18:00',
      is_open: true,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: BusinessHourFormValues) => {
    try {
      if (currentHour) {
        // Update existing hour
        const { error } = await supabase
          .from('business_hours')
          .update({
            day_of_week: values.day_of_week,
            opening_time: values.opening_time,
            closing_time: values.closing_time,
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
          .from('business_hours')
          .select('id')
          .eq('day_of_week', values.day_of_week)
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
        const { error } = await supabase.from('business_hours').insert({
          day_of_week: values.day_of_week,
          opening_time: values.opening_time,
          closing_time: values.closing_time,
          is_open: values.is_open,
        });

        if (error) throw error;

        toast({
          title: 'Horário criado',
          description: 'O horário de funcionamento foi criado com sucesso.',
        });
      }

      setIsDialogOpen(false);
      fetchBusinessHours();
    } catch (error) {
      console.error('Error saving business hour:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o horário de funcionamento.',
        variant: 'destructive',
      });
    }
  };

  const toggleOpenStatus = async (hour: BusinessHour) => {
    try {
      const { error } = await supabase
        .from('business_hours')
        .update({ is_open: !hour.is_open })
        .eq('id', hour.id);

      if (error) throw error;

      fetchBusinessHours();
      toast({
        title: hour.is_open ? 'Dia fechado' : 'Dia aberto',
        description: `${dayNames[hour.day_of_week]} ${
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Horários de Funcionamento</h1>
        <Button onClick={openCreateDialog} className="bg-restaurant-primary hover:bg-restaurant-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Adicionar Horário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Horários por Dia da Semana</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-restaurant-primary"></div>
            </div>
          ) : businessHours.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-muted-foreground">Nenhum horário definido</p>
              <Button onClick={openCreateDialog} className="mt-4">
                Adicionar Primeiro Horário
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dia da Semana</TableHead>
                  <TableHead>Horário de Abertura</TableHead>
                  <TableHead>Horário de Fechamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {businessHours.map((hour) => (
                  <TableRow key={hour.id}>
                    <TableCell className="font-medium">
                      {dayNames[hour.day_of_week]}
                    </TableCell>
                    <TableCell>{hour.opening_time}</TableCell>
                    <TableCell>{hour.closing_time}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={hour.is_open}
                          onCheckedChange={() => toggleOpenStatus(hour)}
                        />
                        <span
                          className={`text-sm ${
                            hour.is_open ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {hour.is_open ? 'Aberto' : 'Fechado'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(hour)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Business Hours Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
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
                name="day_of_week"
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
                  name="opening_time"
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
                  name="closing_time"
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
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessHours;
