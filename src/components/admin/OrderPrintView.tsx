
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
    const printWindow = window.open('', '_blank');
    if (!printWindow || !order) return;
    
    // Add print styles
    printWindow.document.write('<html><head><title>Pedido #' + order.id?.substring(0, 8) + '</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      @media print {
        @page { size: 80mm 297mm; margin: 0; }
        body { font-family: Arial, sans-serif; margin: 10px; font-size: 12px; }
        .receipt { width: 100%; }
        .receipt-header { font-size: 16px; text-align: center; font-weight: bold; margin-bottom: 5px; }
        .receipt-subheader { font-size: 12px; text-align: center; margin-bottom: 10px; }
        .receipt-line { border-top: 1px dashed #000; margin: 10px 0; }
        .receipt-info { margin-bottom: 10px; }
        .receipt-info div { margin-bottom: 3px; }
        .receipt-item { display: flex; justify-content: space-between; margin-bottom: 3px; }
        .receipt-total { display: flex; justify-content: space-between; font-weight: bold; margin: 5px 0; }
        .receipt-footer { text-align: center; margin-top: 10px; font-size: 10px; }
      }
    `);
    printWindow.document.write('</style></head><body>');
    
    // Clone our receipt content into the print window
    const printContent = document.querySelector('.receipt')?.cloneNode(true);
    if (printContent) {
      printWindow.document.body.appendChild(printContent);
    } else {
      // Fallback content if we couldn't clone the receipt
      printWindow.document.write(`
        <div class="receipt">
          <div class="receipt-header">PEDIDO #${order.id?.substring(0, 8)}</div>
          <div class="receipt-line"></div>
          <div class="receipt-info">
            <div><strong>Não foi possível gerar o recibo</strong></div>
          </div>
        </div>
      `);
    }
    
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    
    // Wait a bit for content to load before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };
  
  return (
    <>
      <PrintStyle />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[400px]">
          {order && (
            <>
              <div className="print-content">
                <OrderReceiptView order={order} />
              </div>
              <div className="flex justify-center mt-4">
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
