import { AreaId, Difficulty } from './game';

export type CodeLabChallengeKind =
  | 'complete-code'
  | 'fix-bug'
  | 'predict-output'
  | 'implement-function'
  | 'refactor'
  | 'sql-query'
  | 'html-structure'
  | 'css-layout'
  | 'order-blocks'
  | 'mini-project';

export type CodeLabValidationRuleType =
  | 'required-fragment'
  | 'forbidden-fragment'
  | 'ordered-fragments'
  | 'regex'
  | 'normalized-equality'
  | 'custom-validator';

export interface CodeLabTestCase {
  id: string;
  description: string;
  expected: string;
  hidden?: boolean;
}

export interface CodeLabValidationRule {
  id: string;
  type: CodeLabValidationRuleType;
  value?: string;
  values?: string[];
  message: string;
}

export interface CodeLabChallenge {
  id: string;
  title: string;
  description: string;
  language: string;
  areaId: AreaId;
  concept: string;
  difficulty: Difficulty;
  kind: CodeLabChallengeKind;
  objective: string;
  instructions: string[];
  context: string;
  starterCode: string;
  validationRules: CodeLabValidationRule[];
  testCases: CodeLabTestCase[];
  hints: string[];
  solution: string;
  solutionExplanation: string;
  acceptanceCriteria: string[];
  tags: string[];
  estimatedMinutes: number;
  xpReward: number;
  coinReward: number;
}

export interface CodeLabValidationResult {
  passed: boolean;
  score: number;
  checks: {
    id: string;
    passed: boolean;
    message: string;
  }[];
  feedback: string;
}

export interface CodeLabAttemptHistoryEntry {
  id: string;
  challengeId: string;
  code: string;
  score: number;
  passed: boolean;
  passedChecks: number;
  totalChecks: number;
  attemptNumber: number;
  attemptedAt: string;
}

export interface CodeLabAttempt {
  challengeId: string;
  attempts: number;
  bestScore: number;
  completed: boolean;
  usedHints: number;
  viewedSolution: boolean;
  lastCode: string;
  lastAttemptAt: string;
  completedAt?: string;
  rewarded?: boolean;
  draftCode?: string;
  draftUpdatedAt?: string;
  history?: CodeLabAttemptHistoryEntry[];
}

export interface CodeLabProgress {
  attemptsByChallengeId: Record<string, CodeLabAttempt>;
  completedChallengeIds: string[];
  favoriteLanguage?: string;
  currentChallengeId?: string;
  bestStreak: number;
  currentStreak: number;
  totalPracticeMinutes: number;
}
