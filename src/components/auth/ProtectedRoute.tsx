
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!user) {
    // Só redireciona se realmente não houver usuário autenticado
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se tiver usuário autenticado, renderiza normalmente
  return <>{children}</>;
};

export default ProtectedRoute;
