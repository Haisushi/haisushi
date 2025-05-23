import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Clock,
  HomeIcon,
  LayoutDashboard,
  MapPin,
  Menu,
  Package,
  ScrollText,
  Settings,
  User,
  Users,
} from 'lucide-react';

const sidebarItems = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Cardápio',
    href: '/admin/menu',
    icon: Menu,
  },
  {
    name: 'Horários',
    href: '/admin/hours',
    icon: Clock,
  },
  {
    name: 'Zonas de Entrega',
    href: '/admin/delivery-zones',
    icon: MapPin,
  },
  {
    name: 'Clientes',
    href: '/admin/customers',
    icon: Users,
  },
  {
    name: 'Pedidos',
    href: '/admin/orders',
    icon: Package,
  },
  {
    name: 'Pedidos Agendados',
    href: '/admin/scheduled-orders',
    icon: Calendar,
  },
  {
    name: 'Usuário',
    href: '/admin/user',
    icon: User,
  },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="bg-white border-r border-border h-full">
      <div className="p-6 flex items-center">
        <Link to="/" className="flex items-center">
          <span className="text-xl font-bold">Restaurante</span>
        </Link>
      </div>

      <nav className="p-4 space-y-2">
        {sidebarItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
              location.pathname === item.href
                ? 'bg-restaurant-primary text-white'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <item.icon size={18} />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;