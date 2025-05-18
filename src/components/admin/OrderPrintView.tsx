
import { useState, useRef } from 'react';
import { Order } from '@/types/Order';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Printer } from 'lucide-react';

// Styles for thermal printer format
const thermalStyles = `
  @media print {
    @page {
      margin: 0;
      size: 80mm auto;
    }
    
    body {
      margin: 0;
      padding: 0;
      width: 80mm;
    }
    
    .print-button {
      display: none;
    }
  }
  
  .receipt {
    font-family: 'Courier New', monospace;
    font-size: 12px;
    width: 76mm;
    margin: 0 auto;
    padding: 3mm 2mm;
  }
  
  .receipt-header {
    text-align: center;
    margin-bottom: 10px;
    font-size: 14px;
    font-weight: bold;
  }
  
  .receipt-subheader {
    text-align: center;
    margin-bottom: 10px;
    font-size: 12px;
  }
  
  .receipt-info {
    margin-bottom: 10px;
  }
  
  .receipt-line {
    border-top: 1px dashed #000;
    margin: 5px 0;
  }
  
  .receipt-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
  }
  
  .receipt-total {
    display: flex;
    justify-content: space-between;
    margin-top: 5px;
    font-weight: bold;
  }
  
  .receipt-footer {
    text-align: center;
    margin-top: 10px;
    font-size: 11px;
  }
`;

interface OrderPrintViewProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OrderPrintView = ({ order, open, onOpenChange }: OrderPrintViewProps) => {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  if (!order) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR')}`;
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'R$ 0,00';
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  const formatItems = () => {
    try {
      if (!order.items) return [];
      
      // Handle both string and JSON object cases
      const items = typeof order.items === 'string' 
        ? JSON.parse(order.items) 
        : order.items;
        
      if (!Array.isArray(items)) return [];
      
      return items.map((item: any) => ({
        name: item.name || 'Item sem nome',
        quantity: item.quantity || 1,
        price: item.price || 0,
        subtotal: (item.quantity || 1) * (item.price || 0)
      }));
    } catch (error) {
      console.error("Error parsing order items", error);
      return [];
    }
  };
  
  const items = formatItems();
  const orderDate = formatDate(order.created_at);

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
        
        <style>{thermalStyles}</style>
        
        <div className="max-h-[70vh] overflow-auto border rounded p-4">
          <div ref={printRef} className="receipt bg-white">
            <div className="receipt-header">PEDIDO #{order.id.substring(0, 8)}</div>
            <div className="receipt-subheader">PEDIDO PARA DELIVERY</div>
            
            <div className="receipt-line"></div>
            
            <div className="receipt-info">
              <div><strong>Data:</strong> {orderDate}</div>
              <div><strong>Cliente:</strong> {order.customer_name || 'N/A'}</div>
              <div><strong>Telefone:</strong> {order.customer_phone || 'N/A'}</div>
              <div><strong>Endereço:</strong> {order.delivery_address || 'N/A'}</div>
              <div><strong>Bairro:</strong> {order.bairro || 'N/A'}</div>
              <div><strong>Status:</strong> {order.status || 'Pendente'}</div>
            </div>
            
            <div className="receipt-line"></div>
            
            <div>
              <div><strong>ITENS DO PEDIDO:</strong></div>
              {items.length > 0 ? (
                items.map((item: any, index: number) => (
                  <div key={index} className="receipt-item">
                    <div>{item.quantity}x {item.name}</div>
                    <div>{formatCurrency(item.subtotal)}</div>
                  </div>
                ))
              ) : (
                <div>Nenhum item encontrado</div>
              )}
            </div>
            
            <div className="receipt-line"></div>
            
            <div className="receipt-total">
              <div>Subtotal:</div>
              <div>{formatCurrency(order.order_amount)}</div>
            </div>
            
            <div className="receipt-total">
              <div>Taxa de entrega:</div>
              <div>{formatCurrency(order.delivery_fee)}</div>
            </div>
            
            <div className="receipt-total">
              <div>TOTAL:</div>
              <div>{formatCurrency(order.total_amount)}</div>
            </div>
            
            <div className="receipt-line"></div>
            
            <div className="receipt-footer">
              Obrigado pela preferência!
            </div>
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
