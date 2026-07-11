import AsyncStorage from '@react-native-async-storage/async-storage';
import { learningPaths } from '../data/learningPaths';
import { lessons, lessonsByPath } from '../data/lessons';
import { AcademyProgress } from '../types/academy';
import { parseJsonOrFallback } from '../utils/jsonStorage';
import {
  completeAcademyExercise,
  completeAcademyLesson,
  createDefaultAcademyProgress,
  markAcademyLessonOpened,
  markAcademyLessonRewarded,
  normalizeAcademyProgress,
  recordAcademyChallengeAttempt
} from './academyProgressRules';
import { storageKeys } from './storageKeys';

export const defaultAcademyProgress: AcademyProgress = createDefaultAcademyProgress();

export const academyProgressService = {
  async load(): Promise<AcademyProgress> {
    const raw = await AsyncStorage.getItem(storageKeys.academyProgress);
    const saved = parseJsonOrFallback(raw, defaultAcademyProgress);
    return normalizeAcademyProgress(saved);
  },
  async save(progress: AcademyProgress) {
    await AsyncStorage.setItem(storageKeys.academyProgress, JSON.stringify(normalizeAcademyProgress(progress)));
  },
  async completeLesson(progress: AcademyProgress, lessonId: string) {
    const next = completeAcademyLesson(progress, lessonId);
    await this.save(next);
    return next;
  },
  async markRewarded(progress: AcademyProgress, lessonId: string) {
    const next = markAcademyLessonRewarded(progress, lessonId);
    await this.save(next);
    return next;
  },
  async markOpened(progress: AcademyProgress, lessonId: string) {
    const next = markAcademyLessonOpened(progress, lessonId);
    await this.save(next);
    return next;
  },
  async recordChallengeAttempt(
    progress: AcademyProgress,
    input: { lessonId: string; selectedIndex: number; correct: boolean; reviewErrorId?: string }
  ) {
    const next = recordAcademyChallengeAttempt(progress, input);
    await this.save(next);
    return next;
  },
  async completeExercise(progress: AcademyProgress, exerciseId: string) {
    const next = completeAcademyExercise(progress, exerciseId);
    await this.save(next);
    return next;
  },
  stats(progress: AcademyProgress) {
    const byPath = learningPaths.map((path) => {
      const pathLessons = lessonsByPath(path.id);
      const completed = pathLessons.filter((lesson) => progress.completedLessonIds.includes(lesson.id)).length;
      return { path, completed, total: pathLessons.length, ratio: pathLessons.length ? completed / pathLessons.length : 0 };
    });
    const best = [...byPath].sort((a, b) => b.ratio - a.ratio)[0];
    const weakest = [...byPath].sort((a, b) => a.ratio - b.ratio)[0];
    return {
      completedLessons: progress.completedLessonIds.length,
      completedPaths: progress.completedPathIds.length,
      totalLessons: lessons.length,
      totalMinutesStudied: progress.totalMinutesStudied,
      bestPath: best?.path.title ?? 'Nenhuma',
      weakestPath: weakest?.path.title ?? 'Nenhuma'
    };
  }
};
