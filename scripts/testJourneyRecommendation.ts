import assert from 'node:assert/strict';
import { codeChallengeById } from '../src/data/codeChallenges';
import { codeLabChallenges } from '../src/data/codeLabChallenges';
import { lessons } from '../src/data/lessons';
import { buildJourneyRecommendation, resolveJourneyRecommendationMotivation, resolveJourneyRecommendationRoute } from '../src/services/journeyRecommendationService';
import { createDefaultAcademyProgress } from '../src/services/academyProgressRules';
import { createDefaultAdaptiveLearningState, updateConceptMastery } from '../src/services/adaptiveLearningService';
import { createDefaultCodeLabProgress, saveCodeLabDraft } from '../src/services/codeLabProgressRules';
import { createDefaultPlayer } from '../src/services/storage';
import { JourneyNavigationInput } from '../src/types/journey';
import { ReviewError, ReviewStats } from '../src/types/review';

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const baseReviewStats: ReviewStats = {
  totalErrors: 0,
  learnedErrors: 0,
  hardestLanguages: [],
  hardestConcepts: [],
  improvementRate: 0
};

const pendingReview: ReviewError = {
  id: 'academy-lesson-error',
  source: 'academy',
  sourceId: lessons[0].id,
  prompt: 'Erro em condicionais',
  areaId: 'logic',
  concept: 'condicional',
  difficulty: 'iniciante',
  selectedAnswer: 'if solto',
  correctAnswer: 'if com condição booleana',
  explanation: 'Condição decide o fluxo.',
  hint: 'Olhe para verdadeiro ou falso.',
  wrongCount: 2,
  correctReviewCount: 0,
  intervalDays: 0,
  priority: 'today',
  firstWrongAt: '2026-01-01T00:00:00.000Z',
  lastWrongAt: '2026-01-01T00:00:00.000Z',
  nextReviewAt: '2026-01-01T00:00:00.000Z'
};

const newUser = createDefaultPlayer();
const newUserRecommendation = buildJourneyRecommendation({
  player: newUser,
  academyProgress: createDefaultAcademyProgress(),
  codeLabProgress: createDefaultCodeLabProgress(),
  reviewStats: baseReviewStats,
  adaptiveLearning: createDefaultAdaptiveLearningState()
});

assert.equal(newUserRecommendation.campaign?.route.name, 'campaign', 'Usuário novo deve manter campanha como CTA principal do Hub.');
assert.equal(newUserRecommendation.nextLesson?.kind, 'academy', 'Usuário novo deve receber próxima aula calculável.');
assert.equal(newUserRecommendation.relatedCodeLab?.kind, 'codeLab', 'Usuário novo deve ter fallback do Lab sem erro.');

const oldAcademyProgress = createDefaultAcademyProgress();
oldAcademyProgress.completedLessonIds = [lessons[0].id];
oldAcademyProgress.rewardedLessonIds = [lessons[0].id];
oldAcademyProgress.lastOpenedLessonByPath = { [lessons[0].pathId]: lessons[0].id };
const oldRecommendation = buildJourneyRecommendation({
  player: newUser,
  academyProgress: oldAcademyProgress,
  reviewStats: baseReviewStats
});
assert.notEqual(oldRecommendation.nextLesson?.sourceId, lessons[0].id, 'Usuário antigo deve avançar além da aula já concluída.');

const reviewFirst = buildJourneyRecommendation({
  player: newUser,
  academyProgress: oldAcademyProgress,
  reviewErrors: [pendingReview],
  reviewStats: { ...baseReviewStats, totalErrors: 1, hardestConcepts: [{ label: 'condicional', count: 1 }] }
});
assert.equal(reviewFirst.primary.kind, 'review', 'Revisão pendente deve ter prioridade sobre recomendações comuns.');
assert.equal(reviewFirst.pendingReview?.route.name, 'reviewLab', 'Revisão pendente deve apontar para o Laboratório.');
assert.deepEqual(resolveJourneyRecommendationRoute(reviewFirst.pendingReview), { name: 'reviewLab' }, 'Resolver deve navegar revisão para Review Lab.');
assert.equal(
  resolveJourneyRecommendationMotivation(reviewFirst.pendingReview),
  'Você tem um conceito que precisa ser revisado: condicional.',
  'Motivação de revisão deve explicar a causa da recomendação.'
);

