import assert from 'node:assert/strict';
import {
  calculateNextDifficulty,
  createDefaultAdaptiveLearningState,
  normalizeAdaptiveLearningState,
  selectWeakConcepts,
  updateConceptMastery
} from '../src/services/adaptiveLearningService';

assert.equal(calculateNextDifficulty(88, 'iniciante'), 'intermediario', 'Domínio alto deve liberar dificuldade acima.');
assert.equal(calculateNextDifficulty(30, 'avancado'), 'intermediario', 'Domínio baixo deve reduzir pressão do aluno.');
assert.equal(calculateNextDifficulty(60, 'intermediario'), 'intermediario', 'Domínio médio deve manter dificuldade.');

const first = updateConceptMastery(createDefaultAdaptiveLearningState(), {
  conceptId: 'loops',
  language: 'JavaScript',
  source: 'codeLab',
  difficulty: 'iniciante',
  correct: false,
  hintsUsed: 1
}, new Date('2026-01-01T12:00:00.000Z'));

assert.equal(first.concepts.loops.attempts, 1, 'Tentativa adaptativa deve ser registrada.');
assert.equal(first.concepts.loops.incorrect, 1, 'Erro deve aumentar contador de dificuldades.');
assert(first.concepts.loops.mastery < 35, 'Erro com dica deve reduzir domínio.');

const second = updateConceptMastery(first, {
  conceptId: 'arrays',
  language: 'JavaScript',
  source: 'academy',
  difficulty: 'iniciante',
  correct: true
}, new Date('2026-01-02T12:00:00.000Z'));

assert.deepEqual(selectWeakConcepts(second, 1).map((item) => item.conceptId), ['loops'], 'Recomendação deve priorizar conceito mais fraco.');

const normalized = normalizeAdaptiveLearningState({ concepts: { loops: { ...first.concepts.loops, mastery: 180 } } });
assert.equal(normalized.concepts.loops.mastery, 100, 'Normalização deve limitar domínio a 100.');

console.log('Adaptive learning tests OK');
