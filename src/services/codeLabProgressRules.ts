import { codeLabChallengeById } from '../data/codeLabChallenges';
import { CodeLabAttempt, CodeLabProgress } from '../types/codeLab';

const maxCodeLength = 4000;
const unique = (items: string[] = []) => Array.from(new Set(items.filter(Boolean)));

export const createDefaultCodeLabProgress = (): CodeLabProgress => ({
  attemptsByChallengeId: {},
  completedChallengeIds: [],
  bestStreak: 0,
  currentStreak: 0,
  totalPracticeMinutes: 0
});

export const trimSavedCode = (code: string) => code.slice(-maxCodeLength);

export const normalizeCodeLabProgress = (progress?: Partial<CodeLabProgress> | null): CodeLabProgress => {
  const defaults = createDefaultCodeLabProgress();
  const attemptsByChallengeId = Object.fromEntries(
    Object.entries(progress?.attemptsByChallengeId ?? {}).map(([challengeId, attempt]) => [
      challengeId,
      {
        challengeId,
        attempts: Math.max(0, attempt?.attempts ?? 0),
        bestScore: Math.max(0, attempt?.bestScore ?? 0),
        completed: Boolean(attempt?.completed),
        usedHints: Math.max(0, attempt?.usedHints ?? 0),
        viewedSolution: Boolean(attempt?.viewedSolution),
        lastCode: trimSavedCode(attempt?.lastCode ?? ''),
        lastAttemptAt: attempt?.lastAttemptAt ?? new Date(0).toISOString(),
        completedAt: attempt?.completedAt,
        rewarded: Boolean(attempt?.rewarded)
      } satisfies CodeLabAttempt
    ])
  );
  const completedChallengeIds = unique([...(progress?.completedChallengeIds ?? []), ...Object.values(attemptsByChallengeId).filter((attempt) => attempt.completed).map((attempt) => attempt.challengeId)]);

  return {
    ...defaults,
    ...progress,
    attemptsByChallengeId,
    completedChallengeIds,
    bestStreak: Math.max(progress?.bestStreak ?? 0, progress?.currentStreak ?? 0),
    currentStreak: Math.max(0, progress?.currentStreak ?? 0),
    totalPracticeMinutes: Math.max(0, progress?.totalPracticeMinutes ?? 0)
  };
};

export const recordCodeLabValidation = (
  progress: CodeLabProgress,
  input: { challengeId: string; code: string; score: number; passed: boolean }
) => {
  const normalized = normalizeCodeLabProgress(progress);
  const current = normalized.attemptsByChallengeId[input.challengeId];
  const challenge = codeLabChallengeById(input.challengeId);
  const completedFirstTime = input.passed && !current?.completed;
  const currentStreak = input.passed ? normalized.currentStreak + 1 : 0;
  const attempt: CodeLabAttempt = {
    challengeId: input.challengeId,
    attempts: (current?.attempts ?? 0) + 1,
    bestScore: Math.max(current?.bestScore ?? 0, input.score),
    completed: Boolean(current?.completed || input.passed),
    usedHints: current?.usedHints ?? 0,
    viewedSolution: current?.viewedSolution ?? false,
    lastCode: trimSavedCode(input.code),
    lastAttemptAt: new Date().toISOString(),
    completedAt: current?.completedAt ?? (input.passed ? new Date().toISOString() : undefined),
    rewarded: current?.rewarded ?? false
  };

  return normalizeCodeLabProgress({
    ...normalized,
    attemptsByChallengeId: { ...normalized.attemptsByChallengeId, [input.challengeId]: attempt },
    completedChallengeIds: input.passed ? unique([...normalized.completedChallengeIds, input.challengeId]) : normalized.completedChallengeIds,
    currentChallengeId: input.challengeId,
    favoriteLanguage: challenge?.language ?? normalized.favoriteLanguage,
    currentStreak,
    bestStreak: Math.max(normalized.bestStreak, currentStreak),
    totalPracticeMinutes: normalized.totalPracticeMinutes + (completedFirstTime ? challenge?.estimatedMinutes ?? 0 : 0)
  });
};

