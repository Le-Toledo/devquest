import { LeaderboardEntry } from '../types/backend';
import { supabase } from './supabaseClient';

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
