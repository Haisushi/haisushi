
import { Outlet, NavLink } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { 
  Sidebar, 
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent, 
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { Home, Plus, List, LogOut, FolderPlus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const AdminLayout = () => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const { signOut } = useAuth();

  const sidebarMenuItems = [
    { icon: Home, label: "Dashboard", path: "/admin" },
    { icon: FolderPlus, label: "Gerenciar Categorias", path: "/admin/categories" },
    { icon: Plus, label: "Nova Categoria", path: "/admin/categories/new" },
    { icon: List, label: "Listar Episódios", path: "/admin/episodes" },
    { icon: Plus, label: "Novo Episódio", path: "/admin/episodes/new" }
  ];

  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    signOut();
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar 
          className={`${sidebarOpen ? "w-64" : "w-14"} transition-all duration-300 ease-in-out`} 
          collapsible="icon"
        >
          <div className="flex items-center justify-between p-4">
            {sidebarOpen && <span className="font-bold text-lg text-podcast">Admin Panel</span>}
            <SidebarTrigger onClick={() => setSidebarOpen(!sidebarOpen)} />
          </div>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarMenuItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.path} 
                          end={item.path === "/admin"}
                          className={({ isActive }) => 
                            `flex items-center py-2 px-3 rounded-md transition-colors ${
                              isActive 
                                ? "bg-podcast text-white" 
                                : "text-gray-600 hover:bg-gray-100"
                            }`
                          }
                        >
                          <item.icon className="h-5 w-5 mr-2" />
                          {sidebarOpen && item.label}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <div className="mt-auto p-4">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-gray-600 hover:bg-gray-100" 
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5 mr-2" />
                {sidebarOpen && "Sair"}
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1">
          <Navbar />
          <div className="p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
