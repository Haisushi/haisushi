import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Category {
  id: string;
  titulo: string;
  descricao: string;
  imagem: string;
}

interface Episode {
  id: string;
  titulo: string;
  descricao: string;
  audio: string;
  publicado_em: string;
  categoria_id: string;
}

const Home = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchEpisodes();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
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
      const { data, error } = await supabase
        .from("episodes")
        .select("id, titulo, descricao, audio, publicado_em, categoria_id, created_at")
        .order("publicado_em", { ascending: false });

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

  const handlePlayPause = (audioUrl: string) => {
    if (currentlyPlaying === audioUrl) {
      setCurrentlyPlaying(null);
    } else {
      setCurrentlyPlaying(audioUrl);
    }
  };

  const getEpisodesByCategory = (categoryId: string) => {
    return episodes.filter(episode => episode.categoria_id === categoryId);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-4xl font-bold text-center mb-8">Categorias</h1>
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-3 h-3 rounded-full bg-podcast animate-pulse mx-1"></div>
          <div className="w-3 h-3 rounded-full bg-podcast animate-pulse mx-1" style={{ animationDelay: "300ms" }}></div>
          <div className="w-3 h-3 rounded-full bg-podcast animate-pulse mx-1" style={{ animationDelay: "600ms" }}></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card 
                className="h-full cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedCategory(category)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{category.titulo}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {category.imagem && (
                      <img
                        src={category.imagem}
                        alt={category.titulo}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                    <p className="text-gray-600">{category.descricao}</p>
                    <p className="text-sm text-gray-500">
                      {getEpisodesByCategory(category.id).length} episódios
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={!!selectedCategory} onOpenChange={() => setSelectedCategory(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedCategory?.titulo}</span>
              <Button variant="ghost" size="sm" onClick={() => setSelectedCategory(null)}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedCategory && (
            <div className="space-y-6">
              {selectedCategory.imagem && (
                <img
                  src={selectedCategory.imagem}
                  alt={selectedCategory.titulo}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}
              
              <p className="text-gray-600">{selectedCategory.descricao}</p>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Episódios</h3>
                {getEpisodesByCategory(selectedCategory.id).map((episode) => (
                  <div key={episode.id} className="border rounded-lg p-4">
                    <h4 className="font-medium">{episode.titulo}</h4>
                    <p className="text-sm text-gray-600 mb-2">{episode.descricao}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {new Date(episode.publicado_em).toLocaleDateString()}
                      </span>
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
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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

export default Home; 