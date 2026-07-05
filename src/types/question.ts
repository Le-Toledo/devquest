import { AreaId, Difficulty, Question, QuestionKind, QuestionType } from './game';

export type QuestionSeenEntry = {
  questionId: string;
  seenAt: string;
};

export type QuestionSelectionRequest = {
  areaIds?: AreaId[];
  difficulties?: Difficulty[];
  kinds?: QuestionKind[];
  types?: QuestionType[];
  tags?: string[];
  excludeQuestionIds?: string[];
  limit: number;
};

export type QuestionAuditSummary = {
  total: number;
  byArea: Record<string, number>;
  byDifficulty: Record<Difficulty, number>;
  byType: Record<QuestionType, number>;
  duplicateIds: string[];
  duplicatePrompts: string[];
};

export type SelectableQuestion = Question & {
  lastSeenAt?: string;
  recentAnswerCount?: number;
};
