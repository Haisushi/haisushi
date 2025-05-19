
import { useState, useEffect } from "react";
import { searchEpisodes, getCategories } from "@/lib/mockData";
import { Episode } from "@/components/episodes/EpisodeCard";
import EpisodeCard from "@/components/episodes/EpisodeCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon } from "lucide-react";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [results, setResults] = useState<Episode[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    setCategories(getCategories());
  }, []);

  const handleSearch = () => {
    const searchResults = searchEpisodes(searchQuery, selectedCategory || undefined);
    setResults(searchResults);
    setHasSearched(true);
  };

  const handleEnterKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(prevCategory => prevCategory === category ? "" : category);
  };

  return (
    <div className="container py-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-3 text-podcast-background">Buscar Episódios</h1>
        <p className="text-gray-600">
          Encontre seus episódios favoritos por título, descrição ou categoria.
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border mb-8">
        <div className="flex flex-col gap-5">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Digite o que você procura..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleEnterKey}
              className="pl-10"
            />
          </div>
          
          <div>
            <p className="text-sm font-medium mb-2">Filtrar por categoria:</p>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button 
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategorySelect(category)}
                  className={selectedCategory === category ? "bg-podcast hover:bg-podcast-dark" : ""}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <Button 
              onClick={handleSearch} 
              className="bg-podcast hover:bg-podcast-dark w-full"
            >
              <SearchIcon className="mr-2 h-4 w-4" />
              Buscar
            </Button>
          </div>
        </div>
      </div>

      <div>
        {hasSearched && (
          <>
            <h2 className="text-xl font-semibold mb-4">
              {results.length > 0 
                ? `${results.length} resultado${results.length === 1 ? '' : 's'} encontrado${results.length === 1 ? '' : 's'}` 
                : "Nenhum resultado encontrado"}
            </h2>
            
            {results.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {results.map((episode) => (
                  <div key={episode.id} className="h-full">
                    <EpisodeCard episode={episode} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Search;
