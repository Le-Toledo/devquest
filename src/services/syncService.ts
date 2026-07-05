import AsyncStorage from '@react-native-async-storage/async-storage';
import { academyProgressService, defaultAcademyProgress } from './academyProgressService';
import { campaignProgressService, defaultCampaignProgress } from './campaignProgressService';
import { codeArenaService, defaultCodeArenaProgress } from './codeArenaService';
import { defaultLocalAnalytics, localAnalyticsService } from './localAnalyticsService';
import { reviewService } from './reviewService';
import { createDefaultPlayer, storage } from './storage';
import { storageKeys } from './storageKeys';
import { defaultStreakState, streakService } from './streakService';
import { supabase } from './supabaseClient';
import { AuthUser, CloudProgress, SyncResult } from '../types/backend';
import { PlayerProfile, ThemeMode } from '../types/game';
import { normalizePlayerMeta } from './playerMetaService';
import { calculateLevel } from '../utils/progression';

const latestIso = () => new Date().toISOString();
const playerProgressTable = 'player_progress';

type PlayerProgressRow = {
  user_id: string;
  player_name: string | null;
  xp: number | null;
  coins: number | null;
  level: number | null;
  progress: CloudProgress | null;
  streak: CloudProgress['streak'] | null;
  achievements: string[] | null;
  settings: CloudProgress['settings'] | null;
  updated_at: string | null;
};

const friendlySyncError = (message?: string) => {
  const lower = message?.toLowerCase() ?? '';
  if (lower.includes('failed to fetch') || lower.includes('network')) return 'Sem conexão com a nuvem no momento. Seu progresso local continua salvo.';
  if (lower.includes('permission') || lower.includes('row-level') || lower.includes('policy')) return 'A sincronização foi bloqueada pela segurança do Supabase. Verifique o SQL/RLS.';
  if (lower.includes('jwt')) return 'Sua sessão expirou. Entre novamente para sincronizar.';
  return 'Não foi possível sincronizar agora. Tente novamente em instantes.';
};

const progressScore = (progress: CloudProgress) =>
  progress.player.xp +
  Object.keys(progress.player.completedStages).length * 250 +
  (progress.academy?.completedLessonIds.length ?? 0) * 80 +
  (progress.arena?.completedChallengeIds.length ?? 0) * 80 +
  (progress.campaign?.completedMissionIds.length ?? 0) * 120 +
  (progress.player.achievements.length ?? 0) * 50;

const isDefaultish = (progress: CloudProgress) => progressScore(progress) <= progress.player.coins + 1 && Object.keys(progress.player.completedStages).length === 0;

const loadLastSyncAt = async () => AsyncStorage.getItem(storageKeys.cloudSyncAt);
const saveLastSyncAt = async (value: string) => AsyncStorage.setItem(storageKeys.cloudSyncAt, value);

const normalizePlayer = (player: PlayerProfile): PlayerProfile => ({
  ...normalizePlayerMeta(player),
  level: calculateLevel(player.xp),
  unlockedAreaIds: Array.from(new Set(player.unlockedAreaIds)),
  achievements: Array.from(new Set(player.achievements)),
  ownedItems: Array.from(new Set(player.ownedItems)),
  answerHistory: player.answerHistory.slice(-200)
});

const toCloudProgress = (row: PlayerProgressRow): CloudProgress => {
  const fallback = createDefaultPlayer();
  const saved = row.progress;
  const player = normalizePlayer({
    ...fallback,
    ...(saved?.player ?? {}),
    name: row.player_name || saved?.player?.name || fallback.name,
    xp: row.xp ?? saved?.player?.xp ?? fallback.xp,
    coins: row.coins ?? saved?.player?.coins ?? fallback.coins,
    level: row.level ?? saved?.player?.level ?? fallback.level,
    achievements: row.achievements ?? saved?.player?.achievements ?? fallback.achievements,
    selectedTheme: row.settings?.theme ?? saved?.player?.selectedTheme ?? fallback.selectedTheme
  });

  return {
    userId: row.user_id,
    ...saved,
    player,
    campaign: saved?.campaign ?? defaultCampaignProgress,
    academy: saved?.academy ?? defaultAcademyProgress,
    arena: saved?.arena ?? defaultCodeArenaProgress,
    reviewErrors: saved?.reviewErrors ?? [],
    streak: row.streak ?? saved?.streak ?? defaultStreakState,
    localAnalytics: saved?.localAnalytics ?? defaultLocalAnalytics,
    settings: row.settings ?? saved?.settings ?? { theme: player.selectedTheme },
    updatedAt: row.updated_at ?? saved?.updatedAt ?? latestIso()
  };
};

const cloudToRow = (progress: CloudProgress) => ({
  user_id: progress.userId,
  player_name: progress.player.name,
  xp: progress.player.xp,
  coins: progress.player.coins,
  level: progress.player.level,
  progress,
  streak: progress.streak ?? defaultStreakState,
  achievements: progress.player.achievements,
  settings: progress.settings ?? { theme: progress.player.selectedTheme },
  updated_at: progress.updatedAt
});

const shouldUseCloud = (local: CloudProgress, cloud: CloudProgress, lastSyncAt: string | null) => {
  if (isDefaultish(local)) return true;
  if (!lastSyncAt) return progressScore(cloud) > progressScore(local);
  return new Date(cloud.updatedAt).getTime() > new Date(lastSyncAt).getTime();
};

