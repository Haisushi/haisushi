
import React from 'react';
import { 
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Order } from '@/types/Order';
import OrderReceiptView from '@/components/orders/OrderPrintView';
import { PrintStyle } from '@/components/orders/PrintStyle';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrderPrintDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OrderPrintView: React.FC<OrderPrintDialogProps> = ({ 
  order, 
  open, 
  onOpenChange 
}) => {
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <>
      <PrintStyle />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] print:sm:max-w-none print:w-auto">
          {order && (
            <>
              <div className="print-content">
                <OrderReceiptView order={order} />
              </div>
              <div className="flex justify-center mt-4 print-button">
                <Button onClick={handlePrint} className="flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  Imprimir
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
