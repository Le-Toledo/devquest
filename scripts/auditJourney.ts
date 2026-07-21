import assert from 'node:assert/strict';
import { buildJourneyRecommendation, resolveJourneyRecommendationMotivation } from '../src/services/journeyRecommendationService';
import { createDefaultAcademyProgress } from '../src/services/academyProgressRules';
import { createDefaultCodeLabProgress } from '../src/services/codeLabProgressRules';
import { createDefaultPlayer } from '../src/services/storage';

const result = buildJourneyRecommendation({
  player: createDefaultPlayer(),
  academyProgress: createDefaultAcademyProgress(),
  codeLabProgress: createDefaultCodeLabProgress(),
  reviewStats: {
    totalErrors: 0,
    learnedErrors: 0,
    hardestLanguages: [],
    hardestConcepts: [],
    improvementRate: 0
  }
});

assert(result.primary.route.name, 'Jornada precisa retornar uma rota primária navegável.');
assert(resolveJourneyRecommendationMotivation(result.primary).length > 10, 'Jornada precisa retornar motivação amigável para o CTA.');
assert.equal(result.campaign?.route.name, 'campaign', 'CTA principal do Hub deve continuar apontando para campanha.');
assert(result.relatedCodeLab?.challenge?.id, 'Jornada precisa manter recomendação segura do Laboratório de Código.');
assert(result.nextLesson?.sourceId, 'Jornada precisa calcular uma próxima aula para usuário novo.');
assert(!/\b(journey|code-lab|arena-|lesson-|lab-|[a-z]+-[a-z0-9-]{2,})\b/i.test(resolveJourneyRecommendationMotivation(result.primary)), 'Motivação da Jornada não pode expor ID técnico.');

console.log('Audit OK: recomendações de Minha Jornada possuem fallback, campanha, aula, laboratório e motivação amigável.');