export const syncService = {
  async buildLocalProgress(user: AuthUser): Promise<CloudProgress> {
    const player = normalizePlayer(await storage.loadPlayer());
    const theme = await storage.loadTheme();
    return {
      userId: user.id,
      player: { ...player, selectedTheme: theme as ThemeMode },
      campaign: await campaignProgressService.load(),
      academy: await academyProgressService.load(),
      arena: await codeArenaService.load(),
      reviewErrors: await reviewService.load(),
      streak: await streakService.load(),
      localAnalytics: await localAnalyticsService.load(),
      settings: { theme },
      updatedAt: latestIso()
    };
  },

  async applyLocalProgress(progress: CloudProgress) {
    const player = normalizePlayer(progress.player);
    await storage.savePlayer(player);
    await campaignProgressService.save(progress.campaign ?? defaultCampaignProgress);
    await academyProgressService.save(progress.academy ?? defaultAcademyProgress);
    await codeArenaService.save(progress.arena ?? defaultCodeArenaProgress);
    await reviewService.save(progress.reviewErrors ?? []);
    await streakService.save(progress.streak ?? defaultStreakState);
    await localAnalyticsService.save(progress.localAnalytics ?? defaultLocalAnalytics);
    if (progress.settings?.theme) await storage.saveTheme(progress.settings.theme);
  },

  async upsertProgress(progress: CloudProgress): Promise<SyncResult> {
    if (!supabase) return { status: 'disabled', message: 'Supabase não configurado. O app continua funcionando offline.' };

    const normalized: CloudProgress = {
      ...progress,
      player: normalizePlayer(progress.player),
      updatedAt: progress.updatedAt || latestIso()
    };

    const { error } = await supabase.from(playerProgressTable).upsert(cloudToRow(normalized), { onConflict: 'user_id' });
    if (error) return { status: 'error', message: friendlySyncError(error.message) };

    await saveLastSyncAt(normalized.updatedAt);
    return { status: 'synced', message: 'Progresso sincronizado com sucesso.', lastSyncAt: normalized.updatedAt, cloudProgress: normalized };
  },

  async syncNow(user: AuthUser | null): Promise<SyncResult> {
    if (!supabase) return { status: 'disabled', message: 'Supabase não configurado. O app continua funcionando offline.' };
    if (!user) return { status: 'offline', message: 'Entre na sua conta para sincronizar.' };

    try {
      const local = await this.buildLocalProgress(user);
      const { data: row, error: loadError } = await supabase
        .from(playerProgressTable)
        .select('user_id, player_name, xp, coins, level, progress, streak, achievements, settings, updated_at')
        .eq('user_id', user.id)
        .maybeSingle<PlayerProgressRow>();

      if (loadError) return { status: 'error', message: friendlySyncError(loadError.message) };

      if (!row) {
        const initial = { ...local, updatedAt: latestIso() };
        const created = await this.upsertProgress(initial);
        return created.status === 'synced' ? { ...created, message: 'Registro de progresso criado na nuvem.' } : created;
      }

      const cloud = toCloudProgress(row);
      const lastSyncAt = await loadLastSyncAt();
      const selected = shouldUseCloud(local, cloud, lastSyncAt) ? cloud : { ...local, updatedAt: latestIso() };

      await this.applyLocalProgress(selected);
      return this.upsertProgress(selected);
    } catch (error) {
      return { status: 'error', message: friendlySyncError(error instanceof Error ? error.message : undefined) };
    }
  },

  async pushLocal(user: AuthUser | null): Promise<SyncResult> {
    if (!supabase) return { status: 'disabled', message: 'Supabase não configurado. O app continua funcionando offline.' };
    if (!user) return { status: 'offline', message: 'Entre na sua conta para sincronizar.' };

    try {
      const { data: row, error } = await supabase.from(playerProgressTable).select('updated_at').eq('user_id', user.id).maybeSingle<{ updated_at: string | null }>();
      if (error) return { status: 'error', message: friendlySyncError(error.message) };

      const lastSyncAt = await loadLastSyncAt();
      if (row?.updated_at && lastSyncAt && new Date(row.updated_at).getTime() > new Date(lastSyncAt).getTime()) {
        return this.syncNow(user);
      }

      const local = await this.buildLocalProgress(user);
      return this.upsertProgress({ ...local, updatedAt: latestIso() });
    } catch (syncError) {
      return { status: 'error', message: friendlySyncError(syncError instanceof Error ? syncError.message : undefined) };
    }
  },

  async resetCloudProgress(user: AuthUser | null): Promise<SyncResult> {
    if (!supabase) return { status: 'disabled', message: 'Supabase não configurado. O app continua funcionando offline.' };
    if (!user) return { status: 'offline', message: 'Entre na sua conta para sincronizar.' };

    const player = normalizePlayer(createDefaultPlayer());
    const progress: CloudProgress = {
      userId: user.id,
      player,
      campaign: defaultCampaignProgress,
      academy: defaultAcademyProgress,
      arena: defaultCodeArenaProgress,
      reviewErrors: [],
      streak: defaultStreakState,
      localAnalytics: defaultLocalAnalytics,
      settings: { theme: player.selectedTheme },
      updatedAt: latestIso()
    };

    return this.upsertProgress(progress);
  }
};
