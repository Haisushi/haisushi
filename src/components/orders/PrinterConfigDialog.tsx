
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Printer } from 'lucide-react';

interface PrinterConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PrinterConfigDialog: React.FC<PrinterConfigDialogProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const { toast } = useToast();
  const [selectedPrinter, setSelectedPrinter] = useState<string | null>(null);
  const [printers, setPrinters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Carrega as impressoras disponíveis
  useEffect(() => {
    const fetchPrinters = async () => {
      setLoading(true);
      try {
        // Verifica se a API de impressão está disponível no navegador
        if ('print' in window && 'matchMedia' in window) {
          // Tenta obter a impressora salva anteriormente
          const savedPrinter = localStorage.getItem('defaultPrinter');
          if (savedPrinter) {
            setSelectedPrinter(savedPrinter);
          }
          
          // No ambiente do navegador, não temos acesso direto às impressoras
          // Simulamos algumas impressoras para a interface
          setPrinters(['Impressora Padrão', 'Impressora Térmica', 'Impressora PDF']);
        } else {
          toast({
            title: "Aviso",
            description: "Seu navegador não suporta a API de impressão.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Erro ao buscar impressoras:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as impressoras disponíveis.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchPrinters();
    }
  }, [open, toast]);

  const handleSavePrinter = () => {
    if (selectedPrinter) {
      localStorage.setItem('defaultPrinter', selectedPrinter);
      toast({
        title: "Configuração Salva",
        description: `Impressora padrão definida como: ${selectedPrinter}`,
      });
      onOpenChange(false);
    } else {
      toast({
        title: "Atenção",
        description: "Por favor, selecione uma impressora.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" /> Configurar Impressora
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-4 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-restaurant-primary"></div>
          </div>
        ) : (
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="font-medium text-sm">Selecione a impressora padrão:</label>
                <select 
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={selectedPrinter || ''}
                  onChange={(e) => setSelectedPrinter(e.target.value)}
                >
                  <option value="">Selecione uma impressora</option>
                  {printers.map((printer) => (
                    <option key={printer} value={printer}>
                      {printer}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>A impressora selecionada será usada para todas as impressões de pedidos.</p>
                <p className="mt-2">Nota: Devido às restrições de segurança do navegador, pode ser necessário confirmar a impressão na caixa de diálogo do navegador.</p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSavePrinter} className="bg-restaurant-primary hover:bg-restaurant-primary/90">
            Salvar Configuração
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
