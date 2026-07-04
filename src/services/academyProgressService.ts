import AsyncStorage from '@react-native-async-storage/async-storage';
import { learningPaths } from '../data/learningPaths';
import { lessons, lessonsByPath } from '../data/lessons';
import { AcademyProgress } from '../types/academy';
import { parseJsonOrFallback } from '../utils/jsonStorage';
import { storageKeys } from './storageKeys';

export const defaultAcademyProgress: AcademyProgress = {
  completedLessonIds: [],
  unlockedPathIds: learningPaths.map((path) => path.id),
  completedPathIds: [],
  totalMinutesStudied: 0
};

export const academyProgressService = {
  async load(): Promise<AcademyProgress> {
    const raw = await AsyncStorage.getItem(storageKeys.academyProgress);
    const saved = parseJsonOrFallback(raw, defaultAcademyProgress);
    return {
      ...defaultAcademyProgress,
      ...saved,
      completedLessonIds: saved.completedLessonIds ?? [],
      completedPathIds: saved.completedPathIds ?? [],
      unlockedPathIds: Array.from(new Set([...(saved.unlockedPathIds ?? []), ...learningPaths.map((path) => path.id)])),
      totalMinutesStudied: saved.totalMinutesStudied ?? 0
    };
  },
  async save(progress: AcademyProgress) {
    await AsyncStorage.setItem(storageKeys.academyProgress, JSON.stringify(progress));
  },
  async completeLesson(progress: AcademyProgress, lessonId: string) {
    const lesson = lessons.find((item) => item.id === lessonId);
    const alreadyCompleted = progress.completedLessonIds.includes(lessonId);
    const completedLessonIds = Array.from(new Set([...progress.completedLessonIds, lessonId]));
    const completedPathIds = new Set(progress.completedPathIds);
    if (lesson) {
      const pathLessons = lessonsByPath(lesson.pathId);
      if (pathLessons.every((item) => completedLessonIds.includes(item.id))) {
        completedPathIds.add(lesson.pathId);
      }
    }
    const next: AcademyProgress = {
      ...progress,
      completedLessonIds,
      completedPathIds: Array.from(completedPathIds),
      favoritePathId: lesson?.pathId ?? progress.favoritePathId,
      totalMinutesStudied: progress.totalMinutesStudied + (alreadyCompleted ? 0 : lesson?.estimatedMinutes ?? 0)
    };
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
