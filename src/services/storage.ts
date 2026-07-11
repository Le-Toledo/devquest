import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlayerProfile, ThemeMode } from '../types/game';
import { parseJsonOrFallback } from '../utils/jsonStorage';
import { normalizePlayerMeta } from './playerMetaService';
import { storageKeys } from './storageKeys';

export const defaultPlayer: PlayerProfile = {
  name: 'Dev Explorer',
  avatar: 'CQ',
  level: 1,
  xp: 0,
  coins: 120,
  streak: 1,
  unlockedAreaIds: ['logic', 'html', 'css'],
  completedStages: {},
  achievements: [],
  achievementUnlocks: {},
  dailyMissions: {},
  weeklyMissions: {},
  claimedRewards: [],
  stats: {
    totalChallengesCompleted: 0,
    campaignMissionsCompleted: 0,
    academyLessonsCompleted: 0,
    arenaChallengesCompleted: 0,
    shopPurchases: 0,
    dailyLoginCount: 0,
    xpEarnedToday: 0,
    xpEarnedThisWeek: 0,
    studiedLanguagesThisWeek: []
  },
  ownedItems: ['avatar-cq', 'theme-default'],
  selectedTheme: 'dark',
  answerHistory: []
};

const createDefaultStats = () => ({
  totalChallengesCompleted: 0,
  campaignMissionsCompleted: 0,
  academyLessonsCompleted: 0,
  arenaChallengesCompleted: 0,
  shopPurchases: 0,
  dailyLoginCount: 0,
  xpEarnedToday: 0,
  xpEarnedThisWeek: 0,
  studiedLanguagesThisWeek: []
});

export const createDefaultPlayer = (): PlayerProfile => ({
  ...defaultPlayer,
  unlockedAreaIds: [...defaultPlayer.unlockedAreaIds],
  completedStages: {},
  achievements: [],
  achievementUnlocks: {},
  dailyMissions: {},
  weeklyMissions: {},
  claimedRewards: [],
  stats: createDefaultStats(),
  ownedItems: [...defaultPlayer.ownedItems],
  answerHistory: []
});

const progressStorageKeys = [
  storageKeys.academyProgress,
  storageKeys.campaignProgress,
  storageKeys.codeArena,
  storageKeys.codeLab,
  storageKeys.localAnalytics,
  storageKeys.player,
  storageKeys.questionSeenHistory,
  storageKeys.reviewErrors,
  storageKeys.streak
];

export const storage = {
  async loadPlayer(): Promise<PlayerProfile> {
    const raw = await AsyncStorage.getItem(storageKeys.player);
    return normalizePlayerMeta(parseJsonOrFallback(raw, createDefaultPlayer()));
  },
  async savePlayer(profile: PlayerProfile) {
    await AsyncStorage.setItem(storageKeys.player, JSON.stringify(normalizePlayerMeta(profile)));
  },
  async loadTheme(): Promise<ThemeMode> {
    const raw = await AsyncStorage.getItem(storageKeys.settings);
    const fallback: { theme: ThemeMode } = { theme: 'dark' };
    const parsed = parseJsonOrFallback(raw, fallback);
    return parsed.theme === 'light' ? 'light' : 'dark';
  },
  async saveTheme(theme: ThemeMode) {
    await AsyncStorage.setItem(storageKeys.settings, JSON.stringify({ theme }));
  },
  async resetProgress() {
    await AsyncStorage.multiRemove(progressStorageKeys);
  }
};
