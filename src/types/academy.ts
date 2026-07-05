import { AreaId } from './game';
import { IconName } from './ui';

export interface QuickChallenge {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonSection {
  title: string;
  body: string;
  code?: string;
}

export interface AcademyModule {
  id: string;
  pathId: string;
  title: string;
  description: string;
  order: number;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  recommendedLevel: number;
  areaIds: AreaId[];
  color: string;
  modules?: AcademyModule[];
}

export interface Lesson {
  id: string;
  pathId: string;
  moduleId?: string;
  moduleTitle?: string;
  order?: number;
  title: string;
  description: string;
  objective?: string;
  content: string;
  sections?: LessonSection[];
  codeExample?: string;
  commonMistakes?: string[];
  bestPractices?: string[];
  summary?: string;
  prerequisites?: string[];
  tags?: string[];
  level?: 'iniciante' | 'intermediario' | 'avancado';
  professorTip: string;
  estimatedMinutes: number;
  xpReward: number;
  coinReward: number;
  areaId: AreaId;
  concept: string;
  challenge: QuickChallenge;
}

export interface AcademyProgress {
  completedLessonIds: string[];
  favoritePathId?: string;
  unlockedPathIds: string[];
  completedPathIds: string[];
  totalMinutesStudied: number;
}
