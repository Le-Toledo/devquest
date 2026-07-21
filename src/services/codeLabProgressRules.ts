import { codeLabChallengeById } from '../data/codeLabChallenges';
import { CodeLabAttempt, CodeLabAttemptHistoryEntry, CodeLabProgress } from '../types/codeLab';

const maxCodeLength = 4000;
export const maxCodeLabHistoryEntries = 12;
const unique = (items: string[] = []) => Array.from(new Set(items.filter(Boolean)));
const epoch = new Date(0).toISOString();

const isIsoDate = (value?: string) => Boolean(value && !Number.isNaN(new Date(value).getTime()));

const normalizeHistory = (challengeId: string, history?: CodeLabAttemptHistoryEntry[]) => {
  if (!Array.isArray(history)) return [];
  return history
    .filter((entry) => entry && entry.challengeId === challengeId && typeof entry.id === 'string' && entry.id.trim())
    .map((entry) => ({
      id: entry.id,
      challengeId,
      code: trimSavedCode(entry.code ?? ''),
      score: Math.max(0, Math.min(100, Math.round(entry.score ?? 0))),
      passed: Boolean(entry.passed),
      passedChecks: Math.max(0, entry.passedChecks ?? 0),
      totalChecks: Math.max(0, entry.totalChecks ?? 0),
      attemptNumber: Math.max(1, entry.attemptNumber ?? 1),
      attemptedAt: isIsoDate(entry.attemptedAt) ? entry.attemptedAt : epoch
    }))
    .sort((a, b) => new Date(b.attemptedAt).getTime() - new Date(a.attemptedAt).getTime())
    .slice(0, maxCodeLabHistoryEntries);
};

const buildAttempt = (challengeId: string, attempt?: Partial<CodeLabAttempt>): CodeLabAttempt => ({
  challengeId,
  attempts: Math.max(0, attempt?.attempts ?? 0),
  bestScore: Math.max(0, Math.min(100, attempt?.bestScore ?? 0)),
  completed: Boolean(attempt?.completed),
  usedHints: Math.max(0, attempt?.usedHints ?? 0),
  viewedSolution: Boolean(attempt?.viewedSolution),
  lastCode: trimSavedCode(attempt?.lastCode ?? ''),
  lastAttemptAt: isIsoDate(attempt?.lastAttemptAt) ? attempt?.lastAttemptAt ?? epoch : epoch,
  completedAt: isIsoDate(attempt?.completedAt) ? attempt?.completedAt : undefined,
  rewarded: Boolean(attempt?.rewarded),
  draftCode: typeof attempt?.draftCode === 'string' ? trimSavedCode(attempt.draftCode) : undefined,
  draftUpdatedAt: isIsoDate(attempt?.draftUpdatedAt) ? attempt?.draftUpdatedAt : undefined,
  history: normalizeHistory(challengeId, attempt?.history)
});

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
      buildAttempt(challengeId, attempt)
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
  input: { challengeId: string; code: string; score: number; passed: boolean; passedChecks?: number; totalChecks?: number },
  now = new Date()
) => {
  const normalized = normalizeCodeLabProgress(progress);
  const current = normalized.attemptsByChallengeId[input.challengeId];
  const challenge = codeLabChallengeById(input.challengeId);
  const completedFirstTime = input.passed && !current?.completed;
  const currentStreak = input.passed ? normalized.currentStreak + 1 : 0;
  const attemptedAt = now.toISOString();
  const attemptNumber = (current?.attempts ?? 0) + 1;
  const historyEntry: CodeLabAttemptHistoryEntry = {
    id: `code-lab-${input.challengeId}-${now.getTime()}-${attemptNumber}`,
    challengeId: input.challengeId,
    code: trimSavedCode(input.code),
    score: Math.max(0, Math.min(100, Math.round(input.score))),
    passed: input.passed,
    passedChecks: Math.max(0, input.passedChecks ?? 0),
    totalChecks: Math.max(0, input.totalChecks ?? 0),
    attemptNumber,
    attemptedAt
  };
  const attempt: CodeLabAttempt = {
    challengeId: input.challengeId,
    attempts: attemptNumber,
    bestScore: Math.max(current?.bestScore ?? 0, input.score),
    completed: Boolean(current?.completed || input.passed),
    usedHints: current?.usedHints ?? 0,
    viewedSolution: current?.viewedSolution ?? false,
    lastCode: trimSavedCode(input.code),
    lastAttemptAt: attemptedAt,
    completedAt: current?.completedAt ?? (input.passed ? attemptedAt : undefined),
    rewarded: current?.rewarded ?? false,
    draftCode: input.passed ? undefined : current?.draftCode,
    draftUpdatedAt: input.passed ? undefined : current?.draftUpdatedAt,
    history: normalizeHistory(input.challengeId, [historyEntry, ...(current?.history ?? [])])
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

export const saveCodeLabDraft = (progress: CodeLabProgress, challengeId: string, code: string, now = new Date()) => {
  const normalized = normalizeCodeLabProgress(progress);
  const current = normalized.attemptsByChallengeId[challengeId];
  const nextDraft = trimSavedCode(code);
  if (current?.draftCode === nextDraft) return normalized;
  return normalizeCodeLabProgress({
    ...normalized,
    currentChallengeId: challengeId,
    attemptsByChallengeId: {
      ...normalized.attemptsByChallengeId,
      [challengeId]: {
        ...buildAttempt(challengeId, current),
        draftCode: nextDraft,
        draftUpdatedAt: now.toISOString()
      }
    }
  });
};

export const clearCodeLabDraft = (progress: CodeLabProgress, challengeId: string) => {
  const normalized = normalizeCodeLabProgress(progress);
  const current = normalized.attemptsByChallengeId[challengeId];
  if (!current?.draftCode && !current?.draftUpdatedAt) return normalized;
  return normalizeCodeLabProgress({
    ...normalized,
    attemptsByChallengeId: {
      ...normalized.attemptsByChallengeId,
      [challengeId]: {
        ...current,
        draftCode: undefined,
        draftUpdatedAt: undefined
      }
    }
  });
};

export const deleteCodeLabHistoryEntry = (progress: CodeLabProgress, challengeId: string, historyId: string) => {
  const normalized = normalizeCodeLabProgress(progress);
  const current = normalized.attemptsByChallengeId[challengeId];
  if (!current?.history?.some((entry) => entry.id === historyId)) return normalized;
  return normalizeCodeLabProgress({
    ...normalized,
    attemptsByChallengeId: {
      ...normalized.attemptsByChallengeId,
      [challengeId]: {
        ...current,
        history: current.history.filter((entry) => entry.id !== historyId)
      }
    }
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
        rewarded: current?.rewarded ?? false,
        draftCode: current?.draftCode,
        draftUpdatedAt: current?.draftUpdatedAt,
        history: current?.history ?? []
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
        rewarded: current?.rewarded ?? false,
        draftCode: current?.draftCode,
        draftUpdatedAt: current?.draftUpdatedAt,
        history: current?.history ?? []
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
      rewarded: Boolean(localAttempt?.rewarded || cloudAttempt?.rewarded),
      draftCode: latest?.draftCode,
      draftUpdatedAt: latest?.draftUpdatedAt,
      history: normalizeHistory(challengeId, [...(localAttempt?.history ?? []), ...(cloudAttempt?.history ?? [])])
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
