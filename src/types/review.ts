import { AreaId, Difficulty } from './game';

export type ReviewPriority = 'today' | 'tomorrow' | 'three-days' | 'seven-days';

export interface ReviewError {
  id: string;
  source: 'quiz' | 'campaign';
  sourceId: string;
  prompt: string;
  areaId: AreaId;
  concept: string;
  difficulty: Difficulty;
  selectedAnswer: string;
  correctAnswer: string;
  explanation: string;
  hint: string;
  codeExample?: string;
  wrongCount: number;
  correctReviewCount: number;
  intervalDays: number;
  priority: ReviewPriority;
  firstWrongAt: string;
  lastWrongAt: string;
  nextReviewAt: string;
  learnedAt?: string;
}

export interface ReviewStats {
  totalErrors: number;
  learnedErrors: number;
  hardestLanguages: { label: string; count: number }[];
  hardestConcepts: { label: string; count: number }[];
  improvementRate: number;
}
