import { lessonById, lessons, lessonsByPath, modulesByPath } from '../data/lessons';
import { learningPathById, learningPaths } from '../data/learningPaths';
import { AcademyModule, AcademyProgress, LearningPath, Lesson } from '../types/academy';

export type AcademyLessonStatus = 'completed' | 'current' | 'available' | 'locked';
export type AcademyLevelFilter = 'todos' | NonNullable<Lesson['level']>;

export type AcademyModuleProgress = AcademyModule & {
  completed: number;
  total: number;
  ratio: number;
};

export const lessonStatusFor = (lesson: Lesson, pathLessons: Lesson[], progress: AcademyProgress): AcademyLessonStatus => {
  if (progress.completedLessonIds.includes(lesson.id)) return 'completed';
  const lessonIndex = pathLessons.findIndex((item) => item.id === lesson.id);
  const nextIncompleteIndex = pathLessons.findIndex((item) => !progress.completedLessonIds.includes(item.id));
  const previousLesson = lessonIndex > 0 ? pathLessons[lessonIndex - 1] : undefined;
  const unlocked = lessonIndex === 0 || (previousLesson && progress.completedLessonIds.includes(previousLesson.id));
  if (unlocked && lessonIndex === nextIncompleteIndex) return 'current';
  if (unlocked) return 'available';
  return 'locked';
};

export const completionRatioForPath = (pathId: string, progress: AcademyProgress) => {
  const pathLessons = lessonsByPath(pathId);
  const completed = pathLessons.filter((lesson) => progress.completedLessonIds.includes(lesson.id)).length;
  return {
    completed,
    total: pathLessons.length,
    ratio: pathLessons.length ? completed / pathLessons.length : 0
  };
};

export const moduleProgressForPath = (pathId: string, progress: AcademyProgress): AcademyModuleProgress[] =>
  modulesByPath(pathId).map((module) => {
    const moduleLessons = lessons.filter((lesson) => lesson.moduleId === module.id);
    const completed = moduleLessons.filter((lesson) => progress.completedLessonIds.includes(lesson.id)).length;
    return {
      ...module,
      completed,
      total: moduleLessons.length,
      ratio: moduleLessons.length ? completed / moduleLessons.length : 0
    };
  });

export const lastOpenedLessonForPath = (pathId: string, progress: AcademyProgress) => {
  const saved = progress.lastOpenedLessonByPath[pathId];
  const savedLesson = saved ? lessonById(saved) : undefined;
  if (savedLesson?.pathId === pathId) return savedLesson;
  const pathLessons = lessonsByPath(pathId);
  return [...pathLessons].reverse().find((lesson) => progress.completedLessonIds.includes(lesson.id)) ?? pathLessons[0];
};

export const nextLessonForPath = (pathId: string, progress: AcademyProgress) => {
  const pathLessons = lessonsByPath(pathId);
  return pathLessons.find((lesson) => lessonStatusFor(lesson, pathLessons, progress) === 'current') ?? pathLessons.find((lesson) => !progress.completedLessonIds.includes(lesson.id));
};

export const nextRecommendedLesson = (progress: AcademyProgress, selectedPathId?: string) => {
  if (selectedPathId) return nextLessonForPath(selectedPathId, progress);
  const favorite = progress.favoritePathId ? nextLessonForPath(progress.favoritePathId, progress) : undefined;
  return favorite ?? learningPaths.map((path) => nextLessonForPath(path.id, progress)).find(Boolean);
};

export const filterLessons = (items: Lesson[], query: string, level: AcademyLevelFilter) => {
  const normalizedQuery = query.trim().toLowerCase();
  return items.filter((lesson) => {
    const matchesLevel = level === 'todos' || lesson.level === level;
    if (!matchesLevel) return false;
    if (!normalizedQuery) return true;
    const path = learningPathById(lesson.pathId);
    const searchable = [
      lesson.title,
      lesson.description,
      lesson.concept,
      lesson.moduleTitle,
      lesson.level,
      path?.title,
      path?.areaIds.join(' ')
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return searchable.includes(normalizedQuery);
  });
};

export const filterPaths = (paths: LearningPath[], query: string, level: AcademyLevelFilter) => {
  const normalizedQuery = query.trim().toLowerCase();
  return paths.filter((path) => {
    const pathLessons = filterLessons(lessonsByPath(path.id), query, level);
    if (pathLessons.length > 0) return true;
    if (!normalizedQuery && level === 'todos') return true;
    return [path.title, path.description, path.areaIds.join(' ')].join(' ').toLowerCase().includes(normalizedQuery);
  });
};
