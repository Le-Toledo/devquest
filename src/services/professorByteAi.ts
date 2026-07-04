import { AiTutorContext } from '../types/aiTutor';
import { storage } from './storage';
import { supabase } from './supabaseClient';

export type ProfessorByteMode = 'hint' | 'explanation' | 'concept' | 'error_help';
export type ProfessorByteSource = 'campaign' | 'academy' | 'arena' | 'professor_byte';

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

const devLog = (message: string, details?: unknown) => {
  if (__DEV__) console.log(`[ProfessorByteAI] ${message}`, details ?? '');
};

const devWarn = (message: string, error?: unknown) => {
  if (__DEV__) console.warn(`[ProfessorByteAI] ${message}`, error);
};

const sourceFromContext = (source?: AiTutorContext['source']): ProfessorByteSource => {
  if (source === 'campaign' || source === 'academy' || source === 'arena') return source;
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
    devLog('Preparando payload');
    const player = await storage.loadPlayer();
    const mode = modeFromContext(message, context);
    return {
      mode,
      source: sourceFromContext(context?.source),
      language: context?.language,
      level: context?.concept,
      question: context?.errorPrompt ?? context?.topic ?? message,
      options: context?.options,
      userAnswer: context?.selectedAnswer,
      correctAnswer: mode === 'hint' ? undefined : context?.correctAnswer,
      lessonTitle: context?.source === 'academy' ? context.topic : undefined,
      lessonContent: context?.source === 'academy' ? context.concept : context?.code,
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
      devLog('Chamando Edge Function professor-byte-ai', { mode: body.mode, source: body.source });
      const { data, error } = await supabase.functions.invoke('professor-byte-ai', {
        body,
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`
        }
      });
      if (error) {
        devWarn('Erro ao chamar IA', error);
        return { answer: PROFESSOR_BYTE_FALLBACK, mode: 'fallback', warning: 'Professor Byte offline' };
      }

      const answer = typeof data?.answer === 'string' ? data.answer.trim() : '';
      if (!answer) {
        devWarn('Resposta sem answer válido', data);
        return { answer: PROFESSOR_BYTE_FALLBACK, mode: 'fallback', warning: 'Professor Byte offline' };
      }

      devLog('Resposta recebida');
      return { answer, mode: 'remote' };
    } catch (error) {
      devWarn('Erro ao chamar IA', error);
      return { answer: PROFESSOR_BYTE_FALLBACK, mode: 'fallback', warning: 'Professor Byte offline' };
    }
  }
};
