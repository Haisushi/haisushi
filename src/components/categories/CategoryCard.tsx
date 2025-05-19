
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export interface Category {
  id: string;
  titulo: string;
  descricao: string;
  imagem: string;
  created_at: string;
}

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const { id, titulo, imagem, descricao } = category;
  
  return (
    <Link to={`/categories/${id}`}>
      <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-1">
        <div className="relative">
          <AspectRatio ratio={16 / 9}>
            <img 
              src={imagem} 
              alt={titulo}
              className="w-full h-full object-cover"
            />
          </AspectRatio>
        </div>
        <CardContent className="p-4">
          <h3 className="font-bold text-lg mb-2 line-clamp-2">{titulo}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{descricao}</p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CategoryCard;
