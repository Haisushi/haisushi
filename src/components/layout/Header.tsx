
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const Header = () => {
  const { signOut } = useAuth();

  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="h-16 flex items-center justify-between px-6">
        <h1 className="text-xl font-semibold">Painel Administrativo</h1>
        <Button variant="outline" className="flex items-center gap-2" onClick={signOut}>
          <LogOut className="h-4 w-4" />
          <span>Sair</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
