import { learningPaths } from '../data/learningPaths';
import { lessonById, lessonsByPath } from '../data/lessons';
import { AcademyLessonAttempt, AcademyProgress } from '../types/academy';

export const createDefaultAcademyProgress = (): AcademyProgress => ({
  completedLessonIds: [],
  rewardedLessonIds: [],
  completedExerciseIds: [],
  lessonAttempts: {},
  lastOpenedLessonByPath: {},
  unlockedPathIds: learningPaths.map((path) => path.id),
  completedPathIds: [],
  totalMinutesStudied: 0
});

const unique = (items: string[] = []) => Array.from(new Set(items.filter(Boolean)));

const mergeAttempts = (
  left: Record<string, AcademyLessonAttempt[]> = {},
  right: Record<string, AcademyLessonAttempt[]> = {}
) => {
  const merged: Record<string, AcademyLessonAttempt[]> = {};
  const keys = unique([...Object.keys(left), ...Object.keys(right)]);
  keys.forEach((lessonId) => {
    const seen = new Set<string>();
    merged[lessonId] = [...(left[lessonId] ?? []), ...(right[lessonId] ?? [])]
      .filter((attempt) => {
        const key = `${attempt.lessonId}:${attempt.selectedIndex}:${attempt.correct}:${attempt.attemptedAt}:${attempt.reviewErrorId ?? ''}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => new Date(a.attemptedAt).getTime() - new Date(b.attemptedAt).getTime());
  });
  return merged;
};

const completedPathsFor = (completedLessonIds: string[]) => {
  const completed = new Set(completedLessonIds);
  return learningPaths
    .filter((path) => {
      const pathLessons = lessonsByPath(path.id);
      return pathLessons.length > 0 && pathLessons.every((lesson) => completed.has(lesson.id));
    })
    .map((path) => path.id);
};

const minutesFor = (completedLessonIds: string[]) =>
  completedLessonIds.reduce((total, lessonId) => total + (lessonById(lessonId)?.estimatedMinutes ?? 0), 0);

export const normalizeAcademyProgress = (progress?: Partial<AcademyProgress> | null): AcademyProgress => {
  const defaults = createDefaultAcademyProgress();
  const completedLessonIds = unique(progress?.completedLessonIds ?? []);
  const completedPathIds = unique([...(progress?.completedPathIds ?? []), ...completedPathsFor(completedLessonIds)]);
  const totalMinutesStudied = Math.max(progress?.totalMinutesStudied ?? 0, minutesFor(completedLessonIds));

  return {
    ...defaults,
    ...progress,
    completedLessonIds,
    rewardedLessonIds: unique([...(progress?.rewardedLessonIds ?? []), ...completedLessonIds]),
    completedExerciseIds: unique(progress?.completedExerciseIds ?? []),
    lessonAttempts: mergeAttempts(progress?.lessonAttempts, {}),
    lastOpenedLessonByPath: progress?.lastOpenedLessonByPath ?? {},
    completedPathIds,
    unlockedPathIds: unique([...(progress?.unlockedPathIds ?? []), ...defaults.unlockedPathIds]),
    totalMinutesStudied
  };
};

export const completeAcademyLesson = (progress: AcademyProgress, lessonId: string) => {
  const normalized = normalizeAcademyProgress(progress);
  const lesson = lessonById(lessonId);
  const alreadyCompleted = normalized.completedLessonIds.includes(lessonId);
  const completedLessonIds = unique([...normalized.completedLessonIds, lessonId]);
  const completedPathIds = unique([...normalized.completedPathIds, ...completedPathsFor(completedLessonIds)]);

  return normalizeAcademyProgress({
    ...normalized,
    completedLessonIds,
    completedPathIds,
    favoritePathId: lesson?.pathId ?? normalized.favoritePathId,
    lastOpenedLessonByPath: lesson ? { ...normalized.lastOpenedLessonByPath, [lesson.pathId]: lesson.id } : normalized.lastOpenedLessonByPath,
    totalMinutesStudied: normalized.totalMinutesStudied + (alreadyCompleted ? 0 : lesson?.estimatedMinutes ?? 0)
  });
};

export const markAcademyLessonRewarded = (progress: AcademyProgress, lessonId: string) =>
  normalizeAcademyProgress({
    ...progress,
    rewardedLessonIds: unique([...progress.rewardedLessonIds, lessonId])
  });

export const recordAcademyChallengeAttempt = (
  progress: AcademyProgress,
  input: { lessonId: string; selectedIndex: number; correct: boolean; reviewErrorId?: string }
) =>
  normalizeAcademyProgress({
    ...progress,
    lessonAttempts: mergeAttempts(progress.lessonAttempts, {
      [input.lessonId]: [
        {
          lessonId: input.lessonId,
          selectedIndex: input.selectedIndex,
          correct: input.correct,
          attemptedAt: new Date().toISOString(),
          reviewErrorId: input.reviewErrorId
        }
      ]
    })
  });

export const completeAcademyExercise = (progress: AcademyProgress, exerciseId: string) =>
  normalizeAcademyProgress({
    ...progress,
    completedExerciseIds: unique([...progress.completedExerciseIds, exerciseId])
  });

export const markAcademyLessonOpened = (progress: AcademyProgress, lessonId: string) => {
  const lesson = lessonById(lessonId);
  if (!lesson) return normalizeAcademyProgress(progress);
  return normalizeAcademyProgress({
    ...progress,
    favoritePathId: lesson.pathId,
    lastOpenedLessonByPath: {
      ...progress.lastOpenedLessonByPath,
      [lesson.pathId]: lesson.id
    }
  });
};

export const mergeAcademyProgress = (local?: Partial<AcademyProgress> | null, cloud?: Partial<AcademyProgress> | null): AcademyProgress => {
  const left = normalizeAcademyProgress(local);
  const right = normalizeAcademyProgress(cloud);
  const completedLessonIds = unique([...left.completedLessonIds, ...right.completedLessonIds]);
  const completedExerciseIds = unique([...left.completedExerciseIds, ...right.completedExerciseIds]);
  const rewardedLessonIds = unique([...left.rewardedLessonIds, ...right.rewardedLessonIds]);
  const lastOpenedLessonByPath = { ...right.lastOpenedLessonByPath, ...left.lastOpenedLessonByPath };

  return normalizeAcademyProgress({
    ...right,
    ...left,
    completedLessonIds,
    completedExerciseIds,
    rewardedLessonIds,
    lessonAttempts: mergeAttempts(left.lessonAttempts, right.lessonAttempts),
    lastOpenedLessonByPath,
    unlockedPathIds: unique([...left.unlockedPathIds, ...right.unlockedPathIds]),
    completedPathIds: unique([...left.completedPathIds, ...right.completedPathIds, ...completedPathsFor(completedLessonIds)]),
    totalMinutesStudied: Math.max(left.totalMinutesStudied, right.totalMinutesStudied, minutesFor(completedLessonIds))
  });
};
