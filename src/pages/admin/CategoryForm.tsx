
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const formSchema = z.object({
  titulo: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  descricao: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
  imagem: z.string().url("Forneça uma URL válida para a imagem"),
});

type FormValues = z.infer<typeof formSchema>;

const CategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: "",
      descricao: "",
      imagem: "",
    },
  });

  useEffect(() => {
    // Fetch category data if editing
    if (id) {
      const fetchCategory = async () => {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from("categories")
            .select("*")
            .eq("id", id)
            .single();
          
          if (error) throw error;
          
          if (data) {
            form.reset({
              titulo: data.titulo,
              descricao: data.descricao,
              imagem: data.imagem,
            });
          }
        } catch (error) {
          console.error("Error fetching category:", error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar os dados da categoria",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchCategory();
    }
  }, [id, form]);

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para realizar esta ação",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (id) {
        // Update existing category
        const { error } = await supabase
          .from("categories")
          .update({
            titulo: values.titulo,
            descricao: values.descricao,
            imagem: values.imagem,
          })
          .eq("id", id);
          
        if (error) throw error;
        
        toast({
          title: "Sucesso!",
          description: "Categoria atualizada com sucesso!",
        });
      } else {
        // Create new category
        const newCategory = {
          titulo: values.titulo,
          descricao: values.descricao,
          imagem: values.imagem,
          user_id: user.id
        };
        
        const { error } = await supabase
          .from("categories")
          .insert([newCategory]);
          
        if (error) throw error;
        
        toast({
          title: "Sucesso!",
          description: "Nova categoria criada com sucesso!",
        });
      }
      
      navigate("/admin/categories");
    } catch (error: any) {
      console.error("Error saving category:", error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao salvar a categoria",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{id ? "Editar Categoria" : "Nova Categoria"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="titulo"
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
              name="descricao"
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
              name="imagem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Imagem</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/admin/categories")}
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
  );
};

export default CategoryForm;
