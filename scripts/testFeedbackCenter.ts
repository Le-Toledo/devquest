import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppRoute } from '../src/navigation/routes';
import {
  buildLocalFeedbackReport,
  feedbackMaxMessageLength,
  feedbackQueueLimit,
  feedbackSchemaVersion,
  feedbackService,
  isDuplicateFeedbackTap,
  mapFeedbackCategory,
  normalizeLocalFeedbackQueue,
  sanitizeFeedbackText,
  validateFeedbackMessage
} from '../src/services/feedbackService';
import { storageKeys } from '../src/services/storageKeys';

type StorageMethods = Pick<typeof AsyncStorage, 'getItem' | 'setItem' | 'removeItem'>;

const storage = AsyncStorage as typeof AsyncStorage & StorageMethods;
const originalGetItem = storage.getItem.bind(storage);
const originalSetItem = storage.setItem.bind(storage);
const originalRemoveItem = storage.removeItem.bind(storage);
const memory = new Map<string, string>();
let failSetItem = false;

storage.getItem = async (key: string) => memory.get(key) ?? null;
storage.setItem = async (key: string, value: string) => {
  if (failSetItem) throw new Error('AsyncStorage indisponível');
  memory.set(key, value);
};
storage.removeItem = async (key: string) => {
  memory.delete(key);
};

const resetStorage = () => {
  failSetItem = false;
  memory.clear();
};

const validInput = {
  visualCategory: 'bug_report' as const,
  message: 'O botão de continuar não respondeu na tela de campanha.',
  screen: 'Campanha',
  appVersion: '1.0.0',
  platform: 'ios'
};

