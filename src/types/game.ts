export type Difficulty = 'iniciante' | 'intermediario' | 'avancado';
export type QuestionKind = 'quiz' | 'complete-code' | 'bug-hunt' | 'order-blocks' | 'best-solution';
export type QuestionType = 'quiz' | 'codigo' | 'bug' | 'conceito' | 'saida' | 'entrevista';
export type ThemeMode = 'dark' | 'light';

export type AreaId =
  | 'logic'
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'java'
  | 'kotlin'
  | 'csharp'
  | 'sql'
  | 'html'
  | 'css'
  | 'react'
  | 'node'
  | 'git'
  | 'rest'
  | 'interview';

export interface Question {
  id: string;
  areaId: AreaId;
  kind: QuestionKind;
  difficulty: Difficulty;
  prompt: string;
  code?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint: string;
  tags: string[];
  type: QuestionType;
  points: number;
  timeLimitSeconds?: number;
}

export interface World {
  id: string;
  title: string;
  subtitle: string;
  areaIds: AreaId[];
  requiredLevel: number;
  color: string;
  premium?: boolean;
}

export interface Stage {
  id: string;
  worldId: string;
  title: string;
  areaId: AreaId;
  requiredLevel: number;
  questionIds: string[];
  premium?: boolean;
}

export interface StageResult {
  stars: number;
  bestScore: number;
  completedAt: string;
}

export interface AnswerHistoryItem {
  questionId: string;
  correct: boolean;
  answeredAt: string;
}

export type AchievementId = string;
export type MissionType = 'daily' | 'weekly';
export type PlayerActivityType = 'login' | 'challenge' | 'campaign_mission' | 'academy_lesson' | 'arena_challenge' | 'shop_purchase' | 'xp' | 'streak';

export interface AchievementUnlock {
  id: AchievementId;
  unlockedAt: string;
}

export interface PlayerMissionState {
  id: string;
  type: MissionType;
  progress: number;
  goal: number;
  completed: boolean;
  claimed: boolean;
  resetAt: string;
}

export interface PlayerStats {
  totalChallengesCompleted: number;
  campaignMissionsCompleted: number;
  academyLessonsCompleted: number;
  arenaChallengesCompleted: number;
  shopPurchases: number;
  dailyLoginCount: number;
  xpEarnedToday: number;
  xpEarnedThisWeek: number;
  studiedLanguagesThisWeek: string[];
  lastLoginDate?: string;
  lastDailyReset?: string;
  lastWeeklyReset?: string;
}

export interface PlayerProfile {
  name: string;
  avatar: string;
  level: number;
  xp: number;
  coins: number;
  streak: number;
  lastDailyReward?: string;
  unlockedAreaIds: AreaId[];
  completedStages: Record<string, StageResult>;
  achievements: string[];
  achievementUnlocks?: Record<AchievementId, AchievementUnlock>;
  dailyMissions?: Record<string, PlayerMissionState>;
  weeklyMissions?: Record<string, PlayerMissionState>;
  claimedRewards?: string[];
  stats?: PlayerStats;
  ownedItems: string[];
  selectedTheme: ThemeMode;
  answerHistory: AnswerHistoryItem[];
}

export interface ShopItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: 'avatar' | 'theme' | 'boost' | 'premium';
  preview: string;
  premium?: boolean;
}

export interface CareerTip {
  id: string;
  title: string;
  body: string;
  tag: string;
}
