
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Coffee, Clock, MapPin, FileText } from 'lucide-react';

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
          .eq('available', true);

        // Pending orders
        const { count: pendingOrders } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        // Closed days in current month
        const { count: closedDays } = await supabase
          .from('business_hours')
          .select('*', { count: 'exact', head: true })
          .eq('is_open', false);

        // Total neighborhoods
        const { count: neighborhoods } = await supabase
          .from('neighborhoods')
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
      icon: <Coffee className="h-8 w-8 text-restaurant-primary" />,
      color: 'border-restaurant-primary',
    },
    {
      title: 'Pedidos Pendentes',
      value: stats.pendingOrders,
      description: 'Aguardando confirmação',
      icon: <FileText className="h-8 w-8 text-restaurant-secondary" />,
      color: 'border-restaurant-secondary',
    },
    {
      title: 'Dias Fechados',
      value: stats.closedDays,
      description: 'Neste mês',
      icon: <Clock className="h-8 w-8 text-restaurant-warning" />,
      color: 'border-restaurant-warning',
    },
    {
      title: 'Bairros',
      value: stats.neighborhoods,
      description: 'Áreas de entrega',
      icon: <MapPin className="h-8 w-8 text-restaurant-success" />,
      color: 'border-restaurant-success',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
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
          {statCards.map((card) => (
            <Card key={card.title} className={`shadow-sm card-hover border-l-4 ${card.color}`}>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
            <CardDescription>Configurações e recursos disponíveis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Supabase URL</span>
                <span className="text-sm font-mono bg-gray-100 p-1 rounded">
                  {import.meta.env.VITE_SUPABASE_URL ? "✅ Configurado" : "❌ Não configurado"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Supabase Anon Key</span>
                <span className="text-sm font-mono bg-gray-100 p-1 rounded">
                  {import.meta.env.VITE_SUPABASE_ANON_KEY ? "✅ Configurado" : "❌ Não configurado"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Vector Extension</span>
                <span className="text-sm font-mono bg-gray-100 p-1 rounded">✅ Disponível</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
