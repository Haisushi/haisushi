import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Edit, MapPin, Plus, Trash2 } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { DeliveryZone, DeliveryZoneFormValues } from '@/types/DeliveryZone';

// Define the form schema
const deliveryZoneFormSchema = z.object({
  min_distance: z.coerce.number().min(0, { message: 'A distância mínima não pode ser negativa' }),
  max_distance: z.coerce.number().min(0, { message: 'A distância máxima não pode ser negativa' }),
  delivery_fee: z.coerce.number().min(0, { message: 'A taxa de entrega não pode ser negativa' }),
}).refine((data) => data.max_distance > data.min_distance, {
  message: "A distância máxima deve ser maior que a distância mínima",
  path: ["max_distance"],
});

const DeliveryZones = () => {
  const { supabase } = useAuth();
  const { toast } = useToast();
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [currentZone, setCurrentZone] = useState<DeliveryZone | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const form = useForm<DeliveryZoneFormValues>({
    resolver: zodResolver(deliveryZoneFormSchema),
    defaultValues: {
      min_distance: 0,
      max_distance: 1,
      delivery_fee: 0,
    },
  });

  // Fetch zones
  const fetchZones = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('delivery_zones')
        .select('*')
        .order('min_distance');

      if (error) throw error;
      setZones(data || []);
    } catch (error) {
      console.error('Error fetching delivery zones:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as zonas de entrega.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const openEditDialog = (zone: DeliveryZone) => {
    setCurrentZone(zone);
    form.reset({
      min_distance: zone.min_distance,
      max_distance: zone.max_distance,
      delivery_fee: zone.delivery_fee,
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setCurrentZone(null);
    form.reset({
      min_distance: 0,
      max_distance: 1,
      delivery_fee: 0,
    });
    setIsDialogOpen(true);
  };

  const confirmDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (itemToDelete === null) return;

    try {
      const { error } = await supabase
        .from('delivery_zones')
        .delete()
        .eq('id', itemToDelete);

      if (error) throw error;

      toast({
        title: 'Zona excluída',
        description: 'A zona de entrega foi excluída com sucesso.',
      });
      fetchZones();
    } catch (error) {
      console.error('Error deleting delivery zone:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a zona de entrega.',
        variant: 'destructive',
      });
    } finally {
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  const onSubmit = async (values: DeliveryZoneFormValues) => {
    try {
      if (currentZone) {
        // Update existing zone
        const { error } = await supabase
          .from('delivery_zones')
          .update({
            min_distance: values.min_distance,
            max_distance: values.max_distance,
            delivery_fee: values.delivery_fee,
          })
          .eq('id', currentZone.id);

        if (error) throw error;

        toast({
          title: 'Zona atualizada',
          description: 'A zona de entrega foi atualizada com sucesso.',
        });
      } else {
        // Create new zone
        const { error } = await supabase.from('delivery_zones').insert({
          min_distance: values.min_distance,
          max_distance: values.max_distance,
          delivery_fee: values.delivery_fee,
        });

        if (error) throw error;

        toast({
          title: 'Zona criada',
          description: 'A zona de entrega foi criada com sucesso.',
        });
      }

      setIsDialogOpen(false);
      fetchZones();
    } catch (error) {
      console.error('Error saving delivery zone:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a zona de entrega.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Zonas de Entrega</h1>
        <Button onClick={openCreateDialog} className="bg-restaurant-primary hover:bg-restaurant-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Nova Zona
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Taxas de Entrega por Distância</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-restaurant-primary"></div>
            </div>
          ) : zones.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-muted-foreground">Nenhuma zona cadastrada</p>
              <Button onClick={openCreateDialog} className="mt-4">
                Adicionar Primeira Zona
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Distância Mínima (km)</TableHead>
                  <TableHead>Distância Máxima (km)</TableHead>
                  <TableHead className="text-right">Taxa de Entrega (R$)</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {zones.map((zone) => (
                  <TableRow key={zone.id}>
                    <TableCell className="font-medium">{zone.min_distance}</TableCell>
                    <TableCell>{zone.max_distance}</TableCell>
                    <TableCell className="text-right font-mono">
                      {zone.delivery_fee.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(zone)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => confirmDelete(zone.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Zone Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {currentZone ? 'Editar Zona' : 'Nova Zona'}
            </DialogTitle>
            <DialogDescription>
              {currentZone
                ? 'Atualize os dados da zona de entrega.'
                : 'Defina uma nova zona de entrega e sua taxa.'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="min_distance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Distância Mínima (km)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_distance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Distância Máxima (km)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="1"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="delivery_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taxa de Entrega (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" className="bg-restaurant-primary hover:bg-restaurant-primary/90">
                  {currentZone ? 'Atualizar Zona' : 'Criar Zona'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. Esta zona será permanentemente removida do sistema.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliveryZones;