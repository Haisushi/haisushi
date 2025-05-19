
import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';

const AdminLayout = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log("AdminLayout: Verificando autenticação", { user, loading });
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-restaurant-primary"></div>
      </div>
    );
  }

  if (!user) {
    console.log("AdminLayout: Usuário não autenticado, redirecionando para /login");
    // Use replace: true to avoid history issues
    return <Navigate to="/login" replace />;
  }

  console.log("AdminLayout: Renderizando layout administrativo para usuário autenticado");
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-6 overflow-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
