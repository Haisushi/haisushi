
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
    
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log('Auth state change:', event);
      
      if (currentSession) {
        console.log('Sessão atualizada:', currentSession?.user?.email);
        setSession(currentSession);
        setUser(currentSession.user);
      } else {
        console.log('Sem sessão');
        setSession(null);
        setUser(null);
      }
    });
    
    // Then check for existing session
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
      
      if (error) {
        console.error("Erro no login:", error.message);
      } else if (data.session) {
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
