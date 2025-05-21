
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
}

interface MenuItemFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  availabilityFilter: boolean | null;
  onAvailabilityFilterChange: (value: boolean | null) => void;
  categoryFilter: string | null;
  onCategoryFilterChange: (value: string | null) => void;
  categories: Category[];
}

export function MenuItemFilters({
  searchTerm,
  onSearchChange,
  availabilityFilter,
  onAvailabilityFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  categories
}: MenuItemFiltersProps) {
  const clearFilters = () => {
    onSearchChange('');
    onAvailabilityFilterChange(null);
    onCategoryFilterChange(null);
  };

  const hasActiveFilters = !!searchTerm || availabilityFilter !== null || categoryFilter !== null;

  return (
    <Card className="p-4 border-none bg-white/90 backdrop-blur-sm shadow-md">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar item..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-white"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
              onClick={() => onSearchChange('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        <div className="flex gap-2 md:w-auto">
          <Select
            value={availabilityFilter === null ? "all" : availabilityFilter.toString()}
            onValueChange={(value) => onAvailabilityFilterChange(
              value === 'all' ? null : value === 'true'
            )}
          >
            <SelectTrigger className="w-full md:w-[180px] bg-white">
              <SelectValue placeholder="Disponibilidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os itens</SelectItem>
              <SelectItem value="true">Disponíveis</SelectItem>
              <SelectItem value="false">Indisponíveis</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={categoryFilter || "all"}
            onValueChange={(value) => onCategoryFilterChange(
              value === 'all' ? null : value
            )}
          >
            <SelectTrigger className="w-full md:w-[180px] bg-white">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="whitespace-nowrap"
            >
              Limpar filtros
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
