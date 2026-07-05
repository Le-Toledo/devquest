import AsyncStorage from '@react-native-async-storage/async-storage';
import { CodeArenaProgress } from '../types/codeArena';
import { parseJsonOrFallback } from '../utils/jsonStorage';
import { storageKeys } from './storageKeys';

export const defaultCodeArenaProgress: CodeArenaProgress = {
  completedChallengeIds: [],
  reviewChallengeIds: [],
  combo: 0,
  medals: []
};

export const codeArenaService = {
  async load(): Promise<CodeArenaProgress> {
    const raw = await AsyncStorage.getItem(storageKeys.codeArena);
    return parseJsonOrFallback(raw, defaultCodeArenaProgress);
  },
  async save(progress: CodeArenaProgress) {
    await AsyncStorage.setItem(storageKeys.codeArena, JSON.stringify(progress));
  },
  async complete(progress: CodeArenaProgress, challengeId: string) {
    const combo = progress.combo + 1;
    const medals = new Set(progress.medals);
    if (combo >= 5) medals.add('Combo Hacker 5x');
    if (progress.completedChallengeIds.length + 1 >= 20) medals.add('Arena Pro');
    const next: CodeArenaProgress = {
      ...progress,
      combo,
      completedChallengeIds: Array.from(new Set([...progress.completedChallengeIds, challengeId])),
      reviewChallengeIds: progress.reviewChallengeIds.filter((id) => id !== challengeId),
      medals: Array.from(medals)
    };
    await this.save(next);
    return next;
  },
  async markReview(progress: CodeArenaProgress, challengeId: string) {
    const next: CodeArenaProgress = {
      ...progress,
      combo: 0,
      reviewChallengeIds: Array.from(new Set([...progress.reviewChallengeIds, challengeId]))
    };
    await this.save(next);
    return next;
  }
};
