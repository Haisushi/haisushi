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
import { Edit, Trash2, Plus, X, Play, Pause } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Episode {
  id: string;
  titulo: string;
  descricao: string;
  audio: string;
  publicado_em: string;
  user_id: string;
  categoria_id: string;
  created_at: string;
}

interface Category {
  id: string;
  titulo: string;
}

const formSchema = z.object({
  titulo: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  descricao: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
  audio: z.instanceof(File).optional(),
  publicado_em: z.string().min(1, "A data de publicação é obrigatória"),
  categoria_id: z.string().min(1, "A categoria é obrigatória"),
});

type FormValues = z.infer<typeof formSchema>;

const EpisodeList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: "",
      descricao: "",
      publicado_em: new Date().toISOString().split('T')[0],
      categoria_id: "",
    },
  });

  useEffect(() => {
    fetchEpisodes();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, titulo")
        .order("titulo");

      if (error) throw error;
      
      if (data) {
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as categorias",
        variant: "destructive",
      });
    }
  };

  const fetchEpisodes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("episodes")
        .select("id, titulo, descricao, audio, publicado_em, user_id, categoria_id, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      if (data) {
        setEpisodes(data);
      }
    } catch (error) {
      console.error("Error fetching episodes:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os episódios",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este episódio?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from("episodes")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      setEpisodes(episodes.filter(episode => episode.id !== id));
      
      toast({
        title: "Sucesso!",
        description: "Episódio excluído com sucesso!",
      });
    } catch (error) {
      console.error("Error deleting episode:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o episódio",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (episode: Episode) => {
    setEditingId(episode.id);
    setEditingEpisode(episode);
    setAudioPreview(episode.audio);
    form.reset({
      titulo: episode.titulo,
      descricao: episode.descricao,
      publicado_em: episode.publicado_em,
      categoria_id: episode.categoria_id,
    });
    setIsFormOpen(true);
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("audio", file);
      setAudioPreview(URL.createObjectURL(file));
    }
  };

  const handlePlayPause = (audioUrl: string) => {
    if (currentlyPlaying === audioUrl) {
      setCurrentlyPlaying(null);
    } else {
      setCurrentlyPlaying(audioUrl);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para criar um episódio",
          variant: "destructive",
        });
        return;
      }

      let audioUrl = editingEpisode?.audio;

      if (values.audio) {
        const file = values.audio as File;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('episode-audio')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Erro no upload:', uploadError);
          throw new Error(`Erro ao fazer upload do áudio: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('episode-audio')
          .getPublicUrl(filePath);

        audioUrl = publicUrl;
      }

      if (!audioUrl) {
        throw new Error('É necessário fornecer um arquivo de áudio para o episódio');
      }

      const episodeData = {
        titulo: values.titulo,
        descricao: values.descricao,
        audio: audioUrl,
        publicado_em: values.publicado_em || new Date().toISOString(),
        user_id: user.id,
        categoria_id: values.categoria_id,
      };

      if (editingId) {
        const { error: updateError } = await supabase
          .from("episodes")
          .update({
            titulo: episodeData.titulo,
            descricao: episodeData.descricao,
            audio: episodeData.audio,
            publicado_em: episodeData.publicado_em,
            user_id: episodeData.user_id,
            categoria_id: episodeData.categoria_id,
          })
          .eq("id", editingId)
          .eq("user_id", user.id);

        if (updateError) {
          console.error('Erro na atualização:', updateError);
          throw new Error(`Erro ao atualizar episódio: ${updateError.message}`);
        }

        toast({
          title: "Sucesso",
          description: "Episódio atualizado com sucesso!",
        });
      } else {
        const { error: insertError } = await supabase
          .from("episodes")
          .insert([episodeData]);

        if (insertError) {
          console.error('Erro na inserção:', insertError);
          throw new Error(`Erro ao criar episódio: ${insertError.message}`);
        }

        toast({
          title: "Sucesso",
          description: "Episódio criado com sucesso!",
        });
      }

      form.reset();
      setIsFormOpen(false);
      setEditingId(null);
      setEditingEpisode(null);
      setAudioPreview(null);
      await fetchEpisodes();
    } catch (error) {
      console.error("Error saving episode:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar episódio",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Episódios</CardTitle>
          <Button onClick={() => {
            setIsFormOpen(true);
            setEditingId(null);
            form.reset();
            setAudioPreview(null);
          }}>
            <Plus className="mr-2 h-4 w-4" /> Novo Episódio
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
              {episodes.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">Nenhum episódio encontrado.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Data de Publicação</TableHead>
                      <TableHead>Áudio</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {episodes.map((episode) => (
                      <TableRow key={episode.id}>
                        <TableCell className="font-medium">{episode.titulo}</TableCell>
                        <TableCell>
                          {categories.find(c => c.id === episode.categoria_id)?.titulo || 'N/A'}
                        </TableCell>
                        <TableCell className="max-w-sm">
                          <p className="truncate">{episode.descricao}</p>
                        </TableCell>
                        <TableCell>
                          {new Date(episode.publicado_em).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {episode.audio && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePlayPause(episode.audio)}
                            >
                              {currentlyPlaying === episode.audio ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(episode)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(episode.id)}>
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
                <CardTitle>{editingId ? "Editar Episódio" : "Novo Episódio"}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => {
                  setIsFormOpen(false);
                  setEditingId(null);
                  form.reset();
                  setAudioPreview(null);
                }}>
                  <X className="h-4 w-4" />
                </Button>
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
                            <Input placeholder="Título do episódio" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="categoria_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma categoria" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.titulo}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                            <Textarea placeholder="Descrição do episódio" rows={5} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="publicado_em"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Publicação</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="audio"
                      render={({ field: { value, onChange, ...field } }) => (
                        <FormItem>
                          <FormLabel>Áudio</FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              accept="audio/*"
                              onChange={handleAudioChange}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {audioPreview && (
                      <div className="mt-4">
                        <audio controls src={audioPreview} className="w-full" />
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
                          setAudioPreview(null);
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

      {currentlyPlaying && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <audio
            controls
            src={currentlyPlaying}
            className="w-full"
            onEnded={() => setCurrentlyPlaying(null)}
            autoPlay
          />
        </div>
      )}
    </div>
  );
};

export default EpisodeList;