export const recordCodeLabHint = (progress: CodeLabProgress, challengeId: string) => {
  const normalized = normalizeCodeLabProgress(progress);
  const current = normalized.attemptsByChallengeId[challengeId];
  return normalizeCodeLabProgress({
    ...normalized,
    currentChallengeId: challengeId,
    attemptsByChallengeId: {
      ...normalized.attemptsByChallengeId,
      [challengeId]: {
        challengeId,
        attempts: current?.attempts ?? 0,
        bestScore: current?.bestScore ?? 0,
        completed: current?.completed ?? false,
        usedHints: Math.min(3, (current?.usedHints ?? 0) + 1),
        viewedSolution: current?.viewedSolution ?? false,
        lastCode: current?.lastCode ?? '',
        lastAttemptAt: current?.lastAttemptAt ?? new Date().toISOString(),
        completedAt: current?.completedAt,
        rewarded: current?.rewarded ?? false
      }
    }
  });
};

export const markCodeLabSolutionViewed = (progress: CodeLabProgress, challengeId: string, code: string) => {
  const normalized = normalizeCodeLabProgress(progress);
  const current = normalized.attemptsByChallengeId[challengeId];
  return normalizeCodeLabProgress({
    ...normalized,
    currentChallengeId: challengeId,
    attemptsByChallengeId: {
      ...normalized.attemptsByChallengeId,
      [challengeId]: {
        challengeId,
        attempts: current?.attempts ?? 0,
        bestScore: current?.bestScore ?? 0,
        completed: current?.completed ?? false,
        usedHints: current?.usedHints ?? 0,
        viewedSolution: true,
        lastCode: trimSavedCode(code || current?.lastCode || ''),
        lastAttemptAt: new Date().toISOString(),
        completedAt: current?.completedAt,
        rewarded: current?.rewarded ?? false
      }
    }
  });
};

export const markCodeLabRewarded = (progress: CodeLabProgress, challengeId: string) => {
  const normalized = normalizeCodeLabProgress(progress);
  const current = normalized.attemptsByChallengeId[challengeId];
  if (!current) return normalized;
  return normalizeCodeLabProgress({
    ...normalized,
    attemptsByChallengeId: {
      ...normalized.attemptsByChallengeId,
      [challengeId]: { ...current, rewarded: true }
    }
  });
};

export const mergeCodeLabProgress = (local?: Partial<CodeLabProgress> | null, cloud?: Partial<CodeLabProgress> | null): CodeLabProgress => {
  const left = normalizeCodeLabProgress(local);
  const right = normalizeCodeLabProgress(cloud);
  const attemptsByChallengeId: Record<string, CodeLabAttempt> = {};
  unique([...Object.keys(left.attemptsByChallengeId), ...Object.keys(right.attemptsByChallengeId)]).forEach((challengeId) => {
    const localAttempt = left.attemptsByChallengeId[challengeId];
    const cloudAttempt = right.attemptsByChallengeId[challengeId];
    const latest = new Date(localAttempt?.lastAttemptAt ?? 0).getTime() >= new Date(cloudAttempt?.lastAttemptAt ?? 0).getTime() ? localAttempt : cloudAttempt;
    attemptsByChallengeId[challengeId] = {
      challengeId,
      attempts: Math.max(localAttempt?.attempts ?? 0, cloudAttempt?.attempts ?? 0),
      bestScore: Math.max(localAttempt?.bestScore ?? 0, cloudAttempt?.bestScore ?? 0),
      completed: Boolean(localAttempt?.completed || cloudAttempt?.completed),
      usedHints: Math.max(localAttempt?.usedHints ?? 0, cloudAttempt?.usedHints ?? 0),
      viewedSolution: Boolean(localAttempt?.viewedSolution || cloudAttempt?.viewedSolution),
      lastCode: trimSavedCode(latest?.lastCode ?? ''),
      lastAttemptAt: latest?.lastAttemptAt ?? new Date(0).toISOString(),
      completedAt: localAttempt?.completedAt ?? cloudAttempt?.completedAt,
      rewarded: Boolean(localAttempt?.rewarded || cloudAttempt?.rewarded)
    };
  });
  return normalizeCodeLabProgress({
    ...right,
    ...left,
    attemptsByChallengeId,
    completedChallengeIds: unique([...left.completedChallengeIds, ...right.completedChallengeIds]),
    bestStreak: Math.max(left.bestStreak, right.bestStreak),
    currentStreak: Math.max(left.currentStreak, right.currentStreak),
    totalPracticeMinutes: Math.max(left.totalPracticeMinutes, right.totalPracticeMinutes),
    currentChallengeId: left.currentChallengeId ?? right.currentChallengeId,
    favoriteLanguage: left.favoriteLanguage ?? right.favoriteLanguage
  });
};
