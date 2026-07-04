import AsyncStorage from '@react-native-async-storage/async-storage';
import { AreaId } from '../types/game';
import { parseJsonOrFallback } from '../utils/jsonStorage';
import { storageKeys } from './storageKeys';

export interface LocalAnalytics {
  totalStudyMinutes: number;
  lessonsDone: number;
  challengesDone: number;
  campaignCompleted: number;
  errorsReviewed: number;
  bestCombo: number;
  languageStudyCount: Partial<Record<AreaId, number>>;
}

export const defaultLocalAnalytics: LocalAnalytics = {
  totalStudyMinutes: 0,
  lessonsDone: 0,
  challengesDone: 0,
  campaignCompleted: 0,
  errorsReviewed: 0,
  bestCombo: 0,
  languageStudyCount: {}
};

export const localAnalyticsService = {
  async load(): Promise<LocalAnalytics> {
    const raw = await AsyncStorage.getItem(storageKeys.localAnalytics);
    return parseJsonOrFallback(raw, defaultLocalAnalytics);
  },
  async save(data: LocalAnalytics) {
    await AsyncStorage.setItem(storageKeys.localAnalytics, JSON.stringify(data));
  },
  async recordActivity(input: { minutes?: number; lesson?: boolean; challenge?: boolean; campaign?: boolean; review?: boolean; areaId?: AreaId; combo?: number }) {
    const current = await this.load();
    const languageStudyCount = { ...current.languageStudyCount };
    if (input.areaId) languageStudyCount[input.areaId] = (languageStudyCount[input.areaId] ?? 0) + 1;
    const next: LocalAnalytics = {
      totalStudyMinutes: current.totalStudyMinutes + (input.minutes ?? 0),
      lessonsDone: current.lessonsDone + (input.lesson ? 1 : 0),
      challengesDone: current.challengesDone + (input.challenge ? 1 : 0),
      campaignCompleted: current.campaignCompleted + (input.campaign ? 1 : 0),
      errorsReviewed: current.errorsReviewed + (input.review ? 1 : 0),
      bestCombo: Math.max(current.bestCombo, input.combo ?? 0),
      languageStudyCount
    };
    await this.save(next);
    return next;
  },
  favoriteLanguage(data: LocalAnalytics) {
    const [area] = Object.entries(data.languageStudyCount).sort((a, b) => b[1] - a[1])[0] ?? [];
    return area ?? 'nenhuma';
  }
};
