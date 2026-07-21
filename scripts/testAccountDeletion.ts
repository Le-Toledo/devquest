import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { createAccountDeletionService } from '../src/services/accountDeletionCore';
import { AuthUser } from '../src/types/backend';

type InvokeCall = {
  functionName: string;
  body: { confirmation: 'EXCLUIR' };
  authorization: string;
};

type MockClientOptions = {
  sessionToken?: string;
  invokeError?: string;
  throwOnInvoke?: boolean;
  calls?: InvokeCall[];
};

const user = { id: 'user-qa-1', email: 'qa@example.com' } as AuthUser;

const createMockClient = ({ sessionToken, invokeError, throwOnInvoke, calls = [] }: MockClientOptions) => ({
  auth: {
    getSession: async () => ({ data: { session: sessionToken ? { access_token: sessionToken } : null } })
  },
  functions: {
    invoke: async (functionName: string, options: { body: { confirmation: 'EXCLUIR' }; headers: { Authorization: string } }) => {
      calls.push({ functionName, body: options.body, authorization: options.headers.Authorization });
      if (throwOnInvoke) throw new Error('network failed');
      return { error: invokeError ? { message: invokeError } : null };
    }
  }
});

const run = async () => {
  const service = createAccountDeletionService({ supabase: null, functionName: 'delete-account' });
  const result = await service.requestAccountDeletion(user);
  assert.equal(result.status, 'blocked', 'Sem Supabase a exclusão deve ser bloqueada.');

  const calls: InvokeCall[] = [];
  const noSessionService = createAccountDeletionService({ supabase: createMockClient({ calls }), functionName: 'delete-account' });
  const noSessionResult = await noSessionService.requestAccountDeletion(user);
  assert.equal(noSessionResult.status, 'error', 'Sem sessão local não deve chamar a função remota.');
  assert.equal(calls.length, 0, 'Sem token não deve invocar Edge Function.');

  const successCalls: InvokeCall[] = [];
  const successService = createAccountDeletionService({
    supabase: createMockClient({ sessionToken: 'token-valido', calls: successCalls }),
    functionName: 'delete-account'
  });
  const successResult = await successService.requestAccountDeletion(user);
  assert.equal(successResult.status, 'deleted', 'Resposta remota sem erro deve ser tratada como exclusão concluída.');
  assert.deepEqual(successCalls[0], {
    functionName: 'delete-account',
    body: { confirmation: 'EXCLUIR' },
    authorization: 'Bearer token-valido'
  });

  const missingFunctionCalls: InvokeCall[] = [];
  const missingFunctionService = createAccountDeletionService({
    supabase: createMockClient({ sessionToken: 'token-valido', invokeError: 'Function not found', calls: missingFunctionCalls }),
    functionName: 'delete-account'
  });
  const missingFunctionResult = await missingFunctionService.requestAccountDeletion(user);
  assert.equal(missingFunctionResult.status, 'blocked', 'Função ausente deve manter sessão local e bloquear sucesso falso.');
  assert.match(missingFunctionResult.message, /Edge Function precisa ser implantada/i);
  assert.equal(missingFunctionCalls.length, 1);

  const networkService = createAccountDeletionService({
    supabase: createMockClient({ sessionToken: 'token-valido', throwOnInvoke: true }),
    functionName: 'delete-account'
  });
  const networkResult = await networkService.requestAccountDeletion(user);
  assert.equal(networkResult.status, 'error', 'Falha de rede não deve ser apresentada como sucesso.');
  assert.match(networkResult.message, /conexão|servidor/i);

const edgeFunctionSource = readFileSync('supabase/functions/delete-account/index.ts', 'utf8');
assert(edgeFunctionSource.includes("request.method !== 'POST'"), 'Edge Function deve aceitar somente POST.');
assert(edgeFunctionSource.includes("request.method === 'OPTIONS'"), 'Edge Function deve tratar OPTIONS/CORS.');
assert(edgeFunctionSource.includes("authHeader?.startsWith('Bearer ')"), 'Edge Function deve exigir Authorization Bearer.');
assert(edgeFunctionSource.includes('userClient.auth.getUser()'), 'Edge Function deve validar JWT com Supabase Auth.');
assert(edgeFunctionSource.includes('const userId = userData.user.id'), 'Edge Function deve usar somente o usuário autenticado.');
assert(!edgeFunctionSource.includes('user_id ='), 'Edge Function não deve confiar em user_id recebido no body.');
assert(edgeFunctionSource.includes("confirmation !== 'EXCLUIR'"), 'Edge Function deve exigir confirmação explícita.');
assert(edgeFunctionSource.includes('SUPABASE_SERVICE_ROLE_KEY'), 'Service role deve existir somente na Edge Function.');
assert(!edgeFunctionSource.includes('.delete().eq('), 'Edge Function deve confiar no ON DELETE CASCADE e não apagar tabelas explicitamente.');
assert(!edgeFunctionSource.includes("'player_progress'"), 'Função não deve apagar player_progress explicitamente quando cascade remoto existe.');
assert(!edgeFunctionSource.includes("'leaderboard_entries'"), 'Função não deve tentar tabela remota ausente leaderboard_entries.');
assert(!edgeFunctionSource.includes("'feedback_reports'"), 'Função não deve tentar tabela remota ausente feedback_reports.');
assert(!edgeFunctionSource.includes("'profiles'"), 'Função não deve tentar tabela remota ausente profiles.');
assert(edgeFunctionSource.includes('adminClient.auth.admin.deleteUser(userId)'), 'Auth deve ser a operação destrutiva principal.');
assert(!/console\.(log|warn|error)/.test(edgeFunctionSource), 'Edge Function de exclusão não deve registrar dados pessoais.');

const mobileSources = [
  readFileSync('src/services/accountDeletionCore.ts', 'utf8'),
  readFileSync('src/services/accountDeletionService.ts', 'utf8'),
  readFileSync('src/screens/ProfileScreen.tsx', 'utf8'),
  readFileSync('src/hooks/useAuth.tsx', 'utf8'),
  readFileSync('src/services/supabaseClient.ts', 'utf8')
].join('\n');
const profileSource = readFileSync('src/screens/ProfileScreen.tsx', 'utf8');
const storageSource = readFileSync('src/services/storage.ts', 'utf8');
const deletionSuccessBlock = profileSource.slice(
  profileSource.indexOf("if (result.status === 'deleted')"),
  profileSource.indexOf('return;', profileSource.indexOf("if (result.status === 'deleted')")) + 'return;'.length
);
assert(!mobileSources.includes('SUPABASE_SERVICE_ROLE_KEY'), 'Bundle mobile não pode conter service role.');
assert(!mobileSources.includes('serviceRoleKey'), 'Bundle mobile não pode manipular service role.');
assert(mobileSources.includes("body: { confirmation: 'EXCLUIR' }"), 'Cliente deve enviar apenas confirmação, sem user_id.');
assert(!mobileSources.includes('body: { user_id'), 'Cliente não deve enviar user_id para exclusão.');
assert(mobileSources.includes('deleteAccountConfirmation.trim() !== \'EXCLUIR\''), 'UI deve bloquear confirmação diferente de EXCLUIR.');
assert(mobileSources.includes('deletingAccount || resetting || signingOut'), 'UI deve bloquear toque duplicado/ações concorrentes.');
assert(deletionSuccessBlock.includes('await clearAccountLocalData()'), 'Exclusão deve usar limpeza local exclusiva após sucesso remoto.');
assert(deletionSuccessBlock.includes('await clearLocalSession()'), 'Sessão local persistida deve ser removida após sucesso remoto.');
assert(!deletionSuccessBlock.includes('syncService'), 'Exclusão não deve sincronizar depois que a conta remota foi removida.');
assert(!deletionSuccessBlock.includes('resetCloudProgress'), 'Exclusão não deve resetar nuvem depois que a conta remota foi removida.');
assert(!deletionSuccessBlock.includes('await signOut()'), 'Exclusão não deve depender de signOut remoto após remover Auth.');
assert(storageSource.includes('clearAccountLocalData'), 'Storage deve ter limpeza local dedicada para exclusão de conta.');
assert(storageSource.includes('storageKeys.adaptiveLearning'), 'Limpeza de conta deve remover dados adaptativos.');
assert(storageSource.includes('storageKeys.aiTutorHistory'), 'Limpeza de conta deve remover histórico do Professor Byte.');
assert(storageSource.includes('storageKeys.cloudSyncAt'), 'Limpeza de conta deve remover marcador de sync.');
assert(storageSource.includes('storageKeys.feedbackReports'), 'Limpeza de conta deve remover feedbacks pendentes locais.');
assert(!storageSource.slice(storageSource.indexOf('const accountLocalStorageKeys'), storageSource.indexOf('export const storage')).includes('storageKeys.settings'), 'Limpeza de conta não deve apagar tema/configuração global.');
assert(!storageSource.slice(storageSource.indexOf('const accountLocalStorageKeys'), storageSource.indexOf('export const storage')).includes('storageKeys.soundSettings'), 'Limpeza de conta não deve apagar preferências globais de som.');
assert(!storageSource.slice(storageSource.indexOf('const accountLocalStorageKeys'), storageSource.indexOf('export const storage')).includes('storageKeys.onboarding'), 'Limpeza de conta não deve apagar onboarding global.');
assert(!storageSource.includes('syncService'), 'resetProgress/clearAccountLocalData não podem sincronizar remotamente.');
assert(!storageSource.includes('supabase'), 'Storage local não pode chamar Supabase.');
assert(mobileSources.includes("signOut({ scope: 'local' })"), 'Limpeza da sessão deve usar escopo local.');
assert(mobileSources.includes('AsyncStorage.removeItem(supabaseAuthStorageKey)'), 'Limpeza da sessão deve remover storage key do Supabase como fallback.');

  console.log('Account deletion safety tests OK');
};

export const accountDeletionTests = run();
