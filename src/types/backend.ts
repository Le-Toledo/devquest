import { Session, User } from '@supabase/supabase-js';
import { PlayerProfile, ThemeMode } from './game';
import { AcademyProgress } from './academy';
import { CampaignProgress } from './campaign';
import { CodeArenaProgress } from './codeArena';
import { ReviewError } from './review';
import { StreakState } from '../services/streakService';
import { LocalAnalytics } from '../services/localAnalyticsService';

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
  localAnalytics?: LocalAnalytics;
  settings?: {
    theme: ThemeMode;
  };
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

export type FeedbackCategory = 'bug' | 'idea' | 'content' | 'ux' | 'other';

export interface FeedbackReport {
  id: string;
  category: FeedbackCategory;
  message: string;
  contactEmail?: string;
  metadata: {
    appVersion?: string;
    platform: string;
    userId?: string;
    userEmail?: string;
    playerLevel?: number;
    playerXp?: number;
    playerCoins?: number;
  };
  createdAt: string;
  syncedAt?: string;
}
