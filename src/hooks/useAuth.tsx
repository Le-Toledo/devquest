import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { AuthSession, AuthUser } from '../types/backend';
import { isSupabaseConfigured, supabase } from '../services/supabaseClient';

type AuthContextValue = {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<{ error?: string }>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const friendlyAuthError = (message?: string) => {
  const lower = message?.toLowerCase() ?? '';
  if (!message) return 'Nao foi possivel concluir a operacao. Tente novamente.';
  if (lower.includes('invalid login') || lower.includes('invalid credentials')) return 'Email ou senha incorretos.';
  if (lower.includes('email not confirmed')) return 'Confirme seu email antes de entrar.';
  if (lower.includes('already registered') || lower.includes('already exists')) return 'Este email ja possui uma conta.';
  if (lower.includes('password')) return 'Use uma senha com pelo menos 6 caracteres.';
  if (lower.includes('network') || lower.includes('fetch')) return 'Sem conexao com o servidor agora. Seu progresso local continua salvo.';
  return 'Nao foi possivel conectar sua conta agora. Verifique os dados e tente novamente.';
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    }).catch(() => undefined).finally(() => setLoading(false));

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase nao configurado. Preencha o .env para ativar login.' };
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      return error ? { error: friendlyAuthError(error.message) } : {};
    } catch (error) {
      return { error: friendlyAuthError(error instanceof Error ? error.message : undefined) };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase nao configurado. Preencha o .env para ativar cadastro.' };
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email: email.trim(), password });
      return error ? { error: friendlyAuthError(error.message) } : {};
    } catch (error) {
      return { error: friendlyAuthError(error instanceof Error ? error.message : undefined) };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (!supabase) return {};
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      return error ? { error: friendlyAuthError(error.message) } : {};
    } catch (error) {
      return { error: friendlyAuthError(error instanceof Error ? error.message : undefined) };
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextValue = {
    user: session?.user ?? null,
    session,
    loading,
    configured: isSupabaseConfigured,
    signIn,
    signUp,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
