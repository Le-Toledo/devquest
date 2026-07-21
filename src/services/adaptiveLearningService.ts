import AsyncStorage from '@react-native-async-storage/async-storage';
import { AdaptiveConceptRecord, AdaptiveLearningAttemptInput, AdaptiveLearningState } from '../types/adaptiveLearning';
import { Difficulty } from '../types/game';
import { parseJsonOrFallback } from '../utils/jsonStorage';
import { storageKeys } from './storageKeys';

const defaultDate = new Date(0).toISOString();
const difficultyOrder: Difficulty[] = ['iniciante', 'intermediario', 'avancado'];

export const createDefaultAdaptiveLearningState = (): AdaptiveLearningState => ({
  concepts: {},
  updatedAt: defaultDate
});

const clampMastery = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export const normalizeAdaptiveLearningState = (state?: Partial<AdaptiveLearningState> | null): AdaptiveLearningState => {
  const concepts = Object.fromEntries(
    Object.entries(state?.concepts ?? {})
      .filter(([conceptId]) => Boolean(conceptId))
      .map(([conceptId, record]) => {
        const attempts = Math.max(0, record?.attempts ?? 0);
        const correct = Math.max(0, record?.correct ?? 0);
        const incorrect = Math.max(0, record?.incorrect ?? 0);
        const currentDifficulty = difficultyOrder.includes(record?.currentDifficulty as Difficulty) ? record?.currentDifficulty as Difficulty : 'iniciante';
        const nextDifficulty = difficultyOrder.includes(record?.nextDifficulty as Difficulty) ? record?.nextDifficulty as Difficulty : currentDifficulty;
        return [
          conceptId,
          {
            conceptId,
            language: record?.language,
            attempts,
            correct,
            incorrect,
            mastery: clampMastery(record?.mastery ?? 0),
            currentDifficulty,
            nextDifficulty,
            dueAt: record?.dueAt ?? defaultDate,
            lastAttemptAt: record?.lastAttemptAt ?? defaultDate,
            lastSource: record?.lastSource ?? 'codeLab'
          } satisfies AdaptiveConceptRecord
        ];
      })
  );

  return {
    concepts,
    updatedAt: state?.updatedAt ?? defaultDate
  };
};

export const calculateNextDifficulty = (mastery: number, currentDifficulty: Difficulty): Difficulty => {
  const index = Math.max(0, difficultyOrder.indexOf(currentDifficulty));
  if (mastery >= 80) return difficultyOrder[Math.min(index + 1, difficultyOrder.length - 1)];
  if (mastery < 45) return difficultyOrder[Math.max(index - 1, 0)];
  return currentDifficulty;
};

export const calculateNextReviewDate = (mastery: number, now = new Date()) => {
  const days = mastery >= 80 ? 7 : mastery >= 55 ? 3 : 1;
  const due = new Date(now);
  due.setDate(due.getDate() + days);
  return due.toISOString();
};

export const updateConceptMastery = (
  state: AdaptiveLearningState,
  input: AdaptiveLearningAttemptInput,
  now = new Date()
): AdaptiveLearningState => {
  const normalized = normalizeAdaptiveLearningState(state);
  const current = normalized.concepts[input.conceptId];
  const attempts = (current?.attempts ?? 0) + 1;
  const correct = (current?.correct ?? 0) + (input.correct ? 1 : 0);
  const incorrect = (current?.incorrect ?? 0) + (input.correct ? 0 : 1);
  const hintPenalty = Math.min(18, (input.hintsUsed ?? 0) * 6);
  const baseDelta = input.correct ? 14 : -16;
  const mastery = clampMastery((current?.mastery ?? 35) + baseDelta - hintPenalty);
  const nextDifficulty = calculateNextDifficulty(mastery, input.difficulty);
  const timestamp = now.toISOString();

  return normalizeAdaptiveLearningState({
    concepts: {
      ...normalized.concepts,
      [input.conceptId]: {
        conceptId: input.conceptId,
        language: input.language ?? current?.language,
        attempts,
        correct,
        incorrect,
        mastery,
        currentDifficulty: input.difficulty,
        nextDifficulty,
        dueAt: calculateNextReviewDate(mastery, now),
        lastAttemptAt: timestamp,
        lastSource: input.source
      }
    },
    updatedAt: timestamp
  });
};

export const selectWeakConcepts = (state: AdaptiveLearningState, limit = 5) =>
  Object.values(normalizeAdaptiveLearningState(state).concepts)
    .sort((a, b) => a.mastery - b.mastery || new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
    .slice(0, limit);

export const adaptiveLearningService = {
  async load(): Promise<AdaptiveLearningState> {
    const raw = await AsyncStorage.getItem(storageKeys.adaptiveLearning);
    return normalizeAdaptiveLearningState(parseJsonOrFallback(raw, createDefaultAdaptiveLearningState()));
  },
  async save(state: AdaptiveLearningState) {
    await AsyncStorage.setItem(storageKeys.adaptiveLearning, JSON.stringify(normalizeAdaptiveLearningState(state)));
  },
  async recordAttempt(input: AdaptiveLearningAttemptInput) {
    const current = await this.load();
    const next = updateConceptMastery(current, input);
    await this.save(next);
    return next;
  }
};
