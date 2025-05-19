
import { useState, useRef } from 'react';
import { Order } from '@/types/Order';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Printer } from 'lucide-react';
import { PrintStyle } from '@/components/orders/PrintStyle';
import { OrderReceiptContent } from '@/components/orders/OrderReceiptContent';
import { useOrderItems } from '@/components/orders/hooks/useOrderItems';

interface OrderPrintViewProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OrderPrintView = ({ order, open, onOpenChange }: OrderPrintViewProps) => {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const { orderItems } = useOrderItems(order);

  if (!order) return null;

  const handlePrint = () => {
    setIsPrinting(true);
    
    setTimeout(() => {
      try {
        window.print();
        toast({
          title: "Impressão iniciada",
          description: "O pedido foi enviado para impressão.",
        });
      } catch (error) {
        toast({
          title: "Erro na impressão",
          description: "Não foi possível enviar para impressão.",
          variant: "destructive",
        });
        console.error("Print error:", error);
      } finally {
        setIsPrinting(false);
      }
    }, 100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Impressão de Pedido #{order.id.substring(0, 8)}</DialogTitle>
        </DialogHeader>
        
        <PrintStyle />
        
        <div className="max-h-[70vh] overflow-auto border rounded p-4">
          <div ref={printRef}>
            <OrderReceiptContent order={order} orderItems={orderItems} />
          </div>
        </div>
        
        <div className="flex justify-center mt-4">
          <Button 
            onClick={handlePrint} 
            disabled={isPrinting} 
            className="print-button bg-restaurant-primary hover:bg-restaurant-primary/90"
          >
            <Printer className="mr-2 h-4 w-4" />
            {isPrinting ? "Imprimindo..." : "Imprimir Pedido"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
