import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { AuthSession, AuthUser } from '../types/backend';
import { isSupabaseConfigured, supabase } from '../services/supabaseClient';

const supabaseNotConfiguredMessage = 'Supabase não configurado. Configure as variáveis de ambiente para usar autenticação real.';

type AuthContextValue = {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<{ error?: string }>;
};

type AuthResult = {
  error?: string;
  session?: AuthSession | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const friendlyAuthError = (message?: string) => {
  const lower = message?.toLowerCase() ?? '';
  if (!message) return 'Não foi possível concluir a operação. Tente novamente.';
  if (lower.includes('invalid login') || lower.includes('invalid credentials')) return 'Email ou senha incorretos.';
  if (lower.includes('email not confirmed') || lower.includes('email_not_confirmed')) return 'Confirme seu e-mail antes de entrar.';
  if (lower.includes('already registered') || lower.includes('already exists')) return 'Este e-mail já possui uma conta.';
  if (lower.includes('password')) return 'Use uma senha com pelo menos 6 caracteres.';
  if (lower.includes('network') || lower.includes('fetch')) return 'Sem conexão com o servidor no momento. Seu progresso local continua salvo.';
  return 'Não foi possível conectar sua conta agora. Verifique os dados e tente novamente.';
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
    if (!supabase) return { error: supabaseNotConfiguredMessage };
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) return { error: friendlyAuthError(error.message) };
      if (!data.session) return { error: 'Confirme seu e-mail antes de entrar.', session: null };
      setSession(data.session);
      return { session: data.session };
    } catch (error) {
      return { error: friendlyAuthError(error instanceof Error ? error.message : undefined) };
    }
  };

  const signUp = async (email: string, password: string) => {
    if (!supabase) return { error: supabaseNotConfiguredMessage };
    try {
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
      if (error) return { error: friendlyAuthError(error.message) };
      setSession(data.session);
      return { session: data.session };
    } catch (error) {
      return { error: friendlyAuthError(error instanceof Error ? error.message : undefined) };
    }
  };

  const signOut = async () => {
    if (!supabase) return {};
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) setSession(null);
      return error ? { error: friendlyAuthError(error.message) } : {};
    } catch (error) {
      return { error: friendlyAuthError(error instanceof Error ? error.message : undefined) };
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
