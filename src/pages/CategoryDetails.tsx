import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Pause, ArrowLeft } from "lucide-react";

const CategoryDetails = () => {
  const { id } = useParams();
  const [category, setCategory] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [playingEpisodeId, setPlayingEpisodeId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchCategory();
      fetchEpisodes();
    }
  }, [id]);

  const fetchCategory = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      if (data) setCategory(data);
    } catch (error) {
      console.error("Error fetching category:", error);
    }
  };

  const fetchEpisodes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("episodes")
        .select("id, titulo, descricao, audio, publicado_em, categoria_id, created_at")
        .eq("categoria_id", id)
        .order("publicado_em", { ascending: false });
      if (error) throw error;
      if (data) setEpisodes(data);
    } catch (error) {
      console.error("Error fetching episodes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = (audioUrl: string, episodeId: string) => {
    if (currentlyPlaying === audioUrl) {
      setCurrentlyPlaying(null);
      setPlayingEpisodeId(null);
    } else {
      setCurrentlyPlaying(audioUrl);
      setPlayingEpisodeId(episodeId);
    }
  };

  if (!category) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-3 h-3 rounded-full bg-podcast animate-pulse mx-1"></div>
        <div className="w-3 h-3 rounded-full bg-podcast animate-pulse mx-1" style={{ animationDelay: "300ms" }}></div>
        <div className="w-3 h-3 rounded-full bg-podcast animate-pulse mx-1" style={{ animationDelay: "600ms" }}></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Button asChild variant="ghost" className="mb-8">
        <Link to="/">
          <ArrowLeft className="mr-2 h-5 w-5" /> Voltar para a página inicial
        </Link>
      </Button>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row gap-12 items-center md:items-start"
      >
        {/* Imagem, título e descrição */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="md:w-1/3 w-full flex flex-col items-center"
        >
          <div className="w-full rounded-2xl overflow-hidden shadow-lg mb-6">
            <img
              src={category.imagem}
              alt={category.titulo}
              className="w-full h-72 object-cover"
            />
          </div>
          <h1 className="text-4xl font-extrabold mb-2 text-center md:text-left text-podcast-background animate-fade-in">
            {category.titulo}
          </h1>
          <p className="text-lg text-gray-600 text-center md:text-left animate-fade-in-slow">
            {category.descricao}
          </p>
        </motion.div>
        {/* Episódios */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="md:w-2/3 w-full flex flex-col gap-8"
        >
          <h2 className="text-2xl font-bold mb-4 text-podcast">Episódios</h2>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-3 h-3 rounded-full bg-podcast animate-pulse mx-1"></div>
              <div className="w-3 h-3 rounded-full bg-podcast animate-pulse mx-1" style={{ animationDelay: "300ms" }}></div>
              <div className="w-3 h-3 rounded-full bg-podcast animate-pulse mx-1" style={{ animationDelay: "600ms" }}></div>
            </div>
          ) : episodes.length === 0 ? (
            <div className="text-gray-500">Nenhum episódio encontrado para esta categoria.</div>
          ) : (
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.12 } }
              }}
              className="flex flex-col gap-6"
            >
              {episodes.map((episode) => (
                <motion.div
                  key={episode.id}
                  variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                  className={`rounded-xl border bg-white p-6 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:shadow-lg transition-all duration-300 ${playingEpisodeId === episode.id ? 'ring-2 ring-podcast' : ''}`}
                >
                  <div>
                    <h3 className="text-lg font-bold mb-1 text-podcast-background">{episode.titulo}</h3>
                    <p className="text-gray-600 mb-1">{episode.descricao}</p>
                    <span className="text-xs text-gray-400">{new Date(episode.publicado_em).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={playingEpisodeId === episode.id ? "default" : "outline"}
                      size="icon"
                      className="rounded-full shadow-md"
                      onClick={() => handlePlayPause(episode.audio, episode.id)}
                    >
                      {currentlyPlaying === episode.audio ? (
                        <Pause className="h-6 w-6" />
                      ) : (
                        <Play className="h-6 w-6" />
                      )}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
      {/* Player fixo grande */}
      {currentlyPlaying && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.4 }}
          className="fixed bottom-0 left-0 right-0 bg-white border-t p-6 z-50 flex flex-col items-center shadow-2xl"
        >
          <audio
            controls
            src={currentlyPlaying}
            className="w-full max-w-2xl"
            onEnded={() => { setCurrentlyPlaying(null); setPlayingEpisodeId(null); }}
            autoPlay
          />
        </motion.div>
      )}
      <style>{`
        .animate-fade-in { animation: fadeIn 1s ease; }
        .animate-fade-in-slow { animation: fadeIn 1.5s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default CategoryDetails;
