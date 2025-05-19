import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import Index from '@/pages/Index';
import CategoryDetails from '@/pages/CategoryDetails';
import EpisodeDetails from '@/pages/EpisodeDetails';
import Search from '@/pages/Search';
import NotFound from '@/pages/NotFound';
import Dashboard from '@/pages/admin/Dashboard';
import EpisodeForm from '@/pages/admin/EpisodeForm';
import EpisodeList from '@/pages/admin/EpisodeList';
import CategoryForm from '@/pages/admin/CategoryForm';
import CategoryList from '@/pages/admin/CategoryList';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Index />} />
            <Route path="categories/:id" element={<CategoryDetails />} />
            <Route path="episodes/:id" element={<EpisodeDetails />} />
            <Route path="search" element={<Search />} />
            <Route path="/categoria/:id" element={<CategoryDetails />} />
          </Route>
          
          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="categories" element={<CategoryList />} />
            <Route path="categories/new" element={<CategoryForm />} />
            <Route path="categories/:id/edit" element={<CategoryForm />} />
            <Route path="episodes" element={<EpisodeList />} />
            <Route path="episodes/new" element={<EpisodeForm />} />
            <Route path="episodes/:id/edit" element={<EpisodeForm />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
