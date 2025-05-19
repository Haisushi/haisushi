import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Order } from '@/types/Order';
import { formatPhone } from '@/lib/utils';

interface OrderPrintViewProps {
  order: Order;
}

const OrderPrintView = ({ order }: OrderPrintViewProps) => {
  const orderDate = format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR });

  return (
    <div className="p-4 bg-white">
      <div className="receipt-info space-y-2">
        <div><strong>Data:</strong> {orderDate}</div>
        <div><strong>Cliente:</strong> {order.customer_name || 'N/A'}</div>
        <div><strong>Telefone:</strong> {formatPhone(order.customer_phone)}</div>
        <div><strong>Endereço:</strong> {order.delivery_address || 'N/A'}</div>
        {order.bairro && <div><strong>Bairro:</strong> {order.bairro}</div>}
      </div>
    </div>
  );
};

export default OrderPrintView; 