
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Menu, X, Coffee, Clock, MapPin, FileText, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <Home className="h-5 w-5" /> },
    { name: 'Cardápio', path: '/admin/menu', icon: <Coffee className="h-5 w-5" /> },
    { name: 'Horários', path: '/admin/hours', icon: <Clock className="h-5 w-5" /> },
    { name: 'Bairros', path: '/admin/neighborhoods', icon: <MapPin className="h-5 w-5" /> },
    { name: 'Pedidos', path: '/admin/orders', icon: <FileText className="h-5 w-5" /> },
    { name: 'Usuário', path: '/admin/user', icon: <User className="h-5 w-5" /> },
  ];

  return (
    <aside
      className={cn(
        'bg-white h-screen border-r transition-all duration-300 flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <div className="font-bold text-xl text-restaurant-primary">RestAdmin</div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </Button>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                    isActive
                      ? 'bg-restaurant-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  )
                }
              >
                {item.icon}
                {!collapsed && <span>{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
