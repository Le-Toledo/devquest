import AsyncStorage from '@react-native-async-storage/async-storage';
import { InitialTrack, OnboardingGoal, OnboardingState } from '../types/monetization';
import { parseJsonOrFallback } from '../utils/jsonStorage';
import { storageKeys } from './storageKeys';

export interface StreakState {
  currentStreak: number;
  bestStreak: number;
  lastStudyDate?: string;
  lastRewardDate?: string;
  todayXp: number;
}

export const defaultStreakState: StreakState = {
  currentStreak: 0,
  bestStreak: 0,
  todayXp: 0
};

const todayKey = () => new Date().toISOString().slice(0, 10);
const yesterdayKey = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
};

export const streakService = {
  async load(): Promise<StreakState> {
    const raw = await AsyncStorage.getItem(storageKeys.streak);
    return parseJsonOrFallback(raw, defaultStreakState);
  },
  async save(state: StreakState) {
    await AsyncStorage.setItem(storageKeys.streak, JSON.stringify(state));
  },
  async recordStudy(xp = 0) {
    const current = await this.load();
    const today = todayKey();
    const continued = current.lastStudyDate === yesterdayKey();
    const sameDay = current.lastStudyDate === today;
    const currentStreak = sameDay ? current.currentStreak : continued ? current.currentStreak + 1 : 1;
    const next: StreakState = {
      ...current,
      currentStreak,
      bestStreak: Math.max(current.bestStreak, currentStreak),
      lastStudyDate: today,
      todayXp: sameDay ? current.todayXp + xp : xp
    };
    await this.save(next);
    return next;
  },
  async claimDailyReward() {
    const current = await this.load();
    const today = todayKey();
    if (current.lastRewardDate === today) return { state: current, claimed: false };
    const next = { ...current, lastRewardDate: today };
    await this.save(next);
    return { state: next, claimed: true };
  },
  async loadOnboarding(): Promise<OnboardingState> {
    const raw = await AsyncStorage.getItem(storageKeys.onboarding);
    return parseJsonOrFallback<OnboardingState>(raw, { completed: false });
  },
  async completeOnboarding(goal: OnboardingGoal, initialTrack: InitialTrack, avatar: string) {
    const next: OnboardingState = { completed: true, goal, initialTrack, avatar, completedAt: new Date().toISOString() };
    await AsyncStorage.setItem(storageKeys.onboarding, JSON.stringify(next));
    return next;
  }
};
