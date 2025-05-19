
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getEpisodeById } from "@/lib/mockData";
import { Episode } from "@/components/episodes/EpisodeCard";
import AudioPlayer from "@/components/ui/AudioPlayer";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft } from "lucide-react";

const EpisodeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("ID do episódio não encontrado");
      setLoading(false);
      return;
    }

    try {
      const episodeData = getEpisodeById(id);
      if (episodeData) {
        setEpisode(episodeData);
      } else {
        setError("Episódio não encontrado");
      }
    } catch (err) {
      setError("Erro ao carregar o episódio");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container py-16 flex justify-center">
        <div className="w-3 h-3 rounded-full bg-podcast animate-pulse-light mx-1"></div>
        <div className="w-3 h-3 rounded-full bg-podcast animate-pulse-light mx-1" style={{ animationDelay: "300ms" }}></div>
        <div className="w-3 h-3 rounded-full bg-podcast animate-pulse-light mx-1" style={{ animationDelay: "600ms" }}></div>
      </div>
    );
  }

  if (error || !episode) {
    return (
      <div className="container py-16 text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-500">{error}</h2>
        <Button asChild>
          <Link to="/">Voltar para a página inicial</Link>
        </Button>
      </div>
    );
  }

  const formattedDate = format(new Date(episode.publicado_em), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="container py-8">
      <Button 
        variant="ghost" 
        asChild 
        className="mb-4 pl-0 hover:bg-transparent hover:text-podcast"
      >
        <Link to="/" className="flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="aspect-square rounded-xl overflow-hidden shadow-md mb-4">
            <img 
              src={episode.capa} 
              alt={episode.titulo} 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold bg-podcast-light text-podcast px-3 py-1 rounded-full">
                {episode.categoria}
              </span>
              <span className="text-sm text-gray-500">{formattedDate}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-3 text-podcast-background">{episode.titulo}</h1>
          
          <div className="mb-8">
            <AudioPlayer audioUrl={episode.audio} />
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-medium mb-3">Sobre este episódio</h2>
            <p className="text-gray-700 whitespace-pre-line">{episode.descricao}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EpisodeDetails;
