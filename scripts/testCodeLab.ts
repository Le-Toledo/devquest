import assert from 'node:assert/strict';
import { codeLabChallengeById, codeLabChallenges } from '../src/data/codeLabChallenges';
import {
  createDefaultCodeLabProgress,
  mergeCodeLabProgress,
  normalizeCodeLabProgress,
  recordCodeLabHint,
  recordCodeLabValidation,
  trimSavedCode
} from '../src/services/codeLabProgressRules';
import { validateCodeLabSolution } from '../src/services/codeLabValidationService';
import { buildCodeLabReviewError } from '../src/services/reviewErrorFactory';

assert.equal(codeLabChallenges.length, 30, 'Laboratorio deve iniciar com 30 desafios.');

const jsFilter = codeLabChallengeById('lab-js-filter-active-users');
assert(jsFilter, 'Desafio JS de filter deve existir.');

const emptyResult = validateCodeLabSolution(jsFilter, '');
assert.equal(emptyResult.passed, false, 'Solucao vazia nunca deve passar.');
assert.equal(emptyResult.score, 0, 'Solucao vazia deve pontuar zero.');

const partialResult = validateCodeLabSolution(jsFilter, 'const usuariosAtivos = usuarios.filter(Boolean);');
assert.equal(partialResult.passed, false, 'Solucao parcial nao deve passar.');
assert(partialResult.score > 0 && partialResult.score < 100, 'Solucao parcial deve receber feedback graduado.');

const validResult = validateCodeLabSolution(jsFilter, jsFilter.solution);
assert.equal(validResult.passed, true, 'Solucao oficial deve passar na validacao deterministica.');
assert.equal(validResult.score, 100, 'Solucao oficial deve pontuar 100.');

const progress = createDefaultCodeLabProgress();
const failedOnce = recordCodeLabValidation(progress, { challengeId: jsFilter.id, code: partialResult.feedback, score: partialResult.score, passed: false });
assert.equal(failedOnce.currentStreak, 0, 'Erro deve zerar sequencia atual.');
assert.equal(failedOnce.attemptsByChallengeId[jsFilter.id]?.attempts, 1, 'Tentativa falha deve ser persistida.');

const completedOnce = recordCodeLabValidation(failedOnce, { challengeId: jsFilter.id, code: jsFilter.solution, score: 100, passed: true });
const completedTwice = recordCodeLabValidation(completedOnce, { challengeId: jsFilter.id, code: jsFilter.solution, score: 90, passed: true });
assert.equal(completedTwice.completedChallengeIds.filter((id) => id === jsFilter.id).length, 1, 'Conclusao deve ser idempotente.');
assert.equal(completedTwice.attemptsByChallengeId[jsFilter.id]?.bestScore, 100, 'Melhor score nunca deve baixar.');
assert.equal(completedTwice.totalPracticeMinutes, completedOnce.totalPracticeMinutes, 'Tempo de pratica nao deve duplicar para desafio ja concluido.');

const hinted = recordCodeLabHint(recordCodeLabHint(recordCodeLabHint(recordCodeLabHint(completedTwice, jsFilter.id), jsFilter.id), jsFilter.id), jsFilter.id);
assert.equal(hinted.attemptsByChallengeId[jsFilter.id]?.usedHints, 3, 'Dicas usadas devem respeitar limite de 3.');

const longCode = 'x'.repeat(4200);
assert.equal(trimSavedCode(longCode).length, 4000, 'Codigo persistido deve ser limitado.');

const remote = normalizeCodeLabProgress({
  attemptsByChallengeId: {
    [jsFilter.id]: {
      challengeId: jsFilter.id,
      attempts: 1,
      bestScore: 20,
      completed: false,
      usedHints: 1,
      viewedSolution: false,
      lastCode: 'remoto',
      lastAttemptAt: '2026-01-01T00:00:00.000Z'
    }
  },
  completedChallengeIds: [],
  bestStreak: 0,
  currentStreak: 0,
  totalPracticeMinutes: 0
});
const merged = mergeCodeLabProgress(completedOnce, remote);
assert.equal(merged.attemptsByChallengeId[jsFilter.id]?.bestScore, 100, 'Merge nao pode reduzir score.');
assert(merged.completedChallengeIds.includes(jsFilter.id), 'Merge deve preservar conclusao.');
assert.equal(merged.attemptsByChallengeId[jsFilter.id]?.lastCode, completedOnce.attemptsByChallengeId[jsFilter.id]?.lastCode, 'Merge deve preservar codigo mais recente.');

const reviewError = buildCodeLabReviewError({
  challengeId: jsFilter.id,
  prompt: jsFilter.title,
  areaId: jsFilter.areaId,
  concept: jsFilter.concept,
  difficulty: jsFilter.difficulty,
  selectedAnswer: 'tentativa',
  correctAnswer: 'Validar criterios antes de ver a solucao.',
  explanation: 'Feedback deterministico.',
  hint: 'Use filter.',
  failedValidation: 'Use filter para criar uma nova lista.'
});
assert.equal(reviewError.source, 'codeLab', 'Erro do Code Lab deve integrar o Review Lab.');
assert.equal(reviewError.sourceId, jsFilter.id, 'Erro do Code Lab deve apontar para o desafio.');

console.log('Code Lab tests OK');
