
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MenuCategory } from '@/types/MenuItem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { animate } from '@/lib/animations';

interface MenuItemFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  availabilityFilter: boolean | null;
  onAvailabilityFilterChange: (value: boolean | null) => void;
  categoryFilter: string | null;
  onCategoryFilterChange: (value: string | null) => void;
  categories: MenuCategory[];
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
  return (
    <Card className="overflow-hidden border-none shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
        <CardTitle className="text-xl">Filtros</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row gap-4 p-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou descrição..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 bg-white border border-gray-200"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={categoryFilter || undefined} onValueChange={(value) => onCategoryFilterChange(value === "all" ? null : value)}>
            <SelectTrigger className="w-[180px] bg-white border border-gray-200">
              <SelectValue placeholder="Todas categorias" />
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
          
          <div className="flex items-center space-x-2">
            <Button
              variant={availabilityFilter === null ? "default" : "outline"}
              onClick={() => onAvailabilityFilterChange(null)}
              className={cn("border border-gray-200", 
                availabilityFilter === null ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" : ""
              )}
            >
              Todos
            </Button>
            <Button
              variant={availabilityFilter === true ? "default" : "outline"}
              onClick={() => onAvailabilityFilterChange(true)}
              className={cn("border border-gray-200", 
                availabilityFilter === true ? "bg-gradient-to-r from-green-500 to-teal-500 text-white" : ""
              )}
            >
              Disponíveis
            </Button>
            <Button
              variant={availabilityFilter === false ? "default" : "outline"}
              onClick={() => onAvailabilityFilterChange(false)}
              className={cn("border border-gray-200", 
                availabilityFilter === false ? "bg-gradient-to-r from-red-500 to-orange-500 text-white" : ""
              )}
            >
              Indisponíveis
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
