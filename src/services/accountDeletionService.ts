import { releaseConfig } from './releaseConfig';
import { supabase } from './supabaseClient';
import {
  AccountDeletionResult,
  AccountDeletionSupabaseClient,
  createAccountDeletionService
} from './accountDeletionCore';

export type { AccountDeletionResult };

export const accountDeletionService = createAccountDeletionService({
  supabase: supabase as AccountDeletionSupabaseClient | null,
  functionName: releaseConfig.accountDeletionFunctionName
});

export { createAccountDeletionService };
