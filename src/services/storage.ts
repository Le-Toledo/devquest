import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlayerProfile, ThemeMode } from '../types/game';
import { parseJsonOrFallback } from '../utils/jsonStorage';
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
  ownedItems: ['avatar-cq', 'theme-default'],
  selectedTheme: 'dark',
  answerHistory: []
};

export const storage = {
  async loadPlayer(): Promise<PlayerProfile> {
    const raw = await AsyncStorage.getItem(storageKeys.player);
    return parseJsonOrFallback(raw, defaultPlayer);
  },
  async savePlayer(profile: PlayerProfile) {
    await AsyncStorage.setItem(storageKeys.player, JSON.stringify(profile));
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
  async reset() {
    await AsyncStorage.multiRemove([storageKeys.player, storageKeys.settings]);
  }
};
