
import { Order } from '@/types/Order';
import { formatPhone } from '@/lib/utils';
import { formatCurrency, formatOrderDate } from './utils/formatUtils';

interface OrderReceiptContentProps {
  order: Order;
  orderItems: any[];
}

export const OrderReceiptContent = ({ order, orderItems }: OrderReceiptContentProps) => {
  const orderDate = formatOrderDate(order.created_at);

  // Format the delivery address to handle both string and object formats
  const formatAddress = (address: any): string => {
    if (!address) return 'N/A';
    
    // If address is a string, return it directly
    if (typeof address === 'string') return address;
    
    // If address is an object with address properties, format it
    if (typeof address === 'object') {
      const { logradouro, numero, complemento, bairro, localidade, uf } = address;
      
      const addressParts = [];
      if (logradouro) addressParts.push(logradouro);
      if (numero) addressParts.push(numero);
      if (complemento) addressParts.push(complemento);
      
      let locationParts = [];
      if (bairro) locationParts.push(bairro);
      if (localidade && uf) locationParts.push(`${localidade} - ${uf}`);
      
      return [
        addressParts.join(', '),
        locationParts.join(', ')
      ].filter(Boolean).join('. ');
    }
    
    // Fallback: convert to string
    return JSON.stringify(address);
  };

  return (
    <div className="receipt bg-white">
      <div className="receipt-header">PEDIDO #{order.id.substring(0, 8)}</div>
      <div className="receipt-subheader">PEDIDO PARA DELIVERY</div>
      
      <div className="receipt-line"></div>
      
      <div className="receipt-info">
        <div><strong>Data:</strong> {orderDate}</div>
        <div><strong>Cliente:</strong> {order.customer_name || 'N/A'}</div>
        <div><strong>Telefone:</strong> {formatPhone(order.customer_phone)}</div>
        <div><strong>Endereço:</strong> {formatAddress(order.delivery_address)}</div>
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
