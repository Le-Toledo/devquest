import { ReviewError } from '../types/review';

const baseReviewError = (
  id: string,
  source: ReviewError['source'],
  sourceId: string,
  input: {
    prompt: string;
    areaId: ReviewError['areaId'];
    concept: string;
    difficulty: ReviewError['difficulty'];
    selectedAnswer: string;
    correctAnswer: string;
    explanation: string;
    hint: string;
    codeExample?: string;
  },
  existing: ReviewError | undefined,
  now: string
): ReviewError => ({
  id,
  source,
  sourceId,
  prompt: input.prompt,
  areaId: input.areaId,
  concept: input.concept,
  difficulty: input.difficulty,
  selectedAnswer: input.selectedAnswer,
  correctAnswer: input.correctAnswer,
  explanation: input.explanation,
  hint: input.hint,
  codeExample: input.codeExample,
  wrongCount: (existing?.wrongCount ?? 0) + 1,
  correctReviewCount: existing?.correctReviewCount ?? 0,
  intervalDays: 0,
  priority: 'today',
  firstWrongAt: existing?.firstWrongAt ?? now,
  lastWrongAt: now,
  nextReviewAt: now,
  learnedAt: existing?.learnedAt
});

export const buildAcademyReviewError = (
  input: {
    lessonId: string;
    prompt: string;
    areaId: ReviewError['areaId'];
    concept: string;
    difficulty?: ReviewError['difficulty'];
    selectedAnswer: string;
    correctAnswer: string;
    explanation: string;
    hint: string;
    codeExample?: string;
  },
  existing?: ReviewError,
  now = new Date().toISOString()
) =>
  baseReviewError(
    `academy-${input.lessonId}`,
    'academy',
    input.lessonId,
    { ...input, difficulty: input.difficulty ?? 'iniciante' },
    existing,
    now
  );

export const buildArenaReviewError = (
  input: {
    challengeId: string;
    prompt: string;
    areaId: ReviewError['areaId'];
    concept: string;
    difficulty: ReviewError['difficulty'];
    selectedAnswer: string;
    correctAnswer: string;
    explanation: string;
    hint: string;
    codeExample?: string;
  },
  existing?: ReviewError,
  now = new Date().toISOString()
) => baseReviewError(`arena-${input.challengeId}`, 'arena', input.challengeId, input, existing, now);

export const buildCodeLabReviewError = (
  input: {
    challengeId: string;
    prompt: string;
    areaId: ReviewError['areaId'];
    concept: string;
    difficulty: ReviewError['difficulty'];
    selectedAnswer: string;
    correctAnswer: string;
    explanation: string;
    hint: string;
    codeExample?: string;
    failedValidation?: string;
  },
  existing?: ReviewError,
  now = new Date().toISOString()
) => ({
  ...baseReviewError(`code-lab-${input.challengeId}`, 'codeLab', input.challengeId, input, existing, now),
  failedValidation: input.failedValidation
});
