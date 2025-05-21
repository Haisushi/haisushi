
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MenuItemForm } from "./MenuItemForm";
import { MenuItem, MenuItemFormValues } from "@/types/MenuItem";

interface MenuItemDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentMenuItem: MenuItem | null;
  commonCategories: string[];
  onSubmit: (values: MenuItemFormValues) => Promise<void>;
}

export function MenuItemDialog({
  isOpen,
  onOpenChange,
  currentMenuItem,
  commonCategories,
  onSubmit
}: MenuItemDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-white/95 backdrop-blur-sm border-none shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {currentMenuItem ? 'Editar Item do Cardápio' : 'Adicionar Item ao Cardápio'}
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Preencha os detalhes do item do cardápio abaixo.
          </DialogDescription>
        </DialogHeader>

        <MenuItemForm 
          currentMenuItem={currentMenuItem}
          commonCategories={commonCategories}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
