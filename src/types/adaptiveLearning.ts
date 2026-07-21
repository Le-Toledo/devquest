import { Difficulty } from './game';

export type AdaptiveLearningSource = 'academy' | 'arena' | 'campaign' | 'codeLab' | 'review';

export interface AdaptiveConceptRecord {
  conceptId: string;
  language?: string;
  attempts: number;
  correct: number;
  incorrect: number;
  mastery: number;
  currentDifficulty: Difficulty;
  nextDifficulty: Difficulty;
  dueAt: string;
  lastAttemptAt: string;
  lastSource: AdaptiveLearningSource;
}

export interface AdaptiveLearningState {
  concepts: Record<string, AdaptiveConceptRecord>;
  updatedAt: string;
}

export interface AdaptiveLearningAttemptInput {
  conceptId: string;
  language?: string;
  source: AdaptiveLearningSource;
  difficulty: Difficulty;
  correct: boolean;
  hintsUsed?: number;
}
