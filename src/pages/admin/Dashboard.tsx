
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Coffee, Clock, MapPin, FileText } from 'lucide-react';
import { animate } from '@/lib/animations';
import { cn } from '@/lib/utils';

type DashboardStats = {
  menuItemsAvailable: number;
  pendingOrders: number;
  closedDays: number;
  neighborhoods: number;
  loading: boolean;
};

const Dashboard = () => {
  const { supabase } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    menuItemsAvailable: 0,
    pendingOrders: 0,
    closedDays: 0,
    neighborhoods: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Available menu items
        const { count: menuItemsAvailable } = await supabase
          .from('menu_items')
          .select('*', { count: 'exact', head: true })
          .eq('is_available', true);

        // Pending orders
        const { count: pendingOrders } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        // Closed days in current month
        const { count: closedDays } = await supabase
          .from('operating_hours')
          .select('*', { count: 'exact', head: true })
          .eq('is_open', false);

        // Total neighborhoods
        const { count: neighborhoods } = await supabase
          .from('delivery_areas')
          .select('*', { count: 'exact', head: true });

        setStats({
          menuItemsAvailable: menuItemsAvailable || 0,
          pendingOrders: pendingOrders || 0,
          closedDays: closedDays || 0,
          neighborhoods: neighborhoods || 0,
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, [supabase]);

  const statCards = [
    {
      title: 'Itens Disponíveis',
      value: stats.menuItemsAvailable,
      description: 'Pratos ativos no cardápio',
      icon: <Coffee className="h-8 w-8 text-purple-500" />,
      color: 'border-purple-500 shadow-purple-500/10',
      delay: 100,
    },
    {
      title: 'Pedidos Pendentes',
      value: stats.pendingOrders,
      description: 'Aguardando confirmação',
      icon: <FileText className="h-8 w-8 text-pink-500" />,
      color: 'border-pink-500 shadow-pink-500/10',
      delay: 200,
    },
    {
      title: 'Dias Fechados',
      value: stats.closedDays,
      description: 'Neste mês',
      icon: <Clock className="h-8 w-8 text-amber-500" />,
      color: 'border-amber-500 shadow-amber-500/10',
      delay: 300,
    },
    {
      title: 'Bairros',
      value: stats.neighborhoods,
      description: 'Áreas de entrega',
      icon: <MapPin className="h-8 w-8 text-emerald-500" />,
      color: 'border-emerald-500 shadow-emerald-500/10',
      delay: 400,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className={cn("text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent", animate({ variant: "fade-in" }))}>Dashboard</h1>
      
      {stats.loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i} className="shadow-sm animate-pulse">
              <CardContent className="p-6 h-32" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <Card 
              key={card.title} 
              className={cn(
                `backdrop-blur-sm bg-white/90 shadow-lg hover:shadow-xl card-hover border-l-4 ${card.color} transform transition-all duration-300 hover:-translate-y-1`,
                animate({ variant: "slide-up", delay: card.delay })
              )}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">{card.title}</p>
                    <p className="text-3xl font-bold mt-1">{card.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                  </div>
                  <div>{card.icon}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
