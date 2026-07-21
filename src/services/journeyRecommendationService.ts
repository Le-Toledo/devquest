import { codeChallengeById, recommendedCodeChallengeFor } from '../data/codeChallenges';
import { codeLabChallenges, codeLabChallengesForConcept } from '../data/codeLabChallenges';
import { lessons, lessonsByPath } from '../data/lessons';
import { stages } from '../data/worlds';
import { AppRoute } from '../navigation/routes';
import { AcademyProgress } from '../types/academy';
import { CodeArenaProgress } from '../types/codeArena';
import { CodeLabChallenge, CodeLabProgress } from '../types/codeLab';
import { AdaptiveLearningState } from '../types/adaptiveLearning';
import { AreaId, PlayerProfile, Stage } from '../types/game';
import { JourneyNavigationInput, JourneyRecommendation, JourneyRecommendationInput, JourneyRecommendationResult } from '../types/journey';
import { ReviewError, ReviewStats } from '../types/review';
import { normalizeAdaptiveLearningState, selectWeakConcepts } from './adaptiveLearningService';
import { normalizeAcademyProgress } from './academyProgressRules';
import { defaultCodeArenaProgress } from './codeArenaService';
import { normalizeCodeLabProgress } from './codeLabProgressRules';

const priorityRank: Record<ReviewError['priority'], number> = {
  today: 0,
  tomorrow: 1,
  'three-days': 2,
  'seven-days': 3
};

const fallbackRoute: AppRoute = { name: 'campaign' };

const fallbackRecommendation: JourneyRecommendation = {
  id: 'journey-fallback-campaign',
  kind: 'fallback',
  title: 'Continuar Jornada',
  subtitle: 'Continue pela campanha principal.',
  motivation: 'Continue sua jornada no capítulo atual.',
  route: fallbackRoute,
  priority: 10,
  reason: 'fallback'
};

