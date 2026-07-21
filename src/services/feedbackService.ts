import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FeedbackCategoryMapping,
  FeedbackVisualCategory,
  LocalFeedbackReport,
  SaveLocalFeedbackInput
} from '../types/feedback';
import { storageKeys } from './storageKeys';

export const feedbackSchemaVersion = 1;
export const feedbackQueueLimit = 50;
export const feedbackMinMessageLength = 10;
export const feedbackMaxMessageLength = 1500;
export const feedbackLocalSavedMessage = 'Feedback salvo neste aparelho. O envio online será disponibilizado em uma próxima atualização.';

const validPersistedCategories = ['bug', 'idea', 'content', 'ux', 'other'] as const;
const validVisualCategories: FeedbackVisualCategory[] = [
  'bug_report',
  'confusing_content',
  'bad_professor_byte_response',
  'visual_issue',
  'suggestion',
  'other'
];

const createFeedbackId = (createdAt = new Date()) =>
  `local-feedback-${createdAt.getTime()}-${Math.round(Math.random() * 100000)}`;

const cleanOptionalText = (value?: string) => {
  const clean = value?.trim();
  return clean || undefined;
};

export const sanitizeFeedbackText = (value: string) =>
  value
    .replace(/```[\s\S]*?```/g, '[trecho de código removido]')
    .replace(/\b(?:senha|password|token|secret|chave|api[_\s-]?key)\s*[:=]\s*["']?[^\s"']+/gi, '[dado sensível removido]')
    .replace(/\bsk-[A-Za-z0-9_-]{8,}\b/g, '[chave removida]')
    .trim();

const isPlainRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const isIsoDate = (value: unknown) => typeof value === 'string' && !Number.isNaN(new Date(value).getTime());

const isValidReport = (value: unknown): value is LocalFeedbackReport => {
  if (!isPlainRecord(value)) return false;
  if (typeof value.id !== 'string' || !value.id.trim()) return false;
  if (!validPersistedCategories.includes(value.category as LocalFeedbackReport['category'])) return false;
  if (typeof value.message !== 'string') return false;
  const messageLength = value.message.trim().length;
  if (messageLength < feedbackMinMessageLength || messageLength > feedbackMaxMessageLength) return false;
  if (typeof value.platform !== 'string' || !value.platform.trim()) return false;
  if (!isIsoDate(value.createdAt)) return false;
  if (value.status !== 'pending') return false;
  if (value.schemaVersion !== feedbackSchemaVersion) return false;
  if (!isPlainRecord(value.metadata)) return false;
  if (value.metadata.source !== 'feedback_center') return false;
  if (!validVisualCategories.includes(value.metadata.visualCategory as FeedbackVisualCategory)) return false;
  return true;
};

export const mapFeedbackCategory = (visualCategory: FeedbackVisualCategory): FeedbackCategoryMapping => {
  if (visualCategory === 'bug_report') return { category: 'bug' };
  if (visualCategory === 'confusing_content') return { category: 'content' };
  if (visualCategory === 'bad_professor_byte_response') return { category: 'content', subcategory: 'professor_byte' };
  if (visualCategory === 'visual_issue') return { category: 'ux' };
  if (visualCategory === 'suggestion') return { category: 'idea' };
  return { category: 'other' };
};

export const validateFeedbackMessage = (message: string) => {
  const length = message.trim().length;
  if (!length) return 'Descreva o problema ou sugestão antes de salvar.';
  if (length < feedbackMinMessageLength) return `Escreva pelo menos ${feedbackMinMessageLength} caracteres.`;
  if (length > feedbackMaxMessageLength) return `Use até ${feedbackMaxMessageLength} caracteres.`;
  return '';
};

export const isDuplicateFeedbackTap = (lastSubmittedAt: number, now = Date.now()) =>
  lastSubmittedAt > 0 && now - lastSubmittedAt < 700;

export const normalizeLocalFeedbackQueue = (value: unknown): LocalFeedbackReport[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isValidReport)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, feedbackQueueLimit);
};

export const buildLocalFeedbackReport = (input: SaveLocalFeedbackInput, createdAt = new Date()): LocalFeedbackReport => {
  const mapping = mapFeedbackCategory(input.visualCategory);
  return {
    id: createFeedbackId(createdAt),
    category: mapping.category,
    subcategory: mapping.subcategory,
    message: sanitizeFeedbackText(input.message),
    screen: cleanOptionalText(input.screen),
    appVersion: cleanOptionalText(input.appVersion),
    platform: input.platform,
    createdAt: createdAt.toISOString(),
    status: 'pending',
    metadata: {
      source: 'feedback_center',
      visualCategory: input.visualCategory
    },
    schemaVersion: feedbackSchemaVersion
  };
};

const parseQueue = (raw: string | null) => {
  if (!raw) return [];
  try {
    return normalizeLocalFeedbackQueue(JSON.parse(raw));
  } catch {
    return [];
  }
};

export const feedbackService = {
  async loadLocalReports(): Promise<LocalFeedbackReport[]> {
    const raw = await AsyncStorage.getItem(storageKeys.feedbackReports);
    return parseQueue(raw);
  },

  async saveLocalFeedback(input: SaveLocalFeedbackInput): Promise<{ report: LocalFeedbackReport; queueSize: number; message: string }> {
    const validationError = validateFeedbackMessage(input.message);
    if (validationError) throw new Error(validationError);

    const current = await this.loadLocalReports();
    const report = buildLocalFeedbackReport(input);
    const nextQueue = normalizeLocalFeedbackQueue([report, ...current]);
    await AsyncStorage.setItem(storageKeys.feedbackReports, JSON.stringify(nextQueue));
    return { report, queueSize: nextQueue.length, message: feedbackLocalSavedMessage };
  }
};
