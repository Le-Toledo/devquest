import { AuthUser } from '../types/backend';

export type AccountDeletionResult =
  | { status: 'deleted'; message: string }
  | { status: 'blocked'; message: string }
  | { status: 'error'; message: string };

export const accountDeletionUnavailableMessage =
  'A exclusão remota ainda não está ativada neste ambiente. A Edge Function precisa ser implantada e validada antes da submissão à App Store.';

const friendlyDeletionError = (message?: string) => {
  const lower = message?.toLowerCase() ?? '';
  if (!message) return 'Não foi possível solicitar a exclusão agora. Tente novamente mais tarde.';
  if (lower.includes('function') || lower.includes('not found') || lower.includes('404')) return accountDeletionUnavailableMessage;
  if (lower.includes('jwt') || lower.includes('session') || lower.includes('auth')) return 'Entre novamente antes de excluir sua conta.';
  if (lower.includes('network') || lower.includes('fetch')) return 'Sem conexão com o servidor agora. Tente novamente quando estiver online.';
  return 'Não foi possível solicitar a exclusão agora. Tente novamente mais tarde.';
};

export type AccountDeletionSupabaseClient = {
  auth: {
    getSession: () => Promise<{ data: { session: { access_token: string } | null } }>;
  };
  functions: {
    invoke: (
      functionName: string,
      options: { body: { confirmation: 'EXCLUIR' }; headers: { Authorization: string } }
    ) => Promise<{ error: { message?: string } | null }>;
  };
};

type AccountDeletionDependencies = {
  supabase: AccountDeletionSupabaseClient | null;
  functionName: string;
};

export const createAccountDeletionService = ({ supabase: client, functionName }: AccountDeletionDependencies) => ({
  async requestAccountDeletion(user: AuthUser | null): Promise<AccountDeletionResult> {
    if (!user || !client) return { status: 'blocked', message: accountDeletionUnavailableMessage };

    try {
      const { data: sessionData } = await client.auth.getSession();
      if (!sessionData.session) return { status: 'error', message: 'Entre novamente antes de excluir sua conta.' };

      const { error } = await client.functions.invoke(functionName, {
        body: { confirmation: 'EXCLUIR' },
        headers: { Authorization: `Bearer ${sessionData.session.access_token}` }
      });

      if (error) return { status: 'blocked', message: friendlyDeletionError(error.message) };

      return { status: 'deleted', message: 'Conta excluída com sucesso.' };
    } catch (error) {
      return { status: 'error', message: friendlyDeletionError(error instanceof Error ? error.message : undefined) };
    }
  }
});
