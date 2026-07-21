import { AiTutorContext } from '../types/aiTutor';
import { sanitizeProfessorByteList, sanitizeProfessorByteText } from './professorByteContext';
import { storage } from './storage';
import { supabase } from './supabaseClient';

export type ProfessorByteMode = 'hint' | 'explanation' | 'concept' | 'error_help';
export type ProfessorByteSource = 'campaign' | 'academy' | 'arena' | 'codeLab' | 'review' | 'professor_byte';

export type ProfessorBytePayload = {
  mode: ProfessorByteMode;
  source: ProfessorByteSource;
  language?: string;
  level?: string;
  question?: string;
  options?: string[];
  userAnswer?: string;
  correctAnswer?: string;
  lessonTitle?: string;
  lessonContent?: string;
  failedValidations?: string[];
  userProgress?: {
    level?: number;
    xp?: number;
    completedMissions?: number;
    streak?: number;
  };
};

export type ProfessorByteResult = {
  answer: string;
  mode: 'remote' | 'fallback';
  warning?: string;
};

export const PROFESSOR_BYTE_FALLBACK =
  'Não consegui acessar o Professor Byte agora, mas aqui vai uma dica: leia a pergunta com calma, identifique o conceito principal e elimine as alternativas que não fazem sentido.';

const devWarn = (message: string) => {
  if (__DEV__) console.warn(`[ProfessorByteAI] ${message}`);
};

const sourceFromContext = (source?: AiTutorContext['source']): ProfessorByteSource => {
  if (source === 'campaign' || source === 'academy' || source === 'arena' || source === 'codeLab' || source === 'review') return source;
  return 'professor_byte';
};

const modeFromContext = (message: string, context?: AiTutorContext): ProfessorByteMode => {
  if (context?.aiMode) return context.aiMode;
  const text = message.toLowerCase();
  if (context?.correctAnswer || context?.selectedAnswer) return 'error_help';
  if (text.includes('dica') || text.includes('ajuda')) return 'hint';
  if (text.includes('erro') || context?.errorPrompt) return 'error_help';
  if (text.includes('explique') || text.includes('por que')) return 'explanation';
  return 'concept';
};

export const professorByteAi = {
  async buildPayload(message: string, context?: AiTutorContext): Promise<ProfessorBytePayload> {
    const player = await storage.loadPlayer();
    const mode = modeFromContext(message, context);
    return {
      mode,
      source: sourceFromContext(context?.source),
      language: sanitizeProfessorByteText(context?.language, 80),
      level: sanitizeProfessorByteText(context?.concept, 120),
      question: sanitizeProfessorByteText(context?.errorPrompt ?? context?.challengePrompt ?? context?.topic ?? message),
      options: sanitizeProfessorByteList(context?.options),
      userAnswer: sanitizeProfessorByteText(context?.selectedAnswer, 700),
      correctAnswer: mode === 'hint' ? undefined : sanitizeProfessorByteText(context?.correctAnswer, 700),
      lessonTitle: sanitizeProfessorByteText(context?.topic, 160),
      lessonContent: sanitizeProfessorByteText(context?.source === 'academy' ? context.concept : context?.code, 2200),
      failedValidations: sanitizeProfessorByteList(context?.failedValidations, 5),
      userProgress: {
        level: player.level,
        xp: player.xp,
        completedMissions: Object.keys(player.completedStages).length + (player.stats?.campaignMissionsCompleted ?? 0),
        streak: player.streak
      }
    };
  },

  async ask(message: string, context?: AiTutorContext): Promise<ProfessorByteResult> {
    if (!supabase) {
      devWarn('Supabase não configurado; usando fallback');
      return { answer: PROFESSOR_BYTE_FALLBACK, mode: 'fallback', warning: 'Professor Byte offline' };
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        devWarn('Sessão ausente; Edge Function não será chamada');
        return { answer: PROFESSOR_BYTE_FALLBACK, mode: 'fallback', warning: 'Entre na conta para usar a IA real.' };
      }

      const body = await this.buildPayload(message, context);
      const { data, error } = await supabase.functions.invoke('professor-byte-ai', {
        body,
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`
        }
      });
      if (error) {
        devWarn('Erro ao chamar IA');
        return { answer: PROFESSOR_BYTE_FALLBACK, mode: 'fallback', warning: 'Professor Byte offline' };
      }

      const answer = typeof data?.answer === 'string' ? data.answer.trim() : '';
      if (!answer) {
        devWarn('Resposta sem answer válido');
        return { answer: PROFESSOR_BYTE_FALLBACK, mode: 'fallback', warning: 'Professor Byte offline' };
      }

      return { answer, mode: 'remote' };
    } catch {
      devWarn('Erro ao chamar IA');
      return { answer: PROFESSOR_BYTE_FALLBACK, mode: 'fallback', warning: 'Professor Byte offline' };
    }
  }
};