const arenaReviewChallenge = codeChallengeById('arena-python-dicts-002');
assert(arenaReviewChallenge, 'Desafio conhecido da Arena deve existir.');
const arenaRecommendation = buildJourneyRecommendation({
  player: newUser,
  codeArenaProgress: { completedChallengeIds: [], reviewChallengeIds: [arenaReviewChallenge.id], combo: 0, medals: [] },
  reviewStats: baseReviewStats
});
assert.equal(arenaRecommendation.relatedArena?.sourceId, arenaReviewChallenge.id, 'Arena deve priorizar desafio marcado para revisão.');
assert.deepEqual(resolveJourneyRecommendationRoute(arenaRecommendation.relatedArena), {
  name: 'codeChallenge',
  challengeId: arenaReviewChallenge.id,
  challengeIds: [arenaReviewChallenge.id]
}, 'Resolver deve navegar Arena com challengeId e bloco de um desafio.');
assert.match(
  resolveJourneyRecommendationMotivation(arenaRecommendation.relatedArena),
  /^Pratique um desafio relacionado/,
  'Motivação da Arena deve ser curta e coerente com prática relacionada.'
);

const incompleteInput = {
  player: newUser,
  academyProgress: { completedLessonIds: ['id-desconhecido'] },
  codeLabProgress: { currentChallengeId: 'lab-desconhecido' },
  reviewStats: baseReviewStats
};
const before = clone(incompleteInput);
const incompleteRecommendation = buildJourneyRecommendation(incompleteInput);
assert.equal(incompleteRecommendation.fallback.route.name, 'campaign', 'Progresso incompleto deve cair em fallback seguro.');
assert.deepEqual(incompleteInput, before, 'Serviço de Jornada não pode mutar entrada.');
assert.deepEqual(resolveJourneyRecommendationRoute(undefined), { name: 'campaign' }, 'Usuário sem progresso deve cair na campanha.');

const deterministicA = buildJourneyRecommendation(incompleteInput);
const deterministicB = buildJourneyRecommendation(incompleteInput);
assert.deepEqual(deterministicA, deterministicB, 'Mesma entrada deve produzir a mesma recomendação.');

const noAdaptive = buildJourneyRecommendation({
  player: newUser,
  academyProgress: createDefaultAcademyProgress(),
  adaptiveLearning: null,
  reviewStats: baseReviewStats
});
assert(noAdaptive.primary, 'Ausência de dados adaptativos não pode quebrar recomendação.');
assert.equal(noAdaptive.nextLesson?.sourceId, lessons[0].id, 'Sem progresso, próxima aula não pode ser conteúdo bloqueado.');
assert.deepEqual(resolveJourneyRecommendationRoute(noAdaptive.nextLesson), { name: 'lesson', lessonId: lessons[0].id }, 'Resolver deve navegar aula com ID correto.');
assert.equal(
  resolveJourneyRecommendationMotivation(noAdaptive.nextLesson),
  `Sua próxima aula desbloqueada é ${lessons[0].title}.`,
  'Motivação de aula deve citar a aula desbloqueada sem usar ID técnico.'
);

const weakAdaptive = updateConceptMastery(createDefaultAdaptiveLearningState(), {
  conceptId: 'Arrays',
  language: 'JavaScript',
  source: 'codeLab',
  difficulty: 'intermediario',
  correct: false,
  hintsUsed: 2
}, new Date('2026-01-01T00:00:00.000Z'));
const weakRecommendation = buildJourneyRecommendation({
  player: newUser,
  academyProgress: createDefaultAcademyProgress(),
  reviewStats: baseReviewStats,
  adaptiveLearning: weakAdaptive
});
assert.equal(weakRecommendation.relatedCodeLab?.reason, 'adaptive-weak-concept', 'Conceito frágil deve priorizar prática adaptativa quando não há revisão pendente.');
assert.equal(weakRecommendation.nextLesson?.sourceId, lessons[0].id, 'Adaptativo não deve recomendar aula bloqueada para usuário novo.');
assert(weakRecommendation.relatedCodeLab?.sourceId, 'Recomendação adaptativa deve apontar para desafio real do Lab.');
assert.deepEqual(resolveJourneyRecommendationRoute(weakRecommendation.relatedCodeLab), {
  name: 'codeLabChallenge',
  challengeId: weakRecommendation.relatedCodeLab.sourceId,
  returnTo: { name: 'home' }
}, 'Resolver deve navegar Laboratório com challengeId correto.');
assert.match(
  resolveJourneyRecommendationMotivation(weakRecommendation.relatedCodeLab),
  /^Você teve dificuldade em .+ Vamos praticar mais uma vez\.$/,
  'Motivação adaptativa do Lab deve explicar o conceito frágil.'
);

const weakWithReview = buildJourneyRecommendation({
  player: newUser,
  academyProgress: createDefaultAcademyProgress(),
  reviewErrors: [pendingReview],
  reviewStats: baseReviewStats,
  adaptiveLearning: weakAdaptive
});
assert.equal(weakWithReview.primary.kind, 'review', 'Revisão real pendente deve continuar acima do adaptativo.');

