
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white/95 backdrop-blur-sm border-none shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-red-600">Confirmar exclusão</DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita. Este item será permanentemente excluído do cardápio.
          </DialogDescription>
        </DialogHeader>
        <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
          <AlertDescription>
            Todos os dados relacionados a este item serão removidos.
          </AlertDescription>
        </Alert>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
