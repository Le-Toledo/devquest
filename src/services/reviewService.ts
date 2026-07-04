import AsyncStorage from '@react-native-async-storage/async-storage';
import { Question } from '../types/game';
import { ReviewError, ReviewPriority, ReviewStats } from '../types/review';
import { parseArrayOrFallback } from '../utils/jsonStorage';
import { storageKeys } from './storageKeys';
const intervals = [0, 1, 3, 7];

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const priorityForInterval = (days: number): ReviewPriority => {
  if (days <= 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days <= 3) return 'three-days';
  return 'seven-days';
};

const dueFromInterval = (days: number) => addDays(new Date(), days).toISOString();

export const reviewService = {
  async load(): Promise<ReviewError[]> {
    const raw = await AsyncStorage.getItem(storageKeys.reviewErrors);
    return parseArrayOrFallback<ReviewError>(raw, []);
  },
  async save(errors: ReviewError[]) {
    await AsyncStorage.setItem(storageKeys.reviewErrors, JSON.stringify(errors));
  },
  async saveQuestionError(question: Question, selectedIndex: number) {
    const errors = await this.load();
    const id = `quiz-${question.id}`;
    const existing = errors.find((error) => error.id === id);
    const now = new Date().toISOString();
    const selectedAnswer = question.options[selectedIndex] ?? 'Sem resposta';
    const correctAnswer = question.options[question.correctIndex] ?? 'Resposta correta';
    const nextError: ReviewError = {
      id,
      source: 'quiz',
      sourceId: question.id,
      prompt: question.prompt,
      areaId: question.areaId,
      concept: question.kind,
      difficulty: question.difficulty,
      selectedAnswer,
      correctAnswer,
      explanation: question.explanation,
      hint: question.hint,
      codeExample: question.code,
      wrongCount: (existing?.wrongCount ?? 0) + 1,
      correctReviewCount: existing?.correctReviewCount ?? 0,
      intervalDays: 0,
      priority: 'today',
      firstWrongAt: existing?.firstWrongAt ?? now,
      lastWrongAt: now,
      nextReviewAt: now,
      learnedAt: existing?.learnedAt
    };
    await this.save([nextError, ...errors.filter((error) => error.id !== id)]);
    return nextError;
  },
  async saveCampaignError(input: {
    missionId: string;
    prompt: string;
    areaId: ReviewError['areaId'];
    concept: string;
    difficulty?: ReviewError['difficulty'];
    explanation: string;
    hint: string;
  }) {
    const errors = await this.load();
    const id = `campaign-${input.missionId}`;
    const existing = errors.find((error) => error.id === id);
    const now = new Date().toISOString();
    const nextError: ReviewError = {
      id,
      source: 'campaign',
      sourceId: input.missionId,
      prompt: input.prompt,
      areaId: input.areaId,
      concept: input.concept,
      difficulty: input.difficulty ?? 'intermediario',
      selectedAnswer: 'Missão falhou durante a simulação',
      correctAnswer: 'Revisar o conceito e tentar novamente',
      explanation: input.explanation,
      hint: input.hint,
      wrongCount: (existing?.wrongCount ?? 0) + 1,
      correctReviewCount: existing?.correctReviewCount ?? 0,
      intervalDays: 0,
      priority: 'today',
      firstWrongAt: existing?.firstWrongAt ?? now,
      lastWrongAt: now,
      nextReviewAt: now,
      learnedAt: existing?.learnedAt
    };
    await this.save([nextError, ...errors.filter((error) => error.id !== id)]);
    return nextError;
  },
  async answerReview(errorId: string, correct: boolean) {
    const errors = await this.load();
    const target = errors.find((error) => error.id === errorId);
    if (!target) return errors;
    const currentIndex = Math.max(0, intervals.indexOf(target.intervalDays));
    const nextInterval = correct ? intervals[Math.min(intervals.length - 1, currentIndex + 1)] : intervals[0];
    const updated: ReviewError = {
      ...target,
      correctReviewCount: correct ? target.correctReviewCount + 1 : target.correctReviewCount,
      wrongCount: correct ? target.wrongCount : target.wrongCount + 1,
      intervalDays: nextInterval,
      priority: priorityForInterval(nextInterval),
      nextReviewAt: dueFromInterval(nextInterval),
      lastWrongAt: correct ? target.lastWrongAt : new Date().toISOString()
    };
    const next = errors.map((error) => (error.id === errorId ? updated : error));
    await this.save(next);
    return next;
  },
  async markLearned(errorId: string) {
    const errors = await this.load();
    const now = new Date().toISOString();
    const learnedPriority: ReviewPriority = 'seven-days';
    const next = errors.map((error) =>
      error.id === errorId
        ? { ...error, learnedAt: now, intervalDays: 7, priority: learnedPriority, nextReviewAt: dueFromInterval(7) }
        : error
    );
    await this.save(next);
    return next;
  },
  stats(errors: ReviewError[]): ReviewStats {
    const active = errors.filter((error) => !error.learnedAt);
    const learned = errors.filter((error) => error.learnedAt);
    const countBy = (items: string[]) =>
      Object.entries(items.reduce<Record<string, number>>((acc, item) => ({ ...acc, [item]: (acc[item] ?? 0) + 1 }), {}))
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
    return {
      totalErrors: errors.length,
      learnedErrors: learned.length,
      hardestLanguages: countBy(active.map((error) => error.areaId)),
      hardestConcepts: countBy(active.map((error) => error.concept)),
      improvementRate: errors.length === 0 ? 0 : Math.round((learned.length / errors.length) * 100)
    };
  }
};
