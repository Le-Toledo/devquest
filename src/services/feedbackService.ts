import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { AuthUser, FeedbackCategory, FeedbackReport } from '../types/backend';
import { PlayerProfile } from '../types/game';
import { parseArrayOrFallback } from '../utils/jsonStorage';
import { storageKeys } from './storageKeys';
import { supabase } from './supabaseClient';

type SubmitFeedbackInput = {
  category: FeedbackCategory;
  message: string;
  contactEmail?: string;
  user: AuthUser | null;
  profile: PlayerProfile;
};

type FeedbackResult = {
  status: 'synced' | 'local';
  message: string;
  report: FeedbackReport;
};

const feedbackTable = 'feedback_reports';

const createId = () => `feedback-${Date.now()}-${Math.round(Math.random() * 100000)}`;

const friendlyFeedbackError = (message?: string) => {
  const lower = message?.toLowerCase() ?? '';
  if (lower.includes('permission') || lower.includes('policy') || lower.includes('row-level')) return 'A nuvem bloqueou o envio por segurança. O feedback ficou salvo no aparelho.';
  if (lower.includes('relation') || lower.includes('does not exist')) return 'A tabela de feedback ainda não existe no Supabase. O feedback ficou salvo no aparelho.';
  if (lower.includes('network') || lower.includes('fetch')) return 'Sem conexão com a nuvem agora. O feedback ficou salvo no aparelho.';
  return 'Não consegui enviar para a nuvem agora. O feedback ficou salvo no aparelho.';
};

const loadLocalReports = async () => {
  const raw = await AsyncStorage.getItem(storageKeys.feedbackReports);
  return parseArrayOrFallback<FeedbackReport>(raw, []);
};

const saveLocalReport = async (report: FeedbackReport) => {
  const current = await loadLocalReports();
  await AsyncStorage.setItem(storageKeys.feedbackReports, JSON.stringify([report, ...current].slice(0, 30)));
};

const buildReport = ({ category, message, contactEmail, user, profile }: SubmitFeedbackInput): FeedbackReport => ({
  id: createId(),
  category,
  message: message.trim(),
  contactEmail: contactEmail?.trim() || undefined,
  metadata: {
    appVersion: Constants.expoConfig?.version,
    platform: Platform.OS,
    userId: user?.id,
    userEmail: user?.email,
    playerLevel: profile.level,
    playerXp: profile.xp,
    playerCoins: profile.coins
  },
  createdAt: new Date().toISOString()
});

export const feedbackService = {
  async submit(input: SubmitFeedbackInput): Promise<FeedbackResult> {
    const report = buildReport(input);

    if (!supabase || !input.user) {
      await saveLocalReport(report);
      return {
        status: 'local',
        message: 'Feedback salvo no aparelho. Quando a nuvem estiver disponível, você pode enviar novamente.',
        report
      };
    }

    try {
      const { error } = await supabase.from(feedbackTable).insert({
        id: report.id,
        user_id: input.user.id,
        category: report.category,
        message: report.message,
        contact_email: report.contactEmail ?? null,
        app_version: report.metadata.appVersion ?? null,
        platform: report.metadata.platform,
        metadata: report.metadata,
        created_at: report.createdAt
      });

      if (error) {
        await saveLocalReport(report);
        return { status: 'local', message: friendlyFeedbackError(error.message), report };
      }

      const syncedReport = { ...report, syncedAt: new Date().toISOString() };
      return { status: 'synced', message: 'Feedback enviado. Obrigado por ajudar a melhorar o CodeQuest Academy.', report: syncedReport };
    } catch (error) {
      await saveLocalReport(report);
      return {
        status: 'local',
        message: friendlyFeedbackError(error instanceof Error ? error.message : undefined),
        report
      };
    }
  },

  async loadLocalReports() {
    return loadLocalReports();
  }
};
