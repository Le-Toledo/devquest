import { Session, User } from '@supabase/supabase-js';
import { PlayerProfile } from './game';
import { AcademyProgress } from './academy';
import { CampaignProgress } from './campaign';
import { CodeArenaProgress } from './codeArena';
import { ReviewError } from './review';
import { StreakState } from '../services/streakService';

export type AuthSession = Session;
export type AuthUser = User;
export type SyncStatus = 'disabled' | 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

export interface CloudUserProfile {
  id: string;
  email: string | null;
  displayName: string;
  avatar: string;
  createdAt: string;
  updatedAt: string;
}

export interface CloudProgress {
  userId: string;
  player: PlayerProfile;
  campaign?: CampaignProgress;
  academy?: AcademyProgress;
  arena?: CodeArenaProgress;
  reviewErrors?: ReviewError[];
  streak?: StreakState;
  future?: Record<string, never>;
  updatedAt: string;
}

export interface LeaderboardEntry {
  id: string;
  displayName: string;
  avatar: string;
  xp: number;
  level: number;
  favoriteLanguage?: string | null;
  period: 'global' | 'weekly';
  updatedAt: string;
}

export interface SyncResult {
  status: SyncStatus;
  message: string;
  lastSyncAt?: string;
  cloudProgress?: CloudProgress;
}
