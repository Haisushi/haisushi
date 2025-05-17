
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, SupabaseClient, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  supabase: SupabaseClient<Database>;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    console.log('Inicializando o contexto de autenticação');
    
    // Primeiro configurar o listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log('Auth state change:', event);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log('Sessão atualizada:', currentSession?.user?.email);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      } else if (event === 'SIGNED_OUT') {
        console.log('Usuário desconectado');
        setSession(null);
        setUser(null);
      }
    });
    
    // Depois verificar se já existe sessão
    const getInitialSession = async () => {
      try {
        console.log('Verificando sessão inicial');
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession) {
          console.log('Sessão inicial encontrada:', initialSession.user?.email);
          setSession(initialSession);
          setUser(initialSession.user);
        } else {
          console.log('Nenhuma sessão inicial encontrada');
        }
      } catch (error) {
        console.error("Erro ao obter sessão inicial:", error);
      } finally {
        setLoading(false);
      }
    };
    
    getInitialSession();
    
    return () => {
      console.log('Limpando listener de autenticação');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Tentando fazer login:', email);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (data.session) {
        console.log('Login bem-sucedido:', data.user?.email);
      }
      
      return { error };
    } catch (error) {
      console.error("SignIn error:", error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Tentando fazer logout');
      await supabase.auth.signOut();
      console.log('Logout bem-sucedido');
    } catch (error) {
      console.error("SignOut error:", error);
    }
  };

  const value = {
    user,
    session,
    supabase,
    loading,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
