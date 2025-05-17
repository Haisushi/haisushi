
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Import the base URL constant
import { SUPABASE_BASE_URL } from '@/integrations/supabase/client';

const Header = () => {
  const { signOut } = useAuth();
  
  // Check if using demo Supabase URL by comparing with the hardcoded value
  // This is a safe approach since the URL is already publicly in the client file
  const isDemoMode = SUPABASE_BASE_URL.includes('placeholder.supabase.co') || 
                   SUPABASE_BASE_URL.includes('eflkehzzvaumatnapmrm.supabase.co');

  return (
    <header className="bg-white border-b flex flex-col sticky top-0 z-10">
      {isDemoMode && (
        <Alert variant="destructive" className="rounded-none border-y border-amber-200 py-1 bg-amber-50 text-amber-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Usando modo demonstração. Para funcionalidades completas, conecte ao Supabase e configure as variáveis de ambiente.
          </AlertDescription>
        </Alert>
      )}
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
