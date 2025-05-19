
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
  CardDescription,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Plus, Search, Trash2, ArrowUp, ArrowDown, Check, X } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MenuItem, MenuItemFormValues, MenuCategory } from '@/types/MenuItem';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategoryManager } from '@/components/admin/CategoryManager';
import { animate } from '@/lib/animations';
import { cn } from '@/lib/utils';

// Define the form schema
const menuItemFormSchema = z.object({
  name: z.string().min(3, { message: 'Nome precisa ter no mínimo 3 caracteres' }),
  description: z.string().min(5, { message: 'Descrição precisa ter no mínimo 5 caracteres' }),
  price: z.coerce.number().positive({ message: 'O preço deve ser um valor positivo' }),
  is_available: z.boolean().default(true),
  category_id: z.string().nullable(),
  display_order: z.coerce.number().int().nonnegative().default(0),
});

const MenuItems = () => {
  const { supabase } = useAuth();
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<boolean | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
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
      category_id: null,
      display_order: 0,
    },
  });

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as categorias.',
        variant: 'destructive',
      });
    }
  };

  // Fetch menu items
  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      let query = supabase.from('menu_items').select('*');

      if (availabilityFilter !== null) {
        query = query.eq('is_available', availabilityFilter);
      }

      if (categoryFilter) {
        query = query.eq('category_id', categoryFilter);
      }

      if (searchTerm) {
        // If using vector search, you'd call a function here
        // For now, doing a simple text search
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order('display_order');

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
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, [searchTerm, availabilityFilter, categoryFilter]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const toggleAvailability = async (item: MenuItem) => {
    try {
      const newStatus = !item.is_available;
      
      const { error } = await supabase
        .from('menu_items')
        .update({ is_available: newStatus })
        .eq('id', item.id);

      if (error) throw error;

      setMenuItems(prevItems => 
        prevItems.map(prevItem => 
          prevItem.id === item.id 
            ? { ...prevItem, is_available: newStatus } 
            : prevItem
        )
      );

      toast({
        title: newStatus ? 'Item ativado' : 'Item desativado',
        description: `O item foi ${newStatus ? 'ativado' : 'desativado'} com sucesso.`,
      });
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar a disponibilidade do item.',
        variant: 'destructive',
      });
    }
  };

  const moveItemInOrder = async (item: MenuItem, direction: 'up' | 'down') => {
    try {
      // Find the item's current position in the current view (filtered items)
      const currentIndex = menuItems.findIndex(mi => mi.id === item.id);
      if (currentIndex === -1) return;
      
      // Can't move up if at the top, can't move down if at the bottom
      if ((direction === 'up' && currentIndex === 0) || 
          (direction === 'down' && currentIndex === menuItems.length - 1)) {
        return;
      }
      
      // Get the adjacent item
      const adjacentIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      const adjacentItem = menuItems[adjacentIndex];
      
      // Swap display_order values
      const newOrder = adjacentItem.display_order || 0;
      const adjacentNewOrder = item.display_order || 0;
      
      // Update current item order
      await supabase
        .from('menu_items')
        .update({ display_order: newOrder })
        .eq('id', item.id);
        
      // Update adjacent item order
      await supabase
        .from('menu_items')
        .update({ display_order: adjacentNewOrder })
        .eq('id', adjacentItem.id);
      
      // Re-fetch items to get updated order
      fetchMenuItems();
      
    } catch (error) {
      console.error('Error changing item order:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível reordenar os itens.',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (item: MenuItem) => {
    setCurrentMenuItem(item);
    form.reset({
      name: item.name,
      description: item.description || '',
      price: item.price,
      is_available: item.is_available || false,
      category_id: item.category_id || null,
      display_order: item.display_order || 0,
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
      category_id: null,
      display_order: menuItems.length > 0 
        ? Math.max(...menuItems.map(item => item.display_order || 0)) + 1 
        : 0,
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
      if (currentMenuItem) {
        // Update existing item
        const { error } = await supabase
          .from('menu_items')
          .update({
            name: values.name,
            description: values.description,
            price: values.price,
            is_available: values.is_available,
            category_id: values.category_id,
            display_order: values.display_order,
          })
          .eq('id', currentMenuItem.id);

        if (error) throw error;

        toast({
          title: 'Item atualizado',
          description: 'O item do cardápio foi atualizado com sucesso.',
        });
      } else {
        // Create new item
        // Generate a mock embedding for new items
        const mockEmbedding = JSON.stringify(Array(3).fill(0).map(() => Math.random()));
        
        const { error } = await supabase.from('menu_items').insert({
          name: values.name,
          description: values.description,
          price: values.price,
          is_available: values.is_available,
          category_id: values.category_id,
          display_order: values.display_order,
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

  const getCategoryName = (categoryId: string | null | undefined) => {
    if (!categoryId) return 'Sem categoria';
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Categoria desconhecida';
  };

  return (
    <div className={cn("space-y-6", animate({ variant: "fade-in" }))}>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Cardápio</h1>
        <Button onClick={openCreateDialog} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all">
          <Plus className="mr-2 h-4 w-4" /> Adicionar Item
        </Button>
      </div>

      <Tabs defaultValue="items" className="w-full">
        <TabsList className="mb-4 bg-gray-50 p-1 rounded-lg shadow-inner">
          <TabsTrigger value="items" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Itens</TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Categorias</TabsTrigger>
        </TabsList>
        
        <TabsContent value="items" className={animate({ variant: "slide-up", delay: 75 })}>
          <Card className="overflow-hidden border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
              <CardTitle className="text-xl">Filtros</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-4 p-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou descrição..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="pl-8 bg-white border border-gray-200"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={categoryFilter || undefined} onValueChange={(value) => setCategoryFilter(value === "all" ? null : value)}>
                  <SelectTrigger className="w-[180px] bg-white border border-gray-200">
                    <SelectValue placeholder="Todas categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas categorias</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant={availabilityFilter === null ? "default" : "outline"}
                    onClick={() => setAvailabilityFilter(null)}
                    className={cn("border border-gray-200", 
                      availabilityFilter === null ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" : ""
                    )}
                  >
                    Todos
                  </Button>
                  <Button
                    variant={availabilityFilter === true ? "default" : "outline"}
                    onClick={() => setAvailabilityFilter(true)}
                    className={cn("border border-gray-200", 
                      availabilityFilter === true ? "bg-gradient-to-r from-green-500 to-teal-500 text-white" : ""
                    )}
                  >
                    Disponíveis
                  </Button>
                  <Button
                    variant={availabilityFilter === false ? "default" : "outline"}
                    onClick={() => setAvailabilityFilter(false)}
                    className={cn("border border-gray-200", 
                      availabilityFilter === false ? "bg-gradient-to-r from-red-500 to-orange-500 text-white" : ""
                    )}
                  >
                    Indisponíveis
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cn("mt-6 overflow-hidden border-none shadow-lg bg-white/80 backdrop-blur-sm", animate({ variant: "slide-up", delay: 150 }))}>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
                </div>
              ) : menuItems.length === 0 ? (
                <div className="py-20 text-center bg-gray-50/50 rounded-lg">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-muted-foreground text-lg">Nenhum item encontrado</p>
                    <Button onClick={openCreateDialog} variant="outline">Adicionar novo item</Button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="border-collapse">
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="w-16 text-center">Ordem</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead className="text-right">Preço</TableHead>
                        <TableHead>Disponibilidade</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {menuItems.map((item) => (
                        <TableRow key={item.id} className="hover:bg-gray-50/70 transition-colors">
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="font-bold text-gray-500">{item.display_order}</span>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 hover:bg-gray-200 rounded-full"
                                  onClick={() => moveItemInOrder(item, 'up')}
                                >
                                  <ArrowUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 hover:bg-gray-200 rounded-full"
                                  onClick={() => moveItemInOrder(item, 'down')}
                                >
                                  <ArrowDown className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="max-w-[300px] truncate text-gray-600">{item.description}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                              {getCategoryName(item.category_id)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            R$ {item.price.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant={item.is_available ? "outline" : "destructive"} 
                              size="sm"
                              onClick={() => toggleAvailability(item)}
                              className={cn("flex items-center gap-1", 
                                item.is_available 
                                  ? "border-green-300 hover:border-green-400 text-green-600" 
                                  : "bg-red-100 hover:bg-red-200 text-red-600 border-red-200"
                              )}
                            >
                              {item.is_available ? (
                                <><Check className="h-4 w-4" /> Disponível</>
                              ) : (
                                <><X className="h-4 w-4" /> Indisponível</>
                              )}
                            </Button>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(item)}
                              className="hover:bg-gray-100 text-blue-600 hover:text-blue-800"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => confirmDelete(item.id)}
                              className="hover:bg-red-50 text-red-500 hover:text-red-700"
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
        </TabsContent>
        
        <TabsContent value="categories" className={animate({ variant: "slide-up", delay: 75 })}>
          <CategoryManager />
        </TabsContent>
      </Tabs>

      {/* Menu Item Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px] bg-white/95 backdrop-blur-sm border-none shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {currentMenuItem ? 'Editar Item do Cardápio' : 'Adicionar Item ao Cardápio'}
            </DialogTitle>
            <DialogDescription className="text-gray-500">
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
                      <Input placeholder="Nome do item" {...field} className="bg-white" />
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
                      <Textarea placeholder="Descrição do item" {...field} className="bg-white" />
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
                        className="bg-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="null">Sem categoria</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="display_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ordem de exibição</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        {...field}
                        className="bg-white"
                      />
                    </FormControl>
                    <FormDescription className="text-gray-500">
                      Quanto menor o número, mais alto o item aparece na lista.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_available"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between bg-white/70 p-4 rounded-lg border">
                    <div className="space-y-0.5">
                      <FormLabel>Disponível</FormLabel>
                      <FormDescription className="text-gray-500">
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

              <DialogFooter className="pt-4">
                <Button type="submit" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md">
                  {currentMenuItem ? 'Salvar Alterações' : 'Criar Item'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-white/95 backdrop-blur-sm border-none shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-red-600">Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. Este item será permanentemente excluído do cardápio.
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
            <AlertDescription>
              Todos os dados relacionados a este item serão removidos.
            </AlertDescription>
          </Alert>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuItems;
