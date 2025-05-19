
import { Order } from '@/types/Order';
import { formatPhone } from '@/lib/utils';
import { formatCurrency, formatOrderDate } from './utils/formatUtils';

interface OrderReceiptContentProps {
  order: Order;
  orderItems: any[];
}

export const OrderReceiptContent = ({ order, orderItems }: OrderReceiptContentProps) => {
  const orderDate = formatOrderDate(order.created_at);

  return (
    <div className="receipt bg-white">
      <div className="receipt-header">PEDIDO #{order.id.substring(0, 8)}</div>
      <div className="receipt-subheader">PEDIDO PARA DELIVERY</div>
      
      <div className="receipt-line"></div>
      
      <div className="receipt-info">
        <div><strong>Data:</strong> {orderDate}</div>
        <div><strong>Cliente:</strong> {order.customer_name || 'N/A'}</div>
        <div><strong>Telefone:</strong> {formatPhone(order.customer_phone)}</div>
        <div><strong>Endereço:</strong> {order.delivery_address || 'N/A'}</div>
        <div><strong>Bairro:</strong> {order.bairro || 'N/A'}</div>
      </div>
      
      <div className="receipt-line"></div>
      
      <div>
        <div><strong>ITENS DO PEDIDO:</strong></div>
        {orderItems.length > 0 ? (
          orderItems.map((item: any, index: number) => (
            <div key={index} className="receipt-item">
              <div>{item.quantity}x {item.name}</div>
              <div>{formatCurrency(item.subtotal)}</div>
            </div>
          ))
        ) : (
          <div>Carregando itens...</div>
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
  );
};