const draftChallenge = codeLabChallenges[1];
const draftLabProgress = saveCodeLabDraft(createDefaultCodeLabProgress(), draftChallenge.id, 'const total = 10;');
const draftRecommendation = buildJourneyRecommendation({
  player: newUser,
  academyProgress: createDefaultAcademyProgress(),
  codeLabProgress: draftLabProgress,
  reviewStats: baseReviewStats
});
assert.equal(draftRecommendation.relatedCodeLab?.reason, 'code-lab-draft', 'Rascunho real do Lab deve ser reconhecido pela recomendação.');
assert.equal(
  resolveJourneyRecommendationMotivation(draftRecommendation.relatedCodeLab),
  'Você tem um rascunho pendente no Laboratório.',
  'Motivação de rascunho só deve aparecer quando existir draftCode real.'
);

assert.deepEqual(resolveJourneyRecommendationRoute(weakRecommendation.campaign), { name: 'campaign' }, 'Resolver deve navegar campanha para CampaignScreen.');
assert.deepEqual(resolveJourneyRecommendationRoute(weakRecommendation.fallback), { name: 'campaign' }, 'Resolver deve manter fallback na campanha.');
assert.match(
  resolveJourneyRecommendationMotivation(weakRecommendation.campaign),
  /^Continue sua jornada/,
  'Motivação da Campanha deve explicar continuidade da jornada.'
);
assert.equal(
  resolveJourneyRecommendationMotivation(weakRecommendation.fallback),
  'Continue sua jornada no capítulo atual.',
  'Motivação de fallback deve ser segura e não inventar destino.'
);

const unknownRecommendation: JourneyNavigationInput = { kind: 'desconhecido', sourceId: lessons[0].id };
assert.deepEqual(resolveJourneyRecommendationRoute(unknownRecommendation), { name: 'campaign' }, 'Tipo desconhecido deve cair no fallback.');
assert.equal(resolveJourneyRecommendationMotivation(unknownRecommendation), 'Continue sua jornada no capítulo atual.', 'Tipo desconhecido deve usar motivação segura da Campanha.');

const missingIdRecommendation: JourneyNavigationInput = { kind: 'academy' };
assert.deepEqual(resolveJourneyRecommendationRoute(missingIdRecommendation), { name: 'campaign' }, 'ID ausente deve cair no fallback.');
assert.equal(resolveJourneyRecommendationMotivation(missingIdRecommendation), 'Continue sua jornada no capítulo atual.', 'ID ausente deve usar motivação segura da Campanha.');

const invalidLessonRecommendation: JourneyNavigationInput = { kind: 'academy', sourceId: 'lesson-inexistente' };
assert.deepEqual(resolveJourneyRecommendationRoute(invalidLessonRecommendation), { name: 'campaign' }, 'Aula inexistente deve cair no fallback.');
assert.equal(resolveJourneyRecommendationMotivation(invalidLessonRecommendation), 'Continue sua jornada no capítulo atual.', 'Aula inválida deve usar motivação segura da Campanha.');

const invalidArenaRecommendation: JourneyNavigationInput = { kind: 'arena', sourceId: 'arena-inexistente' };
assert.deepEqual(resolveJourneyRecommendationRoute(invalidArenaRecommendation), { name: 'campaign' }, 'Desafio da Arena inexistente deve cair no fallback.');

const invalidLabRecommendation: JourneyNavigationInput = { kind: 'codeLab', sourceId: 'lab-inexistente' };
assert.deepEqual(resolveJourneyRecommendationRoute(invalidLabRecommendation), { name: 'campaign' }, 'Desafio do Laboratório inexistente deve cair no fallback.');

const emptyMotivationWithValidLesson: JourneyNavigationInput = { kind: 'academy', sourceId: lessons[0].id, motivation: '' };
assert.equal(
  resolveJourneyRecommendationMotivation(emptyMotivationWithValidLesson),
  'Sua próxima aula desbloqueada está pronta.',
  'Recomendação válida sem motivação deve cair em frase genérica do próprio tipo.'
);

const technicalIdPattern = /\b(journey|code-lab|arena-|lesson-|lab-|[a-z]+-[a-z0-9-]{2,})\b/i;
[
  reviewFirst.pendingReview,
  noAdaptive.nextLesson,
  arenaRecommendation.relatedArena,
  weakRecommendation.relatedCodeLab,
  draftRecommendation.relatedCodeLab,
  weakRecommendation.campaign,
  weakRecommendation.fallback,
  invalidLessonRecommendation
].forEach((recommendation) => {
  assert(!technicalIdPattern.test(resolveJourneyRecommendationMotivation(recommendation)), 'Motivação não deve expor IDs técnicos ao jogador.');
});

assert(codeLabChallenges.some((challenge) => challenge.id === weakRecommendation.relatedCodeLab?.sourceId), 'Serviço não deve recomendar desafio de Lab inexistente.');

console.log('Journey recommendation tests OK');
