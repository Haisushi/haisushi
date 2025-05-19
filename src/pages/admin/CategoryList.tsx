
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, Plus, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  image: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Category {
  id: string;
  name: string;
  description: string;
  image?: string;
  user_id?: string;
  created_at?: string;
  display_order?: number;
}

const CategoryList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("menu_categories")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar categorias",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para criar uma categoria",
          variant: "destructive",
        });
        return;
      }

      let imageUrl = editingCategory?.image;

      if (values.image) {
        const file = values.image as File;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('category-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Erro no upload:', uploadError);
          throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('category-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      if (!imageUrl) {
        throw new Error('É necessário fornecer uma imagem para a categoria');
      }

      const categoryData = {
        name: values.name,
        description: values.description,
        image: imageUrl,
        user_id: user.id,
      };

      if (editingId) {
        const { error: updateError } = await supabase
          .from("menu_categories")
          .update({
            name: categoryData.name,
            description: categoryData.description,
            image: categoryData.image,
          })
          .eq("id", editingId);

        if (updateError) {
          console.error('Erro na atualização:', updateError);
          throw new Error(`Erro ao atualizar categoria: ${updateError.message}`);
        }

        toast({
          title: "Sucesso",
          description: "Categoria atualizada com sucesso!",
        });
      } else {
        const { error: insertError } = await supabase
          .from("menu_categories")
          .insert([categoryData]);

        if (insertError) {
          console.error('Erro na inserção:', insertError);
          throw new Error(`Erro ao criar categoria: ${insertError.message}`);
        }

        toast({
          title: "Sucesso",
          description: "Categoria criada com sucesso!",
        });
      }

      form.reset();
      setIsFormOpen(false);
      setEditingId(null);
      setEditingCategory(null);
      setImagePreview(null);
      await fetchCategories();
    } catch (error: any) {
      console.error("Error saving category:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar categoria",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setEditingCategory(category);
    setImagePreview(category.image || null);
    form.reset({
      name: category.name,
      description: category.description,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { data: category, error: fetchError } = await supabase
        .from("menu_categories")
        .select("image")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      if (category?.image) {
        const imagePath = category.image.split('/').pop();
        if (imagePath) {
          const { error: deleteImageError } = await supabase.storage
            .from('category-images')
            .remove([imagePath]);

          if (deleteImageError) {
            console.error('Erro ao excluir imagem:', deleteImageError);
          }
        }
      }

      const { error: deleteError } = await supabase
        .from("menu_categories")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso!",
      });

      await fetchCategories();
    } catch (error: any) {
      console.error("Error deleting category:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir categoria",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Categorias</CardTitle>
          <Button onClick={() => {
            setIsFormOpen(true);
            setEditingId(null);
            form.reset();
            setImagePreview(null);
          }}>
            <Plus className="mr-2 h-4 w-4" /> Nova Categoria
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-3 h-3 rounded-full bg-podcast animate-pulse mx-1"></div>
              <div className="w-3 h-3 rounded-full bg-podcast animate-pulse mx-1" style={{ animationDelay: "300ms" }}></div>
              <div className="w-3 h-3 rounded-full bg-podcast animate-pulse mx-1" style={{ animationDelay: "600ms" }}></div>
            </div>
          ) : (
            <>
              {categories.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">Nenhuma categoria encontrada.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Imagem</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>
                          {category.image && (
                            <img 
                              src={category.image} 
                              alt={category.name}
                              className="w-12 h-12 object-cover rounded-md"
                            />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell className="max-w-sm">
                          <p className="truncate">{category.description}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(category)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(category.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{editingId ? "Editar Categoria" : "Nova Categoria"}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => {
                  setIsFormOpen(false);
                  setEditingId(null);
                  form.reset();
                  setImagePreview(null);
                }}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título</FormLabel>
                          <FormControl>
                            <Input placeholder="Título da categoria" {...field} />
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
                            <Textarea placeholder="Descrição da categoria" rows={5} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field: { value, onChange, ...field } }) => (
                        <FormItem>
                          <FormLabel>Imagem</FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                handleImageChange(e);
                                onChange(e.target.files?.[0]);
                              }}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {imagePreview && (
                      <div className="mt-4">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-md"
                        />
                      </div>
                    )}
                    
                    <div className="flex justify-end space-x-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setIsFormOpen(false);
                          setEditingId(null);
                          form.reset();
                          setImagePreview(null);
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Salvando..." : "Salvar"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoryList;
