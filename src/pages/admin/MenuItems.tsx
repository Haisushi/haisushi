
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { MenuItem, MenuItemFormValues } from '@/types/MenuItem';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { animate } from '@/lib/animations';
import { cn } from '@/lib/utils';
import { useMenuItems } from '@/hooks/useMenuItems';
import { MenuItemFilters } from '@/components/admin/menu/MenuItemFilters';
import { MenuItemTable } from '@/components/admin/menu/MenuItemTable';
import { MenuItemDialog } from '@/components/admin/menu/MenuItemDialog';
import { DeleteConfirmDialog } from '@/components/admin/menu/DeleteConfirmDialog';

const MenuItems = () => {
  const { supabase } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentMenuItem, setCurrentMenuItem] = useState<MenuItem | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [commonCategories, setCommonCategories] = useState<string[]>([]);
  
  const { 
    menuItems, 
    loading, 
    searchTerm, 
    setSearchTerm, 
    availabilityFilter, 
    setAvailabilityFilter,
    categoryFilter,
    setCategoryFilter,
    toggleAvailability,
    moveItemInOrder,
    deleteMenuItem,
    fetchMenuItems
  } = useMenuItems();

  useEffect(() => {
    // Extract unique categories from menu items
    if (menuItems.length > 0) {
      const categories = menuItems
        .map(item => item.category_name)
        .filter((value, index, self) => 
          value !== null && 
          value !== undefined && 
          self.indexOf(value) === index
        ) as string[];
      
      setCommonCategories(categories);
    }
  }, [menuItems]);

  const openEditDialog = (item: MenuItem) => {
    setCurrentMenuItem(item);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setCurrentMenuItem(null);
    setIsDialogOpen(true);
  };

  const confirmDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (itemToDelete === null) return;
    await deleteMenuItem(itemToDelete);
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const onSubmit = async (values: MenuItemFormValues) => {
    try {
      if (currentMenuItem) {
        // Update existing item - don't modify the embedding
        const { error } = await supabase
          .from('menu_items')
          .update({
            name: values.name,
            description: values.description,
            price: values.price,
            is_available: values.is_available,
            category_name: values.category_name,
            display_order: values.display_order,
          })
          .eq('id', currentMenuItem.id);

        if (error) throw error;

        toast({
          title: 'Item atualizado',
          description: 'O item do cardápio foi atualizado com sucesso.',
        });
      } else {
        // Create new item - skip the embedding field entirely
        const { error } = await supabase.from('menu_items').insert({
          name: values.name,
          description: values.description,
          price: values.price,
          is_available: values.is_available,
          category_name: values.category_name,
          display_order: values.display_order,
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
        </TabsList>
        
        <TabsContent value="items" className={animate({ variant: "slide-up", delay: 75 })}>
          <MenuItemFilters 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            availabilityFilter={availabilityFilter}
            onAvailabilityFilterChange={setAvailabilityFilter}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            categories={commonCategories.map(name => ({ id: name, name }))}
          />

          <Card className={cn("mt-6 overflow-hidden border-none shadow-lg bg-white/80 backdrop-blur-sm", animate({ variant: "slide-up", delay: 150 }))}>
            <CardContent className="pt-6">
              <MenuItemTable 
                items={menuItems}
                loading={loading}
                onEdit={openEditDialog}
                onDelete={confirmDelete}
                onToggleAvailability={toggleAvailability}
                onMoveItem={moveItemInOrder}
                onCreate={openCreateDialog}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Menu Item Form Dialog */}
      <MenuItemDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        currentMenuItem={currentMenuItem}
        commonCategories={commonCategories}
        onSubmit={onSubmit}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default MenuItems;
