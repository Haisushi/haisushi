import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Edit } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn, formatPhone } from '@/lib/utils';
import { Order, statusBadge, statusLabel } from '@/types/Order';

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

  useEffect(() => {
    fetchScheduledOrders();
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Pedidos Agendados</h1>
      </div>

      <Card>
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
                    "w-[240px] justify-start text-left font-normal",
                    !dateFilter && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
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
            >
              Limpar filtro
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-restaurant-primary"></div>
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
                  {orders.map((order) => {
                    const { orderAmount, deliveryFee, total } = calculateTotal(order);
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.customer_name || 'N/A'}</TableCell>
                        <TableCell>{formatPhone(order.customer_phone)}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {formatItems(order.items)}
                        </TableCell>
                        <TableCell>{order.delivery_address || 'N/A'} {order.bairro ? `- ${order.bairro}` : ''}</TableCell>
                        <TableCell>{order.scheduled_date ? formatDate(order.scheduled_date) : 'N/A'}</TableCell>
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