async function run() {
  assert.deepEqual(mapFeedbackCategory('bug_report'), { category: 'bug' }, 'Bug visual deve persistir como bug.');
  assert.deepEqual(mapFeedbackCategory('confusing_content'), { category: 'content' }, 'Conteúdo confuso deve persistir como content.');
  assert.deepEqual(mapFeedbackCategory('bad_professor_byte_response'), { category: 'content', subcategory: 'professor_byte' }, 'Professor Byte deve usar subcategoria própria.');
  assert.deepEqual(mapFeedbackCategory('visual_issue'), { category: 'ux' }, 'Problema visual deve persistir como ux.');
  assert.deepEqual(mapFeedbackCategory('suggestion'), { category: 'idea' }, 'Sugestão deve persistir como idea.');
  assert.deepEqual(mapFeedbackCategory('other'), { category: 'other' }, 'Outro deve persistir como other.');

  assert(validateFeedbackMessage(''), 'Mensagem vazia deve ser rejeitada.');
  assert(validateFeedbackMessage('curta'), 'Mensagem abaixo do mínimo deve ser rejeitada.');
  assert(validateFeedbackMessage('x'.repeat(feedbackMaxMessageLength + 1)), 'Mensagem acima do máximo deve ser rejeitada.');
  assert.equal(validateFeedbackMessage(validInput.message), '', 'Mensagem válida deve passar na validação.');

  const report = buildLocalFeedbackReport(validInput, new Date('2026-07-17T12:00:00.000Z'));
  assert(report.id.startsWith('local-feedback-'), 'Feedback deve gerar ID local.');
  assert.equal(report.status, 'pending', 'Feedback local deve ficar pendente.');
  assert.equal(report.schemaVersion, feedbackSchemaVersion, 'Feedback deve armazenar schemaVersion.');
  assert.equal(report.category, 'bug', 'Feedback válido deve mapear categoria persistida.');
  assert.equal(report.screen, 'Campanha', 'Tela opcional deve ser preservada.');
  assert.equal(report.metadata.source, 'feedback_center', 'Metadata deve identificar origem segura.');
  assert(!('email' in report), 'Feedback local não deve armazenar e-mail.');
  assert(!('user' in report), 'Feedback local não deve armazenar objeto de usuário.');

  const sanitized = sanitizeFeedbackText('senha=123456 token:abc123 sk-segredoreal123456\n```const segredo = true;```');
  assert(!sanitized.includes('123456'), 'Senha deve ser removida do texto.');
  assert(!sanitized.includes('abc123'), 'Token deve ser removido do texto.');
  assert(!sanitized.includes('sk-segredoreal123456'), 'Chave deve ser removida do texto.');
  assert(!sanitized.includes('const segredo'), 'Bloco de código deve ser removido do texto.');

  resetStorage();
  const saved = await feedbackService.saveLocalFeedback(validInput);
  assert.equal(saved.queueSize, 1, 'Feedback válido deve ser salvo.');
  assert.equal(saved.report.status, 'pending', 'Feedback salvo deve permanecer pendente localmente.');
  const loaded = await feedbackService.loadLocalReports();
  assert.equal(loaded.length, 1, 'Feedback salvo deve ser carregado do AsyncStorage.');
  assert.equal(loaded[0].message, validInput.message, 'Mensagem válida deve ser preservada.');

  await assert.rejects(
    () => feedbackService.saveLocalFeedback({ ...validInput, message: '' }),
    /Descreva/,
    'Service deve rejeitar mensagem vazia.'
  );
  await assert.rejects(
    () => feedbackService.saveLocalFeedback({ ...validInput, message: 'curta' }),
    /pelo menos/,
    'Service deve respeitar tamanho mínimo.'
  );
  await assert.rejects(
    () => feedbackService.saveLocalFeedback({ ...validInput, message: 'x'.repeat(feedbackMaxMessageLength + 1) }),
    /até/,
    'Service deve respeitar tamanho máximo.'
  );

  const manyReports = Array.from({ length: 55 }, (_, index) =>
    buildLocalFeedbackReport(
      { ...validInput, message: `Mensagem válida número ${index} para testar limite.` },
      new Date(Date.UTC(2026, 0, 1, 0, 0, index))
    )
  );
  const limitedQueue = normalizeLocalFeedbackQueue(manyReports);
  assert.equal(limitedQueue.length, feedbackQueueLimit, 'Fila local deve ser limitada a 50 registros.');
  assert.equal(limitedQueue[0].message, 'Mensagem válida número 54 para testar limite.', 'Registro mais novo deve ser mantido.');
  assert(!limitedQueue.some((item) => item.message.includes('número 0 ')), 'Registros mais antigos devem sair quando ultrapassar o limite.');

  resetStorage();
  memory.set(storageKeys.feedbackReports, '{json quebrado');
  assert.deepEqual(await feedbackService.loadLocalReports(), [], 'JSON corrompido não deve derrubar o app.');

  resetStorage();
  failSetItem = true;
  const preservedInput = { ...validInput, message: 'Texto que precisa continuar disponível em caso de erro.' };
  await assert.rejects(() => feedbackService.saveLocalFeedback(preservedInput), /AsyncStorage indisponível/, 'Falha de AsyncStorage deve ser propagada para a UI preservar o texto.');
  assert.equal(preservedInput.message, 'Texto que precisa continuar disponível em caso de erro.', 'Entrada não deve ser mutada quando salvar falha.');

  assert.equal(isDuplicateFeedbackTap(1000, 1300), true, 'Toque repetido em menos de 700ms deve ser bloqueado.');
  assert.equal(isDuplicateFeedbackTap(1000, 1900), false, 'Toque após janela de proteção deve ser permitido.');

  const feedbackRoute: AppRoute = { name: 'feedback' };
  const codeLabRoute: AppRoute = { name: 'codeLabChallenge', challengeId: 'lab-js-array-map', returnTo: { name: 'codeLab' } };
  const journeyRoute: AppRoute = { name: 'reviewLab' };
  assert.equal(feedbackRoute.name, 'feedback', 'Rota feedback deve ser reconhecida.');
  assert.equal(codeLabRoute.name, 'codeLabChallenge', 'Rotas existentes do Code Lab devem continuar tipadas.');
  assert.equal(journeyRoute.name, 'reviewLab', 'Rota existente da Jornada/Revisão deve continuar tipada.');

  const feedbackServiceSource = readFileSync('src/services/feedbackService.ts', 'utf8');
  assert(!feedbackServiceSource.includes('supabase'), 'Feedback local não deve importar ou chamar Supabase nesta etapa.');
  assert(!feedbackServiceSource.includes('feedback_reports'), 'Feedback local não deve referenciar tabela remota nesta etapa.');

  storage.getItem = originalGetItem;
  storage.setItem = originalSetItem;
  storage.removeItem = originalRemoveItem;

  console.log('Feedback Center local tests OK');
}

export const feedbackCenterTests = run().catch((error: unknown) => {
  storage.getItem = originalGetItem;
  storage.setItem = originalSetItem;
  storage.removeItem = originalRemoveItem;
  throw error;
});