const cleanLabel = (value?: string, fallback = 'este conteúdo') => {
  const clean = value?.replace(/[`_]/g, ' ').replace(/\s+/g, ' ').trim();
  return clean || fallback;
};

export const journeyFallbackMotivation = fallbackRecommendation.motivation;

const fallbackMotivationForKind = (kind?: string) => {
  if (kind === 'review') return 'Você tem um conceito que precisa ser revisado.';
  if (kind === 'academy') return 'Sua próxima aula desbloqueada está pronta.';
  if (kind === 'arena') return 'Pratique um desafio relacionado ao que está aprendendo.';
  if (kind === 'codeLab') return 'Você possui um exercício recomendado no Laboratório.';
  return journeyFallbackMotivation;
};

const normalizeArenaProgress = (progress?: Partial<CodeArenaProgress> | null): CodeArenaProgress => ({
  completedChallengeIds: [...(progress?.completedChallengeIds ?? defaultCodeArenaProgress.completedChallengeIds)],
  reviewChallengeIds: [...(progress?.reviewChallengeIds ?? defaultCodeArenaProgress.reviewChallengeIds)],
  combo: Math.max(0, progress?.combo ?? defaultCodeArenaProgress.combo),
  medals: [...(progress?.medals ?? defaultCodeArenaProgress.medals)]
});

const normalizeReviewErrors = (errors?: ReviewError[]) => [...(errors ?? [])].filter((error) => error && !error.learnedAt);

const firstIncompleteLesson = (academyProgress: AcademyProgress) =>
  lessons.find((lesson) => !academyProgress.completedLessonIds.includes(lesson.id));

const isLessonUnlocked = (lessonId: string, academyProgress: AcademyProgress) => {
  const lesson = lessons.find((item) => item.id === lessonId);
  if (!lesson) return false;
  const pathLessons = lessonsByPath(lesson.pathId);
  const index = pathLessons.findIndex((item) => item.id === lesson.id);
  const previous = index > 0 ? pathLessons[index - 1] : undefined;
  return index === 0 || academyProgress.completedLessonIds.includes(lesson.id) || Boolean(previous && academyProgress.completedLessonIds.includes(previous.id));
};

const firstUnlockedIncompleteLesson = (academyProgress: AcademyProgress) =>
  lessons.find((lesson) => !academyProgress.completedLessonIds.includes(lesson.id) && isLessonUnlocked(lesson.id, academyProgress));

const lessonForConcept = (concept?: string) => {
  const normalized = concept?.toLowerCase() ?? '';
  if (!normalized) return undefined;
  return lessons.find((lesson) => {
    const lessonConcept = lesson.concept.toLowerCase();
    return normalized.includes(lessonConcept) || lessonConcept.includes(normalized);
  });
};

const nextLessonAfterLastOpened = (academyProgress: AcademyProgress) => {
  const lastOpenedIds = Object.values(academyProgress.lastOpenedLessonByPath);
  for (const lessonId of lastOpenedIds) {
    const current = lessons.find((lesson) => lesson.id === lessonId);
    if (!current) continue;
    const pathLessons = lessonsByPath(current.pathId);
    const currentIndex = pathLessons.findIndex((lesson) => lesson.id === current.id);
    const candidate = pathLessons.slice(currentIndex).find((lesson) => !academyProgress.completedLessonIds.includes(lesson.id) && isLessonUnlocked(lesson.id, academyProgress));
    if (candidate) return candidate;
  }
  return undefined;
};

const pendingReviewRecommendation = (errors?: ReviewError[]): JourneyRecommendation | undefined => {
  const active = normalizeReviewErrors(errors);
  const due = [...active].sort((a, b) => {
    const byPriority = priorityRank[a.priority] - priorityRank[b.priority];
    if (byPriority !== 0) return byPriority;
    const byDate = new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime();
    if (byDate !== 0) return byDate;
    return b.wrongCount - a.wrongCount || a.id.localeCompare(b.id);
  })[0];
  if (!due) return undefined;
  return {
    id: `journey-review-${due.id}`,
    kind: 'review',
    title: 'Revisar ponto pendente',
    subtitle: due.concept,
    motivation: due.concept
      ? `Você tem um conceito que precisa ser revisado: ${cleanLabel(due.concept)}.`
      : 'Você tem um conceito que precisa ser revisado.',
    route: { name: 'reviewLab' },
    priority: priorityRank[due.priority],
    reason: 'pending-review',
    concept: due.concept,
    sourceId: due.id
  };
};

const weakAdaptiveConcept = (adaptiveLearning?: Partial<AdaptiveLearningState> | null) => {
  const weak = selectWeakConcepts(normalizeAdaptiveLearningState(adaptiveLearning), 1)[0];
  return weak && weak.mastery <= 45 ? weak : undefined;
};

const lessonRecommendation = (
  academyProgress: AcademyProgress,
  adaptiveLearning?: Partial<AdaptiveLearningState> | null,
  reviewStats?: ReviewStats
): JourneyRecommendation | undefined => {
  const weak = weakAdaptiveConcept(adaptiveLearning);
  const statConcept = reviewStats?.hardestConcepts[0]?.label;
  const candidate =
    [lessonForConcept(weak?.conceptId), lessonForConcept(statConcept)].find((lesson) => lesson && isLessonUnlocked(lesson.id, academyProgress)) ??
    nextLessonAfterLastOpened(academyProgress) ??
    firstUnlockedIncompleteLesson(academyProgress) ??
    firstIncompleteLesson(academyProgress);
  if (!candidate) return undefined;
  return {
    id: `journey-academy-${candidate.id}`,
    kind: 'academy',
    title: candidate.title,
    subtitle: candidate.concept,
    motivation: `Sua próxima aula desbloqueada é ${cleanLabel(candidate.title, 'a próxima aula')}.`,
    route: { name: 'lesson', lessonId: candidate.id },
    priority: 3,
    reason: weak ? 'adaptive-weak-concept' : 'next-unlocked-lesson',
    concept: candidate.concept,
    sourceId: candidate.id
  };
};

const arenaRecommendation = (
  arenaProgress: CodeArenaProgress,
  concept?: string,
  areaId?: AreaId
): JourneyRecommendation | undefined => {
  const reviewChallenge = arenaProgress.reviewChallengeIds.map(codeChallengeById).find(Boolean);
  const candidate = reviewChallenge ?? recommendedCodeChallengeFor(areaId, concept);
  if (!candidate) return undefined;
  return {
    id: `journey-arena-${candidate.id}`,
    kind: 'arena',
    title: candidate.title,
    subtitle: candidate.concept,
    motivation: candidate.concept
      ? `Pratique um desafio relacionado a ${cleanLabel(candidate.concept)}.`
      : 'Pratique um desafio relacionado ao que está aprendendo.',
    route: { name: 'codeChallenge', challengeId: candidate.id, challengeIds: [candidate.id] },
    priority: reviewChallenge ? 2 : 4,
    reason: reviewChallenge ? 'arena-review' : 'related-arena',
    concept: candidate.concept,
    sourceId: candidate.id
  };
};

const codeLabRecommendation = (
  codeLabProgress: CodeLabProgress,
  reviewStats?: ReviewStats,
  adaptiveLearning?: Partial<AdaptiveLearningState> | null,
  concept?: string,
  areaId?: AreaId
): (JourneyRecommendation & { challenge?: CodeLabChallenge }) | undefined => {
  const weak = weakAdaptiveConcept(adaptiveLearning);
  const hardConcept = reviewStats?.hardestConcepts[0]?.label.toLowerCase();
  const candidate =
    (weak ? codeLabChallenges.find((challenge) => challenge.concept.toLowerCase().includes(weak.conceptId.toLowerCase())) : undefined) ??
    codeLabChallenges.find((challenge) => hardConcept && challenge.concept.toLowerCase().includes(hardConcept)) ??
    (concept ? codeLabChallengesForConcept(areaId, concept)[0] : undefined) ??
    codeLabChallenges.find((challenge) => challenge.id === codeLabProgress.currentChallengeId) ??
    codeLabChallenges[0];
  if (!candidate) return undefined;
  const hasDraft = Boolean(codeLabProgress.attemptsByChallengeId[candidate.id]?.draftCode);
  const reason = hasDraft ? 'code-lab-draft' : weak ? 'adaptive-weak-concept' : hardConcept ? 'review-hardest-concept' : 'code-lab-continuation';
  const motivation = hasDraft
    ? 'Você tem um rascunho pendente no Laboratório.'
    : weak
      ? `Você teve dificuldade em ${cleanLabel(candidate.concept)}. Vamos praticar mais uma vez.`
      : 'Você possui um exercício recomendado no Laboratório.';
  return {
    id: `journey-code-lab-${candidate.id}`,
    kind: 'codeLab',
    title: candidate.title,
    subtitle: `${candidate.language} • ${candidate.concept}`,
    motivation,
    route: { name: 'codeLabChallenge', challengeId: candidate.id, returnTo: { name: 'home' } },
    priority: weak ? 1 : hardConcept ? 2 : 5,
    reason,
    concept: candidate.concept,
    sourceId: candidate.id,
    challenge: candidate
  };
};

const campaignRecommendation = (player: PlayerProfile): JourneyRecommendation & { stage?: Stage } => {
  const completed = new Set(Object.keys(player.completedStages ?? {}));
  const stage = stages.find((item) => !completed.has(item.id) && player.level >= item.requiredLevel) ?? stages.find((item) => !completed.has(item.id)) ?? stages[0];
  return {
    id: `journey-campaign-${stage?.id ?? 'fallback'}`,
    kind: 'campaign',
    title: 'Continuar Jornada',
    subtitle: `${Object.keys(player.completedStages ?? {}).length} fases concluídas na campanha`,
    motivation: stage?.title
      ? `Continue sua jornada em ${cleanLabel(stage.title)}.`
      : journeyFallbackMotivation,
    route: { name: 'campaign' },
    priority: 6,
    reason: stage ? 'next-campaign-stage' : 'campaign-fallback',
    concept: stage?.areaId,
    sourceId: stage?.id,
    stage
  };
};

export const buildJourneyRecommendation = (input: JourneyRecommendationInput): JourneyRecommendationResult => {
  const academyProgress = normalizeAcademyProgress(input.academyProgress);
  const arenaProgress = normalizeArenaProgress(input.codeArenaProgress);
  const labProgress = normalizeCodeLabProgress(input.codeLabProgress);
  const review = pendingReviewRecommendation(input.reviewErrors);
  const lesson = lessonRecommendation(academyProgress, input.adaptiveLearning, input.reviewStats);
  const lessonArea = lesson?.sourceId ? lessons.find((item) => item.id === lesson.sourceId)?.areaId : undefined;
  const arena = arenaRecommendation(arenaProgress, lesson?.concept, lessonArea);
  const lab = codeLabRecommendation(labProgress, input.reviewStats, input.adaptiveLearning, lesson?.concept, lessonArea);
  const campaign = campaignRecommendation(input.player);
  const recommendations: JourneyRecommendation[] = [review, lab, lesson, arena, campaign, fallbackRecommendation]
    .filter((item): item is JourneyRecommendation => Boolean(item));
  const primary = recommendations
    .sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id))[0] ?? fallbackRecommendation;

  return {
    primary,
    pendingReview: review,
    nextLesson: lesson,
    relatedArena: arena,
    relatedCodeLab: lab,
    campaign,
    fallback: fallbackRecommendation
  };
};

export const resolveJourneyRecommendationRoute = (recommendation?: JourneyNavigationInput | null): AppRoute => {
  if (!recommendation?.kind) return fallbackRoute;

  if (recommendation.kind === 'review') {
    return recommendation.sourceId ? { name: 'reviewLab' } : fallbackRoute;
  }

  if (recommendation.kind === 'academy') {
    const lessonId = recommendation.route?.name === 'lesson' ? recommendation.route.lessonId : recommendation.sourceId;
    return lessonId && lessons.some((lesson) => lesson.id === lessonId) ? { name: 'lesson', lessonId } : fallbackRoute;
  }

  if (recommendation.kind === 'arena') {
    const challengeId = recommendation.route?.name === 'codeChallenge' ? recommendation.route.challengeId : recommendation.sourceId;
    return challengeId && codeChallengeById(challengeId) ? { name: 'codeChallenge', challengeId, challengeIds: [challengeId] } : fallbackRoute;
  }

  if (recommendation.kind === 'codeLab') {
    const challengeId = recommendation.route?.name === 'codeLabChallenge' ? recommendation.route.challengeId : recommendation.sourceId;
    return challengeId && codeLabChallenges.some((challenge) => challenge.id === challengeId)
      ? { name: 'codeLabChallenge', challengeId, returnTo: { name: 'home' } }
      : fallbackRoute;
  }

  if (recommendation.kind === 'campaign') {
    return { name: 'campaign' };
  }

  if (recommendation.kind === 'fallback') {
    return fallbackRoute;
  }

  return fallbackRoute;
};

export const resolveJourneyRecommendationMotivation = (recommendation?: JourneyNavigationInput | null) => {
  const route = resolveJourneyRecommendationRoute(recommendation);
  const fellBackToCampaign = route.name === 'campaign' && recommendation?.kind !== 'campaign' && recommendation?.kind !== 'fallback';
  if (!recommendation?.kind || fellBackToCampaign) {
    return journeyFallbackMotivation;
  }
  return cleanLabel(recommendation.motivation, fallbackMotivationForKind(recommendation.kind));
};
