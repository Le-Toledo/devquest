import { LeaderboardEntry } from '../types/backend';
import { supabase } from './supabaseClient';
import { leaderboardConsentService } from './leaderboardConsentService';
import { PlayerProfile } from '../types/game';

type LeaderboardPeriod = 'global' | 'weekly';

const mapEntry = (row: {
  id: string;
  display_name: string;
  avatar: string;
  xp: number;
  level: number;
  favorite_language: string | null;
  period: LeaderboardPeriod;
  updated_at: string;
}): LeaderboardEntry => ({
  id: row.id,
  displayName: row.display_name,
  avatar: row.avatar,
  xp: row.xp,
  level: row.level,
  favoriteLanguage: row.favorite_language,
  period: row.period,
  updatedAt: row.updated_at
});

export const leaderboardService = {
  async publish(userId: string, player: PlayerProfile): Promise<{ published: boolean; error?: string }> {
    // This is the final privacy boundary. Keep it before every Supabase call in this method.
    if (!(await leaderboardConsentService.hasAccepted(userId))) return { published: false };
    if (!supabase) return { published: false, error: 'Supabase não configurado.' };

    const base = {
      user_id: userId,
      display_name: player.name,
      avatar: player.avatar,
      xp: player.xp,
      level: player.level,
      favorite_language: null,
      updated_at: new Date().toISOString()
    };
    const rows = [
      { ...base, period: 'global' as const },
      { ...base, period: 'weekly' as const }
    ];
    const { error } = await supabase.from('leaderboard_entries').upsert(rows, { onConflict: 'user_id,period' });
    return error ? { published: false, error: error.message } : { published: true };
  },

  async list(period: LeaderboardPeriod, favoriteLanguage?: string): Promise<{ entries: LeaderboardEntry[]; error?: string; disabled?: boolean }> {
    if (!supabase) return { entries: [], disabled: true, error: 'Supabase não configurado.' };

    let query = supabase
      .from('leaderboard_entries')
      .select('id,display_name,avatar,xp,level,favorite_language,period,updated_at')
      .eq('period', period)
      .order('xp', { ascending: false })
      .limit(50);

    if (favoriteLanguage) {
      query = query.eq('favorite_language', favoriteLanguage);
    }

    const { data, error } = await query;
    if (error) return { entries: [], error: error.message };
    return { entries: (data ?? []).map(mapEntry) };
  }
};
