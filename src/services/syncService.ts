import { academyProgressService } from './academyProgressService';
import { campaignProgressService } from './campaignProgressService';
import { codeArenaService } from './codeArenaService';
import { localAnalyticsService } from './localAnalyticsService';
import { reviewService } from './reviewService';
import { storage } from './storage';
import { streakService } from './streakService';
import { supabase } from './supabaseClient';
import { AuthUser, CloudProgress, SyncResult } from '../types/backend';
import { calculateLevel } from '../utils/progression';

const latestIso = () => new Date().toISOString();

function chooseBetterProgress(local: CloudProgress, cloud?: CloudProgress | null): CloudProgress {
  if (!cloud) return local;
  const localScore = local.player.xp + Object.keys(local.player.completedStages).length * 250 + (local.academy?.completedLessonIds.length ?? 0) * 80 + (local.arena?.completedChallengeIds.length ?? 0) * 80;
  const cloudScore = cloud.player.xp + Object.keys(cloud.player.completedStages).length * 250 + (cloud.academy?.completedLessonIds.length ?? 0) * 80 + (cloud.arena?.completedChallengeIds.length ?? 0) * 80;
  if (cloudScore > localScore) {
    return { ...cloud, updatedAt: latestIso() };
  }
  return local;
}

const friendlySyncError = (message?: string) => {
  const lower = message?.toLowerCase() ?? '';
  if (lower.includes('failed to fetch') || lower.includes('network')) return 'Sem conexao com a nuvem agora. Seu progresso local continua salvo.';
  if (lower.includes('permission') || lower.includes('row-level') || lower.includes('policy')) return 'A sincronizacao foi bloqueada pela seguranca do Supabase. Verifique o SQL/RLS.';
  if (lower.includes('jwt')) return 'Sua sessao expirou. Entre novamente para sincronizar.';
  return 'Nao foi possivel sincronizar agora. Tente novamente em instantes.';
};

export const syncService = {
  async buildLocalProgress(user: AuthUser): Promise<CloudProgress> {
    const player = await storage.loadPlayer();
    return {
      userId: user.id,
      player,
      campaign: await campaignProgressService.load(),
      academy: await academyProgressService.load(),
      arena: await codeArenaService.load(),
      reviewErrors: await reviewService.load(),
      streak: await streakService.load(),
      updatedAt: latestIso()
    };
  },

  async syncNow(user: AuthUser | null): Promise<SyncResult> {
    if (!supabase) return { status: 'disabled', message: 'Supabase nao configurado. O app continua funcionando offline.' };
    if (!user) return { status: 'offline', message: 'Entre na sua conta para sincronizar.' };

    try {
      const local = await this.buildLocalProgress(user);
      const { data: cloudRow, error: loadError } = await supabase.from('cloud_progress').select('progress, updated_at').eq('user_id', user.id).maybeSingle();
      if (loadError) return { status: 'error', message: friendlySyncError(loadError.message) };

      const cloud = cloudRow?.progress as CloudProgress | null | undefined;
      const merged = chooseBetterProgress(local, cloud);
      const player = merged.player;
      player.level = calculateLevel(player.xp);

      await storage.savePlayer(player);
      if (merged.campaign) await campaignProgressService.save(merged.campaign);
      if (merged.academy) await academyProgressService.save(merged.academy);
      if (merged.arena) await codeArenaService.save(merged.arena);
      if (merged.reviewErrors) await reviewService.save(merged.reviewErrors);
      if (merged.streak) await streakService.save(merged.streak);

      const { error: profileError } = await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email ?? null,
        display_name: player.name,
        avatar: player.avatar,
        updated_at: merged.updatedAt
      });
      if (profileError) return { status: 'error', message: friendlySyncError(profileError.message) };

      const { error: progressError } = await supabase.from('cloud_progress').upsert({
        user_id: user.id,
        progress: merged,
        updated_at: merged.updatedAt
      });
      if (progressError) return { status: 'error', message: friendlySyncError(progressError.message) };

      const analytics = await localAnalyticsService.load();
      const favoriteLanguage = localAnalyticsService.favoriteLanguage(analytics);
      const leaderboardRows = ['global', 'weekly'].map((period) => ({
        user_id: user.id,
        display_name: player.name,
        avatar: player.avatar,
        xp: player.xp,
        level: player.level,
        favorite_language: favoriteLanguage === 'nenhuma' ? null : favoriteLanguage,
        period,
        updated_at: merged.updatedAt
      }));

      const { error: leaderboardError } = await supabase.from('leaderboard_entries').upsert(leaderboardRows, { onConflict: 'user_id,period' });
      if (leaderboardError) return { status: 'error', message: friendlySyncError(leaderboardError.message) };

      return { status: 'synced', message: 'Progresso sincronizado com sucesso.', lastSyncAt: merged.updatedAt, cloudProgress: merged };
    } catch (error) {
      return { status: 'error', message: friendlySyncError(error instanceof Error ? error.message : undefined) };
    }
  }
};
