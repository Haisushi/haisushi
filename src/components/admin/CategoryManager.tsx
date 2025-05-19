
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { ArrowDown, ArrowUp, Edit, Plus, Trash2 } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MenuCategory } from '@/types/MenuItem';

// Define the form schema for category
const categoryFormSchema = z.object({
  name: z.string().min(2, { message: 'Nome precisa ter no mínimo 2 caracteres' }),
  description: z.string().optional(),
  display_order: z.coerce.number().int().nonnegative().default(0),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export const CategoryManager = () => {
  const { supabase } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<MenuCategory | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
      display_order: 0,
    },
  });

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const moveCategoryInOrder = async (category: MenuCategory, direction: 'up' | 'down') => {
    try {
      // Find the category's current position
      const currentIndex = categories.findIndex(c => c.id === category.id);
      if (currentIndex === -1) return;
      
      // Can't move up if at the top, can't move down if at the bottom
      if ((direction === 'up' && currentIndex === 0) || 
          (direction === 'down' && currentIndex === categories.length - 1)) {
        return;
      }
      
      // Get the adjacent category
      const adjacentIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      const adjacentCategory = categories[adjacentIndex];
      
      // Swap display_order values
      const newOrder = adjacentCategory.display_order;
      const adjacentNewOrder = category.display_order;
      
      // Update current category order
      await supabase
        .from('menu_categories')
        .update({ display_order: newOrder })
        .eq('id', category.id);
        
      // Update adjacent category order
      await supabase
        .from('menu_categories')
        .update({ display_order: adjacentNewOrder })
        .eq('id', adjacentCategory.id);
      
      // Re-fetch categories to get updated order
      fetchCategories();
      
    } catch (error) {
      console.error('Error changing category order:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível reordenar as categorias.',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (category: MenuCategory) => {
    setCurrentCategory(category);
    form.reset({
      name: category.name,
      description: category.description || '',
      display_order: category.display_order,
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setCurrentCategory(null);
    form.reset({
      name: '',
      description: '',
      display_order: categories.length > 0 
        ? Math.max(...categories.map(cat => cat.display_order)) + 1 
        : 0,
    });
    setIsDialogOpen(true);
  };

  const confirmDelete = (id: string) => {
    setCategoryToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (categoryToDelete === null) return;

    try {
      // First check if there are menu items with this category
      const { data: itemsWithCategory, error: checkError } = await supabase
        .from('menu_items')
        .select('id')
        .eq('category_id', categoryToDelete)
        .limit(1);

      if (checkError) throw checkError;

      if (itemsWithCategory && itemsWithCategory.length > 0) {
        toast({
          title: 'Não é possível excluir',
          description: 'Existem itens associados a esta categoria. Remova ou altere a categoria dos itens primeiro.',
          variant: 'destructive',
        });
        setDeleteConfirmOpen(false);
        setCategoryToDelete(null);
        return;
      }

      const { error } = await supabase
        .from('menu_categories')
        .delete()
        .eq('id', categoryToDelete);

      if (error) throw error;

      toast({
        title: 'Categoria excluída',
        description: 'A categoria foi excluída com sucesso.',
      });
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a categoria.',
        variant: 'destructive',
      });
    } finally {
      setDeleteConfirmOpen(false);
      setCategoryToDelete(null);
    }
  };

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      if (currentCategory) {
        // Update existing category
        const { error } = await supabase
          .from('menu_categories')
          .update({
            name: values.name,
            description: values.description,
            display_order: values.display_order,
          })
          .eq('id', currentCategory.id);

        if (error) throw error;

        toast({
          title: 'Categoria atualizada',
          description: 'A categoria foi atualizada com sucesso.',
        });
      } else {
        // Create new category
        const { error } = await supabase
          .from('menu_categories')
          .insert({
            name: values.name,
            description: values.description,
            display_order: values.display_order,
          });

        if (error) throw error;

        toast({
          title: 'Categoria criada',
          description: 'A categoria foi criada com sucesso.',
        });
      }

      setIsDialogOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a categoria.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Categorias do Cardápio</h2>
        <Button onClick={openCreateDialog} className="bg-restaurant-primary hover:bg-restaurant-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Nova Categoria
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-restaurant-primary"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-muted-foreground">Nenhuma categoria encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ordem</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="flex flex-col items-center gap-1">
                          <span>{category.display_order}</span>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => moveCategoryInOrder(category, 'up')}
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => moveCategoryInOrder(category, 'down')}
                            >
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="max-w-[300px] truncate">{category.description}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => confirmDelete(category.id)}
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

      {/* Category Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {currentCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
            <DialogDescription>
              {currentCategory 
                ? 'Atualize os detalhes da categoria' 
                : 'Preencha os detalhes para criar uma nova categoria'}
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
                      <Input placeholder="Nome da categoria" {...field} />
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
                    <FormLabel>Descrição (opcional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descrição da categoria" {...field} />
                    </FormControl>
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
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" className="bg-restaurant-primary hover:bg-restaurant-primary/90">
                  {currentCategory ? 'Salvar alterações' : 'Criar categoria'}
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
              Esta ação não pode ser desfeita. Esta categoria será permanentemente excluída.
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertDescription>
              Se houver itens associados a esta categoria, a exclusão não será possível.
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
