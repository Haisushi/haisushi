
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Edit, FileText, Plus } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Define the order type
type Order = {
  id: number;
  customer_name: string;
  customer_phone: string;
  items: any;
  total: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'canceled';
  created_at: string;
};

// Define the form schema
const orderFormSchema = z.object({
  customer_name: z.string().min(3, { message: 'Nome precisa ter no mínimo 3 caracteres' }),
  customer_phone: z.string().min(8, { message: 'Telefone inválido' }),
  items: z.string().refine((val) => {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed);
    } catch (e) {
      return false;
    }
  }, { message: 'Formato JSON inválido. Deve ser um array de itens.' }),
  total: z.coerce.number().positive({ message: 'O total deve ser um valor positivo' }),
  status: z.enum(['pending', 'confirmed', 'delivered', 'canceled']),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

// Status badge mapping
const statusBadge = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  canceled: 'bg-red-100 text-red-800',
};

const statusLabel = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  delivered: 'Entregue',
  canceled: 'Cancelado',
};

const Orders = () => {
  const { supabase } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditStatus, setIsEditStatus] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string>('');

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customer_name: '',
      customer_phone: '',
      items: '[]',
      total: 0,
      status: 'pending',
    },
  });

  // Fetch orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      let query = supabase.from('orders').select('*');

      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      if (dateFilter) {
        // Filter by date (using the start of the day and end of the day)
        const startDate = `${dateFilter}T00:00:00`;
        const endDate = `${dateFilter}T23:59:59`;
        query = query.gte('created_at', startDate).lte('created_at', endDate);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os pedidos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, dateFilter]);

  const openEditStatusDialog = (order: Order) => {
    setCurrentOrder(order);
    setIsEditStatus(true);
    form.reset({
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      items: JSON.stringify(order.items, null, 2),
      total: order.total,
      status: order.status,
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setCurrentOrder(null);
    setIsEditStatus(false);
    form.reset({
      customer_name: '',
      customer_phone: '',
      items: '[]',
      total: 0,
      status: 'pending',
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: OrderFormValues) => {
    try {
      const itemsData = JSON.parse(values.items);
      
      if (currentOrder && isEditStatus) {
        // Update existing order status
        const { error } = await supabase
          .from('orders')
          .update({
            status: values.status,
          })
          .eq('id', currentOrder.id);

        if (error) throw error;

        toast({
          title: 'Pedido atualizado',
          description: 'O status do pedido foi atualizado com sucesso.',
        });
      } else {
        // Create new order for testing
        const { error } = await supabase.from('orders').insert({
          customer_name: values.customer_name,
          customer_phone: values.customer_phone,
          items: itemsData,
          total: values.total,
          status: values.status,
        });

        if (error) throw error;

        toast({
          title: 'Pedido criado',
          description: 'O pedido foi criado com sucesso para testes.',
        });
      }

      setIsDialogOpen(false);
      fetchOrders();
    } catch (error) {
      console.error('Error saving order:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o pedido.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  // Format the items display for the table
  const formatItems = (items: any[]) => {
    if (!items || !items.length) return 'Nenhum item';
    
    return items.map((item: any) => {
      if (typeof item === 'object' && item.name) {
        const quantity = item.quantity || 1;
        return `${quantity}x ${item.name}`;
      }
      return String(item);
    }).join(', ');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Pedidos</h1>
        <Button onClick={openCreateDialog} className="bg-restaurant-primary hover:bg-restaurant-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Novo Pedido (Teste)
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={!statusFilter ? "default" : "outline"}
              onClick={() => setStatusFilter(null)}
            >
              Todos
            </Button>
            <Button
              variant={statusFilter === 'pending' ? "default" : "outline"}
              onClick={() => setStatusFilter('pending')}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              Pendentes
            </Button>
            <Button
              variant={statusFilter === 'confirmed' ? "default" : "outline"}
              onClick={() => setStatusFilter('confirmed')}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Confirmados
            </Button>
            <Button
              variant={statusFilter === 'delivered' ? "default" : "outline"}
              onClick={() => setStatusFilter('delivered')}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Entregues
            </Button>
            <Button
              variant={statusFilter === 'canceled' ? "default" : "outline"}
              onClick={() => setStatusFilter('canceled')}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Cancelados
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-auto"
            />
            {dateFilter && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setDateFilter('')}
              >
                Limpar
              </Button>
            )}
          </div>
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
              <p className="text-muted-foreground">Nenhum pedido encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead className="text-right">Total (R$)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.customer_name}</TableCell>
                      <TableCell>{order.customer_phone}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {formatItems(order.items)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {order.total.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${statusBadge[order.status]}`}
                        >
                          {statusLabel[order.status]}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditStatusDialog(order)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={`sm:max-w-[${isEditStatus ? '500px' : '700px'}]`}>
          <DialogHeader>
            <DialogTitle>
              {isEditStatus
                ? 'Atualizar Status do Pedido'
                : 'Criar Pedido de Teste'}
            </DialogTitle>
            <DialogDescription>
              {isEditStatus
                ? 'Atualize o status do pedido selecionado.'
                : 'Crie um pedido de teste para fins de desenvolvimento.'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {!isEditStatus && (
                <>
                  <FormField
                    control={form.control}
                    name="customer_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Cliente</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customer_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="(00) 00000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="items"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Itens (JSON)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='[{"id": 1, "name": "Pizza", "price": 35.90, "quantity": 1}]'
                            className="font-mono text-sm"
                            rows={5}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="total"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Total (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <select
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        {...field}
                      >
                        <option value="pending">Pendente</option>
                        <option value="confirmed">Confirmado</option>
                        <option value="delivered">Entregue</option>
                        <option value="canceled">Cancelado</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" className="bg-restaurant-primary hover:bg-restaurant-primary/90">
                  {isEditStatus ? 'Atualizar Status' : 'Criar Pedido'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
