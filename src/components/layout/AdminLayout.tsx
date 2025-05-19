
import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import { animate } from '@/lib/animations';
import { cn } from '@/lib/utils';

const AdminLayout = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log("AdminLayout: Verificando autenticação", { user, loading });
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user) {
    console.log("AdminLayout: Usuário não autenticado, redirecionando para /login");
    return <Navigate to="/login" replace />;
  }

  console.log("AdminLayout: Renderizando layout administrativo para usuário autenticado");
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className={cn("flex flex-col flex-1 transition-all duration-300", animate({ variant: "fade-in" }))}>
        <Header />
        <main className="flex-1 p-6 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100">
          <div className={animate({ variant: "slide-up", delay: 150 })}>
            <Outlet />
          </div>
        </main>
        <footer className="py-4 px-6 text-center text-sm text-gray-500 border-t border-gray-200 backdrop-blur-sm bg-white/50">
          <p>&copy; {new Date().getFullYear()} Sistema de Gestão de Restaurante</p>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
