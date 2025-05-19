
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface Episode {
  id: string;
  titulo: string;
  descricao: string;
  audio: string;
  capa: string;
  publicado_em: string;
  categoria: string;
  category_id?: string;
}

interface EpisodeCardProps {
  episode: Episode;
}

const EpisodeCard: React.FC<EpisodeCardProps> = ({ episode }) => {
  const { id, titulo, capa, publicado_em, categoria, descricao } = episode;
  
  const formattedDate = formatDistanceToNow(new Date(publicado_em), {
    addSuffix: true,
    locale: ptBR
  });

  // Limit description to 400 characters
  const limitedDescription = descricao.length > 400 
    ? `${descricao.substring(0, 400)}...` 
    : descricao;
  
  return (
    <Link to={`/episodes/${id}`}>
      <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-1">
        <div className="aspect-square overflow-hidden">
          <img 
            src={capa} 
            alt={titulo}
            className="w-full h-full object-cover"
          />
        </div>
        <CardContent className="p-4">
          <div className="mb-2">
            <span className="text-xs font-semibold bg-podcast-light text-podcast px-2 py-1 rounded-full">
              {categoria}
            </span>
          </div>
          <h3 className="font-bold text-lg mb-1 line-clamp-2">{titulo}</h3>
          <p className="text-sm text-gray-500 mb-2">{formattedDate}</p>
          <p className="text-sm text-gray-700 line-clamp-3">{limitedDescription}</p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default EpisodeCard;
