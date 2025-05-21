
import { useState } from 'react';
import { Edit, Trash2, ArrowUp, ArrowDown, Check, X, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MenuItem } from '@/types/MenuItem';
import { cn } from '@/lib/utils';
import { animate } from '@/lib/animations';

interface MenuItemTableProps {
  items: MenuItem[];
  loading: boolean;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onToggleAvailability: (item: MenuItem) => void;
  onMoveItem: (item: MenuItem, direction: 'up' | 'down') => void;
  onCreate: () => void;
}

export function MenuItemTable({
  items,
  loading,
  onEdit,
  onDelete,
  onToggleAvailability,
  onMoveItem,
  onCreate
}: MenuItemTableProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-20 text-center bg-gray-50/50 rounded-lg">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-muted-foreground text-lg">Nenhum item encontrado</p>
          <Button onClick={onCreate} variant="outline">Adicionar novo item</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table className="border-collapse">
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="w-16 text-center">Ordem</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead className="text-right">Preço</TableHead>
            <TableHead>Disponibilidade</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="hover:bg-gray-50/70 transition-colors">
              <TableCell className="text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="font-bold text-gray-500">{item.display_order}</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:bg-gray-200 rounded-full"
                      onClick={() => onMoveItem(item, 'up')}
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:bg-gray-200 rounded-full"
                      onClick={() => onMoveItem(item, 'down')}
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="max-w-[300px] truncate text-gray-600">{item.description}</TableCell>
              <TableCell>
                {item.category_name ? (
                  <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                    {item.category_name}
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded-full text-xs bg-gray-50 text-gray-500">
                    Sem categoria
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right font-semibold">
                R$ {item.price.toFixed(2)}
              </TableCell>
              <TableCell>
                <Button
                  variant={item.is_available ? "outline" : "destructive"} 
                  size="sm"
                  onClick={() => onToggleAvailability(item)}
                  className={cn("flex items-center gap-1", 
                    item.is_available 
                      ? "border-green-300 hover:border-green-400 text-green-600" 
                      : "bg-red-100 hover:bg-red-200 text-red-600 border-red-200"
                  )}
                >
                  {item.is_available ? (
                    <><Check className="h-4 w-4" /> Disponível</>
                  ) : (
                    <><X className="h-4 w-4" /> Indisponível</>
                  )}
                </Button>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(item)}
                  className="hover:bg-gray-100 text-blue-600 hover:text-blue-800"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(item.id)}
                  className="hover:bg-red-50 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
