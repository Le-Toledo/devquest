import assert from 'node:assert/strict';
import { recommendedCodeChallengeFor } from '../src/data/codeChallenges';
import { lessonsByPath } from '../src/data/lessons';
import {
  completeAcademyExercise,
  completeAcademyLesson,
  createDefaultAcademyProgress,
  markAcademyLessonRewarded,
  mergeAcademyProgress,
  normalizeAcademyProgress
} from '../src/services/academyProgressRules';
import { buildAcademyReviewError, buildArenaReviewError } from '../src/services/reviewErrorFactory';

const firstLogic = lessonsByPath('logic-path')[0];
const fourthLogic = lessonsByPath('logic-path')[3];
assert(firstLogic, 'A trilha de lógica precisa ter primeira aula.');
assert(fourthLogic, 'A trilha de lógica precisa ter mais de três aulas.');

const legacy = normalizeAcademyProgress({
  completedLessonIds: [firstLogic.id],
  unlockedPathIds: ['logic-path'],
  completedPathIds: [],
  totalMinutesStudied: 0
});
assert.equal(legacy.completedLessonIds[0], firstLogic.id, 'Save antigo deve carregar aulas concluídas.');
assert(legacy.rewardedLessonIds.includes(firstLogic.id), 'Save antigo deve proteger recompensa já recebida.');
assert.equal(legacy.lessonAttempts[firstLogic.id]?.length ?? 0, 0, 'Save antigo deve criar tentativas vazias com segurança.');

const completedOnce = completeAcademyLesson(createDefaultAcademyProgress(), firstLogic.id);
const completedTwice = completeAcademyLesson(completedOnce, firstLogic.id);
assert.equal(completedTwice.completedLessonIds.filter((id) => id === firstLogic.id).length, 1, 'Conclusão de aula deve ser idempotente.');
assert.equal(completedTwice.totalMinutesStudied, completedOnce.totalMinutesStudied, 'Tempo estudado não pode duplicar.');

const rewardedOnce = markAcademyLessonRewarded(completedOnce, firstLogic.id);
const rewardedTwice = markAcademyLessonRewarded(rewardedOnce, firstLogic.id);
assert.equal(rewardedTwice.rewardedLessonIds.filter((id) => id === firstLogic.id).length, 1, 'Recompensa deve ser única.');

const exercise = firstLogic.exercises?.[0];
assert(exercise, 'Aula precisa ter exercício progressivo.');
const exerciseProgress = completeAcademyExercise(completedOnce, exercise.id);
assert(exerciseProgress.completedExerciseIds.includes(exercise.id), 'Exercício concluído deve persistir.');

const merged = mergeAcademyProgress(
  { ...completedOnce, completedExerciseIds: [exercise.id] },
  { ...createDefaultAcademyProgress(), completedLessonIds: [fourthLogic.id], totalMinutesStudied: 1 }
);
assert(merged.completedLessonIds.includes(firstLogic.id), 'Merge deve preservar progresso local.');
assert(merged.completedLessonIds.includes(fourthLogic.id), 'Merge deve preservar progresso remoto.');
assert(merged.completedExerciseIds.includes(exercise.id), 'Merge deve preservar exercícios.');
assert(merged.totalMinutesStudied >= completedOnce.totalMinutesStudied, 'Merge não pode reduzir minutos estudados.');

const ordered = lessonsByPath('logic-path').map((lesson) => lesson.order ?? 0);
assert.deepEqual([...ordered].sort((a, b) => a - b), ordered, 'Ordenação deve funcionar com mais de três aulas por trilha.');

const academyError = buildAcademyReviewError({
  lessonId: firstLogic.id,
  prompt: firstLogic.challenge.prompt,
  areaId: firstLogic.areaId,
  concept: firstLogic.concept,
  selectedAnswer: firstLogic.challenge.options[0] ?? 'Sem resposta',
  correctAnswer: firstLogic.challenge.options[firstLogic.challenge.correctIndex] ?? 'Resposta correta',
  explanation: firstLogic.challenge.explanation,
  hint: firstLogic.professorTip
});
assert.equal(academyError.source, 'academy', 'Erro da Academia deve ter origem academy.');
assert.equal(academyError.sourceId, firstLogic.id, 'Erro da Academia deve apontar para a aula.');

const arenaChallenge = recommendedCodeChallengeFor(firstLogic.areaId, firstLogic.concept);
const arenaError = buildArenaReviewError({
  challengeId: arenaChallenge.id,
  prompt: arenaChallenge.title,
  areaId: arenaChallenge.areaId,
  concept: arenaChallenge.concept,
  difficulty: arenaChallenge.difficulty,
  selectedAnswer: arenaChallenge.options[0] ?? 'Sem resposta',
  correctAnswer: arenaChallenge.options[arenaChallenge.correctIndex] ?? 'Resposta correta',
  explanation: arenaChallenge.explanation,
  hint: arenaChallenge.hint,
  codeExample: arenaChallenge.code
});
assert.equal(arenaError.source, 'arena', 'Erro da Arena deve ter origem arena.');
assert.equal(arenaError.sourceId, arenaChallenge.id, 'Erro da Arena deve apontar para o desafio.');
assert.equal(recommendedCodeChallengeFor('javascript', 'Promises e async await').areaId, 'javascript', 'Recomendação por conceito deve respeitar área.');

console.log('Professional maturity tests OK');
