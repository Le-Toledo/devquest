import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const cleanEnvValue = (value?: string) => value?.trim().replace(/^["']|["']$/g, '');

const supabaseUrl = cleanEnvValue(process.env.EXPO_PUBLIC_SUPABASE_URL);
const supabaseAnonKey = cleanEnvValue(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

const supabaseProjectRef = (() => {
  if (!supabaseUrl) return null;
  try {
    return new URL(supabaseUrl).hostname.split('.')[0] || null;
  } catch {
    return null;
  }
})();

const supabaseAuthStorageKey = supabaseProjectRef ? `sb-${supabaseProjectRef}-auth-token` : null;

const hasValidSupabaseUrl = (value?: string) => {
  if (!value || value.includes('your-project-ref') || value.includes('seu-projeto')) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname.endsWith('.supabase.co');
  } catch {
    return false;
  }
};

const hasValidAnonKey = (value?: string) => {
  if (!value || value.includes('your-public-anon-key') || value.includes('sua-chave-publica')) return false;
  if (value.startsWith('sb_publishable_')) return value.length > 30;
  if (value.startsWith('eyJ')) return value.split('.').length === 3 && value.length > 80;
  return false;
};

export const isSupabaseConfigured = hasValidSupabaseUrl(supabaseUrl) && hasValidAnonKey(supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      }
    })
  : null;

export function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase não configurado. Defina EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY.');
  }
  return supabase;
}

export async function clearSupabaseLocalSession() {
  if (supabase) {
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch {
      // A sessão local ainda precisa ser removida quando o usuário já foi apagado no servidor.
    }
  }
  if (supabaseAuthStorageKey) {
    await AsyncStorage.removeItem(supabaseAuthStorageKey);
  }
}
