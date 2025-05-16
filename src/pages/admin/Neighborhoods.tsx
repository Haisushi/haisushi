
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

// Define the neighborhood type
type Neighborhood = {
  id: number;
  name: string;
  delivery_fee: number;
};

// Define the form schema
const neighborhoodFormSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Nome precisa ter no mínimo 3 caracteres' })
    .transform(val => val.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")),
  delivery_fee: z.coerce
    .number()
    .min(0, { message: 'A taxa de entrega não pode ser negativa' }),
});

type NeighborhoodFormValues = z.infer<typeof neighborhoodFormSchema>;

const Neighborhoods = () => {
  const { supabase } = useAuth();
  const { toast } = useToast();
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [currentNeighborhood, setCurrentNeighborhood] = useState<Neighborhood | null>(null);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const form = useForm<NeighborhoodFormValues>({
    resolver: zodResolver(neighborhoodFormSchema),
    defaultValues: {
      name: '',
      delivery_fee: 0,
    },
  });

  // Fetch neighborhoods
  const fetchNeighborhoods = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('neighborhoods')
        .select('*')
        .order('name');

      if (error) throw error;
      setNeighborhoods(data || []);
    } catch (error) {
      console.error('Error fetching neighborhoods:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os bairros.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNeighborhoods();
  }, []);

  const openEditDialog = (neighborhood: Neighborhood) => {
    setCurrentNeighborhood(neighborhood);
    form.reset({
      name: neighborhood.name,
      delivery_fee: neighborhood.delivery_fee,
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setCurrentNeighborhood(null);
    form.reset({
      name: '',
      delivery_fee: 0,
    });
    setIsDialogOpen(true);
  };

  const confirmDelete = (id: number) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (itemToDelete === null) return;

    try {
      const { error } = await supabase
        .from('neighborhoods')
        .delete()
        .eq('id', itemToDelete);

      if (error) throw error;

      toast({
        title: 'Bairro excluído',
        description: 'O bairro foi excluído com sucesso.',
      });
      fetchNeighborhoods();
    } catch (error) {
      console.error('Error deleting neighborhood:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o bairro.',
        variant: 'destructive',
      });
    } finally {
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  const onSubmit = async (values: NeighborhoodFormValues) => {
    try {
      // Check if neighborhood already exists (but not the current one being edited)
      if (!currentNeighborhood) {
        const { data: existingData } = await supabase
          .from('neighborhoods')
          .select('id')
          .eq('name', values.name)
          .maybeSingle();

        if (existingData) {
          toast({
            title: 'Erro',
            description: 'Este bairro já existe.',
            variant: 'destructive',
          });
          return;
        }
      }

      if (currentNeighborhood) {
        // Update existing neighborhood
        const { error } = await supabase
          .from('neighborhoods')
          .update({
            name: values.name,
            delivery_fee: values.delivery_fee,
          })
          .eq('id', currentNeighborhood.id);

        if (error) throw error;

        toast({
          title: 'Bairro atualizado',
          description: 'O bairro foi atualizado com sucesso.',
        });
      } else {
        // Create new neighborhood
        const { error } = await supabase.from('neighborhoods').insert({
          name: values.name,
          delivery_fee: values.delivery_fee,
        });

        if (error) throw error;

        toast({
          title: 'Bairro criado',
          description: 'O bairro foi criado com sucesso.',
        });
      }

      setIsDialogOpen(false);
      fetchNeighborhoods();
    } catch (error) {
      console.error('Error saving neighborhood:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o bairro.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Bairros</h1>
        <Button onClick={openCreateDialog} className="bg-restaurant-primary hover:bg-restaurant-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Adicionar Bairro
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Bairros e Taxas de Entrega</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-restaurant-primary"></div>
            </div>
          ) : neighborhoods.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-muted-foreground">Nenhum bairro cadastrado</p>
              <Button onClick={openCreateDialog} className="mt-4">
                Adicionar Primeiro Bairro
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bairro</TableHead>
                  <TableHead className="text-right">Taxa de Entrega (R$)</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {neighborhoods.map((neighborhood) => (
                  <TableRow key={neighborhood.id}>
                    <TableCell className="font-medium flex items-center">
                      <MapPin className="mr-2 h-4 w-4 text-restaurant-primary" />
                      {neighborhood.name}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {neighborhood.delivery_fee.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(neighborhood)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => confirmDelete(neighborhood.id)}
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

      {/* Neighborhood Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {currentNeighborhood ? 'Editar Bairro' : 'Adicionar Bairro'}
            </DialogTitle>
            <DialogDescription>
              {currentNeighborhood
                ? 'Atualize os dados do bairro e taxa de entrega.'
                : 'Adicione um novo bairro e defina a taxa de entrega.'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Bairro</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Nome do bairro"
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
                  {currentNeighborhood ? 'Atualizar Bairro' : 'Adicionar Bairro'}
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
              Esta ação não pode ser desfeita. Este bairro será permanentemente removido do sistema.
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

export default Neighborhoods;
