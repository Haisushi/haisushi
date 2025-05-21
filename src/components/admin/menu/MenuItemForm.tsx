
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { MenuItemFormValues, MenuItem } from '@/types/MenuItem';

// Define the form schema
const menuItemFormSchema = z.object({
  name: z.string().min(3, { message: 'Nome precisa ter no mínimo 3 caracteres' }),
  description: z.string().min(5, { message: 'Descrição precisa ter no mínimo 5 caracteres' }),
  price: z.coerce.number().positive({ message: 'O preço deve ser um valor positivo' }),
  is_available: z.boolean().default(true),
  category_name: z.string().nullable(),
  display_order: z.coerce.number().int().nonnegative().default(0),
});

interface MenuItemFormProps {
  currentMenuItem: MenuItem | null;
  commonCategories: string[];
  onSubmit: (values: MenuItemFormValues) => Promise<void>;
}

export function MenuItemForm({ currentMenuItem, commonCategories, onSubmit }: MenuItemFormProps) {
  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: {
      name: currentMenuItem?.name || '',
      description: currentMenuItem?.description || '',
      price: currentMenuItem?.price || 0,
      is_available: currentMenuItem?.is_available || true,
      category_name: currentMenuItem?.category_name || null,
      display_order: currentMenuItem?.display_order || 0,
    },
  });

  return (
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
          name="category_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Digite ou selecione uma categoria"
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value || null)}
                  className="bg-white flex-1"
                  list="categories"
                />
                <datalist id="categories">
                  <option value="">Sem categoria</option>
                  {commonCategories.map((category, i) => (
                    <option key={i} value={category}>{category}</option>
                  ))}
                </datalist>
                {field.value && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10"
                    onClick={() => field.onChange(null)}
                  >
                    ✕
                  </Button>
                )}
              </div>
              <FormDescription className="text-gray-500">
                Digite uma categoria existente ou crie uma nova
              </FormDescription>
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
  );
}
