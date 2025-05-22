
import { Order, AddressFormat } from '@/types/Order';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Json } from '@/integrations/supabase/types';

interface OrderReceiptContentProps {
  order: Order;
  orderItems: any[];
}

// Helper function to format address for display
export const formatAddress = (address: Json | null): string => {
  if (!address) return 'N/A';
  
  // Se for uma string, retorna diretamente
  if (typeof address === 'string') return address;
  
  try {
    // Se for um array de objetos no formato especificado
    if (Array.isArray(address) && address.length > 0) {
      const addressObj = address[0] as AddressFormat; // Pega o primeiro item do array
      
      const parts = [];
      if (addressObj?.Logradouro) parts.push(addressObj.Logradouro);
      if (addressObj?.Número) parts.push(addressObj.Número);
      if (addressObj?.Complemento && addressObj.Complemento.trim() !== '') 
        parts.push(addressObj.Complemento);
      
      return parts.filter(Boolean).join(', ');
    }
    
    // Se for um objeto com as propriedades antigas
    if (typeof address === 'object') {
      const addressObj = address as any;
      
      // Verificar se está usando o formato antigo (logradouro, numero, etc.)
      if (addressObj.logradouro || addressObj.numero) {
        const parts = [];
        if (addressObj.logradouro) parts.push(addressObj.logradouro);
        if (addressObj.numero) parts.push(addressObj.numero);
        if (addressObj.complemento) parts.push(addressObj.complemento);
        
        return parts.filter(Boolean).join(', ');
      }
    }
    
    // Fallback: converter para string JSON
    return JSON.stringify(address);
  } catch (e) {
    console.error("Erro ao formatar endereço:", e);
    return String(address);
  }
};

export const getBairroFromAddress = (address: Json | null): string => {
  if (!address) return '';
  
  try {
    if (Array.isArray(address) && address.length > 0) {
      const addressObj = address[0] as AddressFormat;
      return addressObj?.Bairro || '';
    }
    if (typeof address === 'object') {
      const addressObj = address as any;
      return addressObj?.bairro || addressObj?.Bairro || '';
    }
  } catch (e) {
    console.error("Erro ao obter bairro:", e);
  }
  return '';
};

export const OrderReceiptContent: React.FC<OrderReceiptContentProps> = ({ order, orderItems }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Recibo do Pedido</h1>

      <div className="mb-4">
        <h2 className="text-xl font-semibold">Detalhes do Cliente</h2>
        <p><strong>Nome:</strong> {order.customer_name || 'N/A'}</p>
        <p><strong>Telefone:</strong> {order.customer_phone || 'N/A'}</p>
        <p><strong>Endereço de Entrega:</strong> {formatAddress(order.delivery_address)}</p>
        <p><strong>Bairro:</strong> {order.bairro || getBairroFromAddress(order.delivery_address) || 'N/A'}</p>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold">Detalhes do Pedido</h2>
        <p><strong>ID do Pedido:</strong> {order.id}</p>
        <p><strong>Data/Hora do Pedido:</strong> {formatDate(order.created_at)}</p>
        <p><strong>Status:</strong> {order.status}</p>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold">Itens do Pedido</h2>
        <ul>
          {orderItems.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>{item.name} ({item.quantity}x)</span>
              <span>R$ {item.subtotal?.toFixed(2) || '0.00'}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold">Valores</h2>
        <p><strong>Subtotal:</strong> R$ {order.order_amount?.toFixed(2) || '0.00'}</p>
        <p><strong>Taxa de Entrega:</strong> R$ {order.delivery_fee?.toFixed(2) || '0.00'}</p>
        <p><strong>Total:</strong> R$ {order.total_amount?.toFixed(2) || '0.00'}</p>
      </div>

      <div className="text-center mt-8">
        <p>Obrigado pelo seu pedido!</p>
      </div>
    </div>
  );
};
