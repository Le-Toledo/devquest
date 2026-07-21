import AsyncStorage from '@react-native-async-storage/async-storage';
import { codeLabChallenges } from '../data/codeLabChallenges';
import { CodeLabProgress } from '../types/codeLab';
import { parseJsonOrFallback } from '../utils/jsonStorage';
import {
  createDefaultCodeLabProgress,
  clearCodeLabDraft,
  deleteCodeLabHistoryEntry,
  markCodeLabRewarded,
  markCodeLabSolutionViewed,
  normalizeCodeLabProgress,
  recordCodeLabHint,
  recordCodeLabValidation,
  saveCodeLabDraft
} from './codeLabProgressRules';
import { storageKeys } from './storageKeys';

export const defaultCodeLabProgress = createDefaultCodeLabProgress();

export const codeLabService = {
  async load(): Promise<CodeLabProgress> {
    const raw = await AsyncStorage.getItem(storageKeys.codeLab);
    return normalizeCodeLabProgress(parseJsonOrFallback(raw, defaultCodeLabProgress));
  },
  async save(progress: CodeLabProgress) {
    await AsyncStorage.setItem(storageKeys.codeLab, JSON.stringify(normalizeCodeLabProgress(progress)));
  },
  async recordValidation(progress: CodeLabProgress, input: { challengeId: string; code: string; score: number; passed: boolean; passedChecks?: number; totalChecks?: number }) {
    const next = recordCodeLabValidation(progress, input);
    await this.save(next);
    return next;
  },
  async saveDraft(progress: CodeLabProgress, challengeId: string, code: string) {
    const next = saveCodeLabDraft(progress, challengeId, code);
    if (next !== progress) await this.save(next);
    return next;
  },
  async clearDraft(progress: CodeLabProgress, challengeId: string) {
    const next = clearCodeLabDraft(progress, challengeId);
    if (next !== progress) await this.save(next);
    return next;
  },
  async deleteHistoryEntry(progress: CodeLabProgress, challengeId: string, historyId: string) {
    const next = deleteCodeLabHistoryEntry(progress, challengeId, historyId);
    if (next !== progress) await this.save(next);
    return next;
  },
  async recordHint(progress: CodeLabProgress, challengeId: string) {
    const next = recordCodeLabHint(progress, challengeId);
    await this.save(next);
    return next;
  },
  async markSolutionViewed(progress: CodeLabProgress, challengeId: string, code: string) {
    const next = markCodeLabSolutionViewed(progress, challengeId, code);
    await this.save(next);
    return next;
  },
  async markRewarded(progress: CodeLabProgress, challengeId: string) {
    const next = markCodeLabRewarded(progress, challengeId);
    await this.save(next);
    return next;
  },
  stats(progress: CodeLabProgress) {
    const normalized = normalizeCodeLabProgress(progress);
    const byLanguage = codeLabChallenges.reduce<Record<string, { total: number; completed: number }>>((acc, challenge) => {
      const current = acc[challenge.language] ?? { total: 0, completed: 0 };
      current.total += 1;
      if (normalized.completedChallengeIds.includes(challenge.id)) current.completed += 1;
      acc[challenge.language] = current;
      return acc;
    }, {});
    return {
      total: codeLabChallenges.length,
      completed: normalized.completedChallengeIds.length,
      ratio: codeLabChallenges.length ? normalized.completedChallengeIds.length / codeLabChallenges.length : 0,
      byLanguage
    };
  }
};
