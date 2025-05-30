import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Edit, RefreshCw } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn, formatPhone } from '@/lib/utils';
import { Order, statusBadge, statusLabel } from '@/types/Order';
import { animate } from '@/lib/animations';

const ScheduledOrders = () => {
  const { supabase } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<Date | null>(null);

  // Fetch scheduled orders
  const fetchScheduledOrders = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('orders_closed')
        .select('*')
        .not('scheduled_date', 'is', null);

      if (dateFilter) {
        // Filter by specific date
        const formattedDate = format(dateFilter, 'yyyy-MM-dd');
        query = query.eq('scheduled_date', formattedDate);
      }

      const { data, error } = await query.order('scheduled_date', { ascending: true });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching scheduled orders:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os pedidos agendados.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Setup realtime subscription
  useEffect(() => {
    fetchScheduledOrders();
    
    // Subscribe to changes in orders_closed table for scheduled orders
    const channel = supabase
      .channel('scheduled-orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders_closed' },
        (payload) => {
          console.log('Scheduled orders realtime update:', payload);
          
          // Only update if the record has a scheduled_date
          const newRecord = payload.new as any;
          if (newRecord && newRecord.scheduled_date) {
            fetchScheduledOrders();
            
            // Show notification for new scheduled orders
            if (payload.eventType === 'INSERT') {
              toast({
                title: 'Novo pedido agendado',
                description: `Pedido agendado para ${formatDate(newRecord.scheduled_date)}`,
              });
            }
          }
        }
      )
      .subscribe();

    // Subscribe to changes in regular orders table for records that might have scheduled_date
    const ordersChannel = supabase
      .channel('orders-scheduled-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          const newRecord = payload.new as any;
          if (newRecord && newRecord.scheduled_date) {
            console.log('Regular order with schedule update:', payload);
            fetchScheduledOrders();
          }
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(ordersChannel);
    };
  }, [dateFilter]);

  // Format date display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Data inválida';
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch (e) {
      console.error("Error formatting date:", e);
      return 'Data inválida';
    }
  };

  // Format items for display
  const formatItems = (items: any) => {
    if (!items) return 'Nenhum item';
    try {
      // Se já for array, retorna normalmente
      if (Array.isArray(items)) {
        if (!items.length) return 'Nenhum item';
        return items.map((item: any) => {
          if (typeof item === 'object' && item !== null) {
            const quantity = item.quantity || 1;
            const name = item.name || 'Item sem nome';
            return `${quantity}x ${name}`;
          }
          return String(item);
        }).join(', ');
      }
      // Se for string
      if (typeof items === 'string') {
        const trimmed = items.trim();
        // Só faz parse se parecer JSON
        if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
          const parsed = JSON.parse(trimmed);
          if (!Array.isArray(parsed) || !parsed.length) return 'Nenhum item';
          return parsed.map((item: any) => {
            if (typeof item === 'object' && item !== null) {
              const quantity = item.quantity || 1;
              const name = item.name || 'Item sem nome';
              return `${quantity}x ${name}`;
            }
            return String(item);
          }).join(', ');
        } else {
          // String simples
          return trimmed;
        }
      }
      // Se for objeto
      if (typeof items === 'object') {
        return JSON.stringify(items);
      }
      return String(items);
    } catch (e) {
      console.error("Error formatting items:", e);
      return 'Erro ao mostrar itens';
    }
  };

  // Format address for display
  const formatAddress = (address: any): string => {
    if (!address) return 'N/A';
    
    // If address is a string, return it directly
    if (typeof address === 'string') return address;
    
    // If address is an object with address properties, format it
    if (typeof address === 'object') {
      try {
        const addressObj = typeof address === 'string' ? JSON.parse(address) : address;
        const { logradouro, numero, complemento, bairro, localidade, uf } = addressObj;
        
        const addressParts = [];
        if (logradouro) addressParts.push(logradouro);
        if (numero) addressParts.push(numero);
        if (complemento) addressParts.push(complemento);
        
        return addressParts.filter(Boolean).join(', ');
      } catch (e) {
        return JSON.stringify(address);
      }
    }
    
    // Fallback: convert to string
    return String(address);
  };

  // Calculate totals
  const calculateTotal = (order: Order) => {
    let orderAmount = order.order_amount || 0;
    let deliveryFee = order.delivery_fee || 0;
    let total = order.total_amount || 0;
    
    // If order_amount is not set but total_amount is, use total as fallback
    if (orderAmount === 0 && total > 0) {
      orderAmount = total;
    }
    
    return { orderAmount, deliveryFee, total };
  };

  return (
    <div className="space-y-6">
      <div className={cn("flex justify-between items-center", animate({ variant: "fade-in" }))}>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Pedidos Agendados</h1>
        <Button onClick={fetchScheduledOrders} variant="outline" size="icon" title="Atualizar pedidos" className="animate-in hover:bg-gray-100">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Card className={cn("backdrop-blur-sm bg-white/90 shadow-lg border-purple-100", animate({ variant: "slide-up", delay: 100 }))}>
        <CardHeader>
          <CardTitle>Filtrar por data</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal shadow-sm",
                    !dateFilter && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-purple-500" />
                  {dateFilter ? format(dateFilter, "PPP", { locale: ptBR }) : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFilter || undefined}
                  onSelect={setDateFilter}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          {dateFilter && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setDateFilter(null)}
              className="hover:bg-gray-100 border-purple-200"
            >
              Limpar filtro
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className={cn("backdrop-blur-sm bg-white/90 shadow-lg border-purple-100", animate({ variant: "slide-up", delay: 200 }))}>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-muted-foreground">Nenhum pedido agendado encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead>Data Agendada</TableHead>
                    <TableHead className="text-right">Total (R$)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order, idx) => {
                    const { orderAmount, deliveryFee, total } = calculateTotal(order);
                    return (
                      <TableRow 
                        key={order.id} 
                        className={cn(
                          "hover:bg-gray-50/50 transition-colors",
                          animate({ variant: "fade-in", delay: 100 + idx * 50 })
                        )}
                      >
                        <TableCell className="font-medium">{order.customer_name || 'N/A'}</TableCell>
                        <TableCell>{formatPhone(order.customer_phone)}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {formatItems(order.items)}
                        </TableCell>
                        <TableCell>
                          {formatAddress(order.delivery_address)} 
                          {order.bairro ? `- ${order.bairro}` : ''}
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-md font-medium">
                            {order.scheduled_date ? formatDate(order.scheduled_date) : 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {total.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${order.status ? statusBadge[order.status as keyof typeof statusBadge] : ''}`}
                          >
                            {order.status ? statusLabel[order.status as keyof typeof statusLabel] : 'Desconhecido'}
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduledOrders;
