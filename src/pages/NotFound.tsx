
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 text-restaurant-primary">404</h1>
        <p className="text-xl text-gray-600 mb-6">Página não encontrada</p>
        <Button 
          onClick={() => navigate("/admin")}
          className="bg-restaurant-primary hover:bg-restaurant-primary/90"
        >
          Voltar ao Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
