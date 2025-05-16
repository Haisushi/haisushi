
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
import { Input } from '@/components/ui/input';
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MenuItem, MenuItemFormValues } from '@/types/MenuItem';

// Define the form schema
const menuItemFormSchema = z.object({
  name: z.string().min(3, { message: 'Nome precisa ter no mínimo 3 caracteres' }),
  description: z.string().min(5, { message: 'Descrição precisa ter no mínimo 5 caracteres' }),
  price: z.coerce.number().positive({ message: 'O preço deve ser um valor positivo' }),
  is_available: z.boolean().default(true),
});

const MenuItems = () => {
  const { supabase } = useAuth();
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<boolean | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentMenuItem, setCurrentMenuItem] = useState<MenuItem | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      is_available: true,
    },
  });

  // Fetch menu items
  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      let query = supabase.from('menu_items').select('*');

      if (availabilityFilter !== null) {
        query = query.eq('is_available', availabilityFilter);
      }

      if (searchTerm) {
        // If using vector search, you'd call a function here
        // For now, doing a simple text search
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os itens do cardápio.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, [searchTerm, availabilityFilter]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const openEditDialog = (item: MenuItem) => {
    setCurrentMenuItem(item);
    form.reset({
      name: item.name,
      description: item.description,
      price: item.price,
      is_available: item.is_available,
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setCurrentMenuItem(null);
    form.reset({
      name: '',
      description: '',
      price: 0,
      is_available: true,
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
        .from('menu_items')
        .delete()
        .eq('id', itemToDelete);

      if (error) throw error;

      toast({
        title: 'Item excluído',
        description: 'O item do cardápio foi excluído com sucesso.',
      });
      fetchMenuItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o item do cardápio.',
        variant: 'destructive',
      });
    } finally {
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  const onSubmit = async (values: MenuItemFormValues) => {
    try {
      // Generate a simple embedding for the search
      // In a real app, you'd call an API to generate this
      const mockEmbedding = Array(3).fill(0).map(() => Math.random());
      
      if (currentMenuItem) {
        // Update existing item
        const { error } = await supabase
          .from('menu_items')
          .update({
            name: values.name,
            description: values.description,
            price: values.price,
            is_available: values.is_available,
            // If we had embeddings, we'd update them here
          })
          .eq('id', currentMenuItem.id);

        if (error) throw error;

        toast({
          title: 'Item atualizado',
          description: 'O item do cardápio foi atualizado com sucesso.',
        });
      } else {
        // Create new item
        const { error } = await supabase.from('menu_items').insert({
          name: values.name,
          description: values.description,
          price: values.price,
          is_available: values.is_available,
          embedding: mockEmbedding,
        });

        if (error) throw error;

        toast({
          title: 'Item criado',
          description: 'O item do cardápio foi criado com sucesso.',
        });
      }

      setIsDialogOpen(false);
      fetchMenuItems();
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o item do cardápio.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Cardápio</h1>
        <Button onClick={openCreateDialog} className="bg-restaurant-primary hover:bg-restaurant-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Adicionar Item
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou descrição..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-8"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant={availabilityFilter === null ? "default" : "outline"}
              onClick={() => setAvailabilityFilter(null)}
            >
              Todos
            </Button>
            <Button
              variant={availabilityFilter === true ? "default" : "outline"}
              onClick={() => setAvailabilityFilter(true)}
            >
              Disponíveis
            </Button>
            <Button
              variant={availabilityFilter === false ? "default" : "outline"}
              onClick={() => setAvailabilityFilter(false)}
            >
              Indisponíveis
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-restaurant-primary"></div>
            </div>
          ) : menuItems.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-muted-foreground">Nenhum item encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead>Disponibilidade</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menuItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="max-w-[300px] truncate">{item.description}</TableCell>
                      <TableCell className="text-right">R$ {item.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            item.is_available
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.is_available ? 'Disponível' : 'Indisponível'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => confirmDelete(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Menu Item Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {currentMenuItem ? 'Editar Item do Cardápio' : 'Adicionar Item ao Cardápio'}
            </DialogTitle>
            <DialogDescription>
              Preencha os detalhes do item do cardápio abaixo.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do item" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descrição do item" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço (R$)</FormLabel>
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

              <FormField
                control={form.control}
                name="is_available"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>Disponível</FormLabel>
                      <FormDescription>
                        O item está disponível para venda?
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

              <DialogFooter>
                <Button type="submit" className="bg-restaurant-primary hover:bg-restaurant-primary/90">
                  {currentMenuItem ? 'Salvar Alterações' : 'Criar Item'}
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
              Esta ação não pode ser desfeita. Este item será permanentemente excluído do cardápio.
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertDescription>
              Todos os dados relacionados a este item serão removidos.
            </AlertDescription>
          </Alert>
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

export default MenuItems;
