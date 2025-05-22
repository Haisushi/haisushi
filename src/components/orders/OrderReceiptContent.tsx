
import { Order } from '@/types/Order';
import { formatCurrency, formatOrderDate, formatAddress, getBairroFromAddress } from './utils/formatUtils';

interface OrderReceiptContentProps {
  order: Order;
  orderItems: any[];
}

export const OrderReceiptContent: React.FC<OrderReceiptContentProps> = ({ order, orderItems }) => {
  const orderNumber = order.id ? order.id.substring(0, 8).toUpperCase() : 'N/A';
  
  return (
    <div className="receipt">
      <div className="receipt-header">
        PEDIDO #{orderNumber}
      </div>
      
      <div className="receipt-subheader">
        {order.created_at && `Emitido em: ${formatOrderDate(order.created_at)}`}
      </div>
      
      <div className="receipt-line"></div>
      
      <div className="receipt-info">
        <h3>Informações do Cliente</h3>
        <p><strong>Nome:</strong> {order.customer_name || 'N/A'}</p>
        <p><strong>Telefone:</strong> {order.customer_phone || 'N/A'}</p>
        <p><strong>Endereço:</strong> {formatAddress(order.delivery_address)}</p>
        <p><strong>Bairro:</strong> {order.bairro || getBairroFromAddress(order.delivery_address) || 'N/A'}</p>
      </div>
      
      <div className="receipt-line"></div>
      
      <div className="receipt-info">
        <h3>Detalhes do Pedido</h3>
        <p><strong>Status:</strong> {order.status}</p>
        {order.scheduled_date && (
          <p><strong>Agendado para:</strong> {formatOrderDate(order.scheduled_date)}</p>
        )}
      </div>
      
      <div className="receipt-line"></div>
      
      <table className="receipt-items">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qtd</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          {orderItems.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.quantity}x</td>
              <td>{formatCurrency(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="receipt-line"></div>
      
      <div className="receipt-total">
        <div className="receipt-total-row">
          <span>Subtotal:</span>
          <span>{formatCurrency(order.order_amount)}</span>
        </div>
        <div className="receipt-total-row">
          <span>Taxa de Entrega:</span>
          <span>{formatCurrency(order.delivery_fee)}</span>
        </div>
        <div className="receipt-total-row">
          <span>Total:</span>
          <span>{formatCurrency(order.total_amount)}</span>
        </div>
      </div>
      
      <div className="receipt-footer">
        <p>Obrigado pela preferência!</p>
      </div>
    </div>
  );
};
