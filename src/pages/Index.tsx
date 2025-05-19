import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, X, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Importar a fonte Montserrat do Google Fonts
const fontUrl = "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap";

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

const Index = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchEpisodes();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("titulo");
    if (!error && data) setCategories(data);
    setIsLoading(false);
  };

  const fetchEpisodes = async () => {
    const { data, error } = await supabase
      .from("episodes")
      .select("id, titulo, descricao, audio, publicado_em, categoria_id, created_at")
      .order("publicado_em", { ascending: false });
    if (!error && data) setEpisodes(data);
    setIsLoading(false);
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
    <div className="relative min-h-screen w-full overflow-x-hidden" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Google Fonts */}
      <link href={fontUrl} rel="stylesheet" />
      {/* Background animado colorido inspirado na imagem enviada */}
      <div className="absolute inset-0 -z-10">
        <svg width="100%" height="100%" className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="bg1" cx="30%" cy="20%" r="70%" gradientTransform="rotate(20)">
              <stop offset="0%" stopColor="#6ed3cf" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#b2dfdb" stopOpacity="0.2" />
            </radialGradient>
            <radialGradient id="bg2" cx="80%" cy="80%" r="60%" gradientTransform="rotate(-10)">
              <stop offset="0%" stopColor="#b2dfdb" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#e0f7fa" stopOpacity="0.2" />
            </radialGradient>
            <linearGradient id="wave" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6ed3cf" />
              <stop offset="100%" stopColor="#b2dfdb" />
            </linearGradient>
          </defs>
          {/* Ondas suaves */}
          <motion.ellipse
            cx="30%" cy="18%" rx="420" ry="180"
            fill="url(#bg1)"
            initial={{ opacity: 0.7, scale: 0.9 }}
            animate={{ opacity: 0.8, scale: 1.05 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
          />
          <motion.ellipse
            cx="80%" cy="85%" rx="320" ry="120"
            fill="url(#bg2)"
            initial={{ opacity: 0.5, scale: 0.8 }}
            animate={{ opacity: 0.7, scale: 1.1 }}
            transition={{ duration: 3.5, repeat: Infinity, repeatType: "reverse", delay: 1 }}
          />
          <motion.path
            d="M 0 400 Q 300 320 600 400 T 1200 400"
            stroke="url(#wave)" strokeWidth="22" fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
            style={{ filter: "blur(2px)" }}
          />
          {/* Efeito de pontos (halftone) animado */}
          <g>
            {[...Array(18)].map((_, i) => (
              <motion.circle
                key={i}
                cx={220 + i * 28}
                cy={120 + Math.sin(i / 2) * 18}
                r={10 + Math.sin(i + Date.now() / 800) * 4}
                fill="#6ed3cf"
                opacity={0.18 + (i % 2) * 0.08}
                animate={{ r: [10, 16, 10] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", delay: i * 0.1 }}
              />
            ))}
          </g>
        </svg>
      </div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12 pt-8"
      >
        <h1 className="text-5xl font-extrabold text-podcast-background mb-4 tracking-tight" style={{ letterSpacing: "-1px" }}>
          Bem-vindo ao AudioVerse
        </h1>
        <p className="text-2xl text-gray-700 max-w-2xl mx-auto font-medium">
          Descubra os melhores podcasts e episódios em um só lugar. Explore, ouça e compartilhe suas histórias favoritas.
        </p>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-3 h-3 rounded-full bg-podcast animate-pulse mx-1"></div>
          <div className="w-3 h-3 rounded-full bg-podcast animate-pulse mx-1" style={{ animationDelay: "300ms" }}></div>
          <div className="w-3 h-3 rounded-full bg-podcast animate-pulse mx-1" style={{ animationDelay: "600ms" }}></div>
        </div>
      ) : (
        <motion.div
          className="w-full flex justify-center"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10 justify-items-center w-full max-w-7xl">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
                whileHover={{ scale: 1.045, boxShadow: "0 8px 32px 0 rgba(80,80,180,0.14)" }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
                className="bg-white rounded-3xl shadow-2xl border border-gray-100 cursor-pointer flex flex-col overflow-hidden hover:border-podcast transition-all duration-300 group max-w-xs w-full min-h-[370px]"
                onClick={() => navigate(`/categoria/${category.id}`)}
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                <div className="relative w-full h-48 bg-gradient-to-br from-podcast/10 to-podcast/5 flex items-center justify-center">
                  {category.imagem ? (
                    <img
                      src={category.imagem}
                      alt={category.titulo}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full w-full text-podcast/40">
                      <ImageIcon className="w-16 h-16 mb-2" />
                      <span>Sem imagem</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-white/80 rounded-full px-3 py-1 text-xs font-semibold text-podcast shadow-sm">
                    Categoria
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-between p-6">
                  <h2 className="text-2xl font-bold text-podcast-background mb-2 group-hover:text-podcast transition-colors">
                    {category.titulo}
                  </h2>
                  <p className="text-gray-500 text-base mb-4 line-clamp-2">
                    {category.descricao}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs text-gray-400">Clique para ver episódios</span>
                    <svg className="w-5 h-5 text-podcast group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
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

export default Index;
