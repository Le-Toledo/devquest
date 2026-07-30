import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { AppRoute } from '../src/navigation/routes';
import { hiddenCommercialFeatures, releaseConfig } from '../src/services/releaseConfig';

async function run() {
  assert.equal(releaseConfig.commercialFeaturesEnabled, false, 'Recursos comerciais incompletos devem ficar ocultos no Release Candidate.');
  assert(hiddenCommercialFeatures.includes('Tela Premium'), 'Lista de recursos ocultos deve documentar Premium.');

  const homeDashboard = readFileSync('src/components/HomeDashboard.tsx', 'utf8');
  assert(!homeDashboard.includes("name: 'premium'"), 'Hub não deve expor rota Premium.');

  const shopScreen = readFileSync('src/screens/ShopScreen.tsx', 'utf8');
  assert(shopScreen.includes('filter((item) => !item.premium)'), 'Loja deve ocultar itens premium incompletos em produção.');
  assert(!shopScreen.includes('title={owned ? \'Disponivel\' : \'Comprar\'}'), 'Não deve existir botão Comprar na tela de recompensas.');

  const leaderboardService = readFileSync('src/services/leaderboardService.ts', 'utf8');
  const consentGuard = leaderboardService.indexOf('leaderboardConsentService.hasAccepted');
  const leaderboardNetworkCall = leaderboardService.indexOf("supabase.from('leaderboard_entries')");
  assert(consentGuard >= 0 && leaderboardNetworkCall > consentGuard, 'Consentimento deve ser verificado antes da publicação no ranking.');

  const professorByteScreen = readFileSync('src/screens/ProfessorByteScreen.tsx', 'utf8');
  assert(professorByteScreen.includes('Respostas de IA podem conter erros'), 'Professor Byte deve avisar que IA pode errar.');
  assert(professorByteScreen.includes('Reportar resposta ruim'), 'Professor Byte deve permitir reportar resposta ruim.');

  const feedbackRoute: AppRoute = { name: 'feedback' };
  const codeLabRoute: AppRoute = { name: 'codeLab' };
  assert.equal(feedbackRoute.name, 'feedback', 'Rota Feedback deve continuar tipada.');
  assert.equal(codeLabRoute.name, 'codeLab', 'Rota Code Lab deve permanecer preservada.');

  const accountDeletionCoreSource = readFileSync('src/services/accountDeletionCore.ts', 'utf8');
  const accountDeletionServiceSource = readFileSync('src/services/accountDeletionService.ts', 'utf8');
  assert(accountDeletionCoreSource.includes('requestAccountDeletion'), 'Service deve preparar solicitação de exclusão de conta.');
  assert.equal(releaseConfig.accountDeletionFunctionName, 'delete-account', 'Config deve apontar para a Edge Function tipada de exclusão.');
  assert(accountDeletionServiceSource.includes('accountDeletionFunctionName'), 'Service deve reutilizar a config da Edge Function.');
  assert(accountDeletionCoreSource.includes('Edge Function precisa ser implantada'), 'Service deve declarar bloqueio quando a função não está disponível.');

  const matrix = readFileSync('docs/app-store/rejection-risk-matrix.md', 'utf8');
  assert(matrix.includes('BLOQUEADOR'), 'Matriz deve declarar bloqueadores reais.');
  assert(matrix.includes('Exclusão de conta'), 'Matriz deve cobrir exclusão de conta.');

  console.log('Release readiness tests OK');
}

export const releaseReadinessTests = run();
