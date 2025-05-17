
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
    // 1. Primeiro, configuramos o listener para mudanças de estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      // Registramos o evento para depuração
      console.log('Auth state change:', event);
      
      // Atualizamos os estados sem causar atualizações extras
      if (currentSession?.user?.id !== user?.id || event === 'SIGNED_OUT') {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      }
    });
    
    // 2. Depois verificamos se já existe uma sessão ativa
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
      } catch (error) {
        console.error("Erro ao obter sessão inicial:", error);
      } finally {
        setLoading(false);
      }
    };
    
    getInitialSession();
    
    // Limpeza do listener quando o componente é desmontado
    return () => {
      subscription.unsubscribe();
    };
  }, []); // Array de dependências vazio garante que o efeito só é executado uma vez

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      console.error("SignIn error:", error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("SignOut error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, supabase, loading, signIn, signOut }}>
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
