import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { AppRoute } from '../src/navigation/routes';
import { hiddenCommercialFeatures, releaseConfig } from '../src/services/releaseConfig';

async function run() {
  assert.equal(releaseConfig.commercialFeaturesEnabled, false, 'Recursos comerciais incompletos devem ficar ocultos no Release Candidate.');
  assert(hiddenCommercialFeatures.includes('Tela Premium'), 'Lista de recursos ocultos deve documentar Premium.');

  const premiumScreen = readFileSync('src/screens/PremiumScreen.tsx', 'utf8');
  assert(premiumScreen.includes('Nenhum pagamento real está ativo'), 'Tela Premium preservada deve ser transparente se for acessada internamente.');

  const homeDashboard = readFileSync('src/components/HomeDashboard.tsx', 'utf8');
  assert(homeDashboard.includes('commercialFeaturesEnabled'), 'Hub deve respeitar feature flag comercial.');

  const shopScreen = readFileSync('src/screens/ShopScreen.tsx', 'utf8');
  assert(shopScreen.includes('filter((item) => !item.premium)'), 'Loja deve ocultar itens premium incompletos em produção.');

  const professorByteScreen = readFileSync('src/screens/ProfessorByteScreen.tsx', 'utf8');
  assert(professorByteScreen.includes('Respostas de IA podem conter erros'), 'Professor Byte deve avisar que IA pode errar.');
  assert(professorByteScreen.includes('Reportar resposta ruim'), 'Professor Byte deve permitir reportar resposta ruim.');

  const feedbackRoute: AppRoute = { name: 'feedback' };
  const premiumRoute: AppRoute = { name: 'premium' };
  const codeLabRoute: AppRoute = { name: 'codeLab' };
  assert.equal(feedbackRoute.name, 'feedback', 'Rota Feedback deve continuar tipada.');
  assert.equal(premiumRoute.name, 'premium', 'Rota Premium pode permanecer registrada para integração futura.');
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
