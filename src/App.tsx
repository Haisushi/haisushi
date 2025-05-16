
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Layouts
import AdminLayout from "@/components/layout/AdminLayout";

// Pages
import Login from "@/pages/Login";
import Dashboard from "@/pages/admin/Dashboard";
import MenuItems from "@/pages/admin/MenuItems";
import BusinessHours from "@/pages/admin/BusinessHours";
import Neighborhoods from "@/pages/admin/Neighborhoods";
import Orders from "@/pages/admin/Orders";
import UserProfile from "@/pages/admin/UserProfile";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route path="/login" element={<Login />} />
            
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="menu" element={<MenuItems />} />
              <Route path="hours" element={<BusinessHours />} />
              <Route path="neighborhoods" element={<Neighborhoods />} />
              <Route path="orders" element={<Orders />} />
              <Route path="user" element={<UserProfile />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
