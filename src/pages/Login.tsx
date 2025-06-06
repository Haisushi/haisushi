
import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/components/ui/use-toast";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { animate } from '@/lib/animations';
import { cn } from '@/lib/utils';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { user, signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Login: Verificando autenticação", { user });
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log("Tentando login com:", email);
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error("Login error details:", error);
        toast({
          title: "Erro ao fazer login",
          description: error.message || "Ocorreu um erro ao tentar fazer login.",
          variant: "destructive",
        });
      } else {
        console.log("Login bem-sucedido, navegando para /admin");
        // Important: Use replace: true to prevent history issues
        navigate("/admin", { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Erro ao fazer login",
        description: "Ocorreu um erro ao tentar fazer login.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If the user is already authenticated, redirect to the admin
  if (user) {
    console.log("Login: Usuário já autenticado, redirecionando para /admin");
    return <Navigate to="/admin" replace />;
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
      <div className={cn("w-full max-w-md p-4", animate({ variant: "scale-in", duration: 500 }))}>
        <div className="backdrop-blur-xl bg-black/30 rounded-xl border border-white/10 shadow-2xl overflow-hidden hover:shadow-purple-500/10 transition-all duration-500">
          <div className="p-8">
            <h2 className={cn("text-2xl font-bold text-white text-center mb-2", animate({ variant: "fade-in", delay: 200 }))}>
              Faça o seu login
              <span className="ml-1 text-purple-400 text-xs animate-pulse">•</span>
            </h2>
            
            <form onSubmit={handleLogin} className="mt-6 space-y-6">
              <div className={cn("space-y-2", animate({ variant: "slide-up", delay: 300 }))}>
                <Label htmlFor="email" className="text-white/90 text-sm">
                  email
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="exemplo@restaurante.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white/10 border-white/10 text-white placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  />
                </div>
              </div>
              
              <div className={cn("space-y-2", animate({ variant: "slide-up", delay: 400 }))}>
                <div className="flex justify-between">
                  <Label htmlFor="password" className="text-white/90 text-sm">
                    senha
                  </Label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-white/10 border-white/10 text-white placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-2 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-white transition-colors" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-white transition-colors" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className={cn("text-right", animate({ variant: "fade-in", delay: 500 }))}>
                <button
                  type="button"
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                  onClick={() => toast({
                    description: "Contate o administrador para redefinir sua senha.",
                  })}
                >
                  esqueci minha senha
                </button>
              </div>
              
              <Button 
                className={cn(
                  "w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium border-0 shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:-translate-y-1", 
                  animate({ variant: "slide-up", delay: 600 })
                )}
                type="submit" 
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
              
              <p className={cn("text-center text-xs text-gray-400", animate({ variant: "fade-in", delay: 700 }))}>
                ainda não tenho uma conta
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
