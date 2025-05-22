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
import { Edit, FileText, Plus, Printer, Calendar as CalendarIcon, RefreshCw } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Order, OrderFormValues, statusBadge, statusLabel } from '@/types/Order';
import { Json } from '@/integrations/supabase/types';
import { OrderPrintView } from '@/components/admin/OrderPrintView';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn, formatPhone } from '@/lib/utils';
import { MenuItem } from '@/types/MenuItem';
import { animate } from '@/lib/animations';

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
  order_amount: z.coerce.number().positive({ message: 'O subtotal deve ser um valor positivo' }),
  delivery_fee: z.coerce.number().nonnegative({ message: 'A taxa de entrega não pode ser negativa' }),
  total_amount: z.coerce.number().positive({ message: 'O total deve ser um valor positivo' }),
  status: z.enum(['pending', 'confirmed', 'delivered', 'canceled']),
  scheduled_date: z.string().optional(),
});

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
  const [isPrintViewOpen, setIsPrintViewOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orderItems, setOrderItems] = useState<any[]>([]);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customer_name: '',
      customer_phone: '',
      items: '[]',
      order_amount: 0,
      delivery_fee: 0,
      total_amount: 0,
      status: 'pending',
      scheduled_date: '',
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

  // Buscar itens do menu ao abrir o formulário
  useEffect(() => {
    const fetchMenuItems = async () => {
      const { data, error } = await supabase.from('menu_items').select('*').eq('is_available', true);
      if (!error && data) setMenuItems(data);
    };
    fetchMenuItems();
  }, [supabase]);

  // Atualizar o campo items do formulário sempre que orderItems mudar
  useEffect(() => {
    form.setValue('items', JSON.stringify(orderItems));
    // Atualizar subtotal automaticamente
    const subtotal = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    form.setValue('order_amount', subtotal);
    const deliveryFee = form.getValues('delivery_fee') || 0;
    form.setValue('total_amount', subtotal + deliveryFee);
  }, [orderItems]);

  // Atualizar total ao mudar taxa de entrega
  useEffect(() => {
    const subtotal = form.getValues('order_amount') || 0;
    const deliveryFee = form.getValues('delivery_fee') || 0;
    form.setValue('total_amount', subtotal + deliveryFee);
  }, [form.watch('delivery_fee')]);

  const openEditStatusDialog = (order: Order) => {
    setCurrentOrder(order);
    setIsEditStatus(true);
    form.reset({
      customer_name: order.customer_name || '',
      customer_phone: order.customer_phone || '',
      items: JSON.stringify(order.items, null, 2),
      order_amount: order.order_amount || 0,
      delivery_fee: order.delivery_fee || 0,
      total_amount: order.total_amount || 0,
      status: order.status as any || 'pending',
      scheduled_date: order.scheduled_date || '',
    });
    setIsDialogOpen(true);
    // Also reset the date picker state
    setSelectedDate(order.scheduled_date ? new Date(order.scheduled_date) : null);
  };

  const openPrintView = (order: Order) => {
    setCurrentOrder(order);
    setIsPrintViewOpen(true);
  };

  const openCreateDialog = () => {
    setCurrentOrder(null);
    setIsEditStatus(false);
    form.reset({
      customer_name: '',
      customer_phone: '',
      items: '[]',
      order_amount: 0,
      delivery_fee: 0,
      total_amount: 0,
      status: 'pending',
      scheduled_date: '',
    });
    setSelectedDate(null);
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: OrderFormValues) => {
    try {
      const itemsData = JSON.parse(values.items) as Json;
      
      if (currentOrder && isEditStatus) {
        // Update existing order status and scheduled_date
        const updates: any = {
          status: values.status,
        };
        
        // Only add scheduled_date if it was selected
        if (selectedDate) {
          updates.scheduled_date = format(selectedDate, 'yyyy-MM-dd');
        } else {
          updates.scheduled_date = null;
        }
        
        const { error } = await supabase
          .from('orders')
          .update(updates)
          .eq('id', currentOrder.id);

        if (error) throw error;

        toast({
          title: 'Pedido atualizado',
          description: 'O pedido foi atualizado com sucesso.',
        });
      } else {
        // Create new order for testing
        const newOrder: any = {
          customer_name: values.customer_name,
          customer_phone: values.customer_phone,
          items: itemsData,
          order_amount: values.order_amount,
          delivery_fee: values.delivery_fee,
          total_amount: values.total_amount,
          status: values.status,
        };
        
        // Add scheduled_date if selected
        if (selectedDate) {
          newOrder.scheduled_date = format(selectedDate, 'yyyy-MM-dd');
        }
        
        const { error } = await supabase.from('orders').insert(newOrder);

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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  // Updated formatting function to properly handle different item structures
  const formatItems = (items: Json) => {
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
                    <TableHead className="text-right">Subtotal (R$)</TableHead>
                    <TableHead className="text-right">Taxa (R$)</TableHead>
                    <TableHead className="text-right">Total (R$)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
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
                        <TableCell className="text-right font-mono">
                          {orderAmount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {deliveryFee.toFixed(2)}
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
                        <TableCell>{formatDate(order.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditStatusDialog(order)}
                            title="Editar Status"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openPrintView(order)}
                            title="Imprimir Pedido"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
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

      {/* Order Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={`sm:max-w-[${isEditStatus ? '500px' : '700px'}]`}>
          <DialogHeader>
            <DialogTitle>
              {isEditStatus
                ? 'Atualizar Pedido'
                : 'Criar Pedido de Teste'}
            </DialogTitle>
            <DialogDescription>
              {isEditStatus
                ? 'Atualize o status do pedido ou agende-o para uma data futura.'
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

                  {/* Seletor automatizado de itens do menu */}
                  <div className="space-y-2">
                    <FormLabel>Itens do Pedido</FormLabel>
                    <div className="flex gap-2">
                      <select id="menuItemSelect" className="border rounded px-2 py-1" defaultValue="" onChange={e => {
                        const id = e.target.value;
                        if (!id) return;
                        const item = menuItems.find(mi => mi.id === id);
                        if (!item) return;
                        setOrderItems(prev => {
                          // Se já existe, só aumenta a quantidade
                          const idx = prev.findIndex(i => i.id === id);
                          if (idx !== -1) {
                            const updated = [...prev];
                            updated[idx].quantity += 1;
                            return updated;
                          }
                          return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
                        });
                      }}>
                        <option value="">Selecione um item</option>
                        {menuItems.map(item => (
                          <option key={item.id} value={item.id}>{item.name} - R$ {item.price.toFixed(2)}</option>
                        ))}
                      </select>
                    </div>
                    {/* Lista de itens adicionados */}
                    <ul className="mt-2 space-y-1">
                      {orderItems.map((item, idx) => (
                        <li key={item.id} className="flex items-center gap-2">
                          <span>{item.quantity}x {item.name} (R$ {item.price.toFixed(2)})</span>
                          <Button size="sm" variant="outline" type="button" onClick={() => setOrderItems(prev => prev.map((i, iidx) => iidx === idx ? { ...i, quantity: i.quantity + 1 } : i))}>+</Button>
                          <Button size="sm" variant="outline" type="button" onClick={() => setOrderItems(prev => prev.map((i, iidx) => iidx === idx && i.quantity > 1 ? { ...i, quantity: i.quantity - 1 } : i))} disabled={item.quantity <= 1}>-</Button>
                          <Button size="sm" variant="destructive" type="button" onClick={() => setOrderItems(prev => prev.filter((_, iidx) => iidx !== idx))}>Remover</Button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="order_amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor do Pedido (R$)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => {
                                field.onChange(parseFloat(e.target.value) || 0);
                                // Calculate total when order amount changes
                                const orderAmount = parseFloat(e.target.value) || 0;
                                const deliveryFee = parseFloat(form.getValues('delivery_fee').toString()) || 0;
                                form.setValue('total_amount', orderAmount + deliveryFee);
                              }}
                              value={field.value.toString()}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="delivery_fee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Taxa de Entrega (R$)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => {
                                field.onChange(parseFloat(e.target.value) || 0);
                                // Calculate total when delivery fee changes
                                const orderAmount = parseFloat(form.getValues('order_amount').toString()) || 0;
                                const deliveryFee = parseFloat(e.target.value) || 0;
                                form.setValue('total_amount', orderAmount + deliveryFee);
                              }}
                              value={field.value.toString()}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="total_amount"
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
                              className="font-bold"
                              value={field.value.toString()}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}

              {/* Date picker for scheduling */}
              <FormItem className="flex flex-col">
                <FormLabel>Data de Agendamento (opcional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate || undefined}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {selectedDate && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 w-fit"
                    onClick={() => setSelectedDate(null)}
                  >
                    Remover data
                  </Button>
                )}
              </FormItem>

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
                  {isEditStatus ? 'Atualizar Pedido' : 'Criar Pedido'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Order Print View */}
      <OrderPrintView 
        order={currentOrder} 
        open={isPrintViewOpen} 
        onOpenChange={setIsPrintViewOpen}
      />
    </div>
  );
};

export default Orders;
