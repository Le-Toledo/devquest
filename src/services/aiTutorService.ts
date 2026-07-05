import AsyncStorage from '@react-native-async-storage/async-storage';
import { AiTutorContext, AiTutorMessage, AiTutorResponse } from '../types/aiTutor';
import { parseArrayOrFallback } from '../utils/jsonStorage';
import { aiMockService } from './aiMockService';
import { professorByteAi } from './professorByteAi';
import { storageKeys } from './storageKeys';
import { isSupabaseConfigured } from './supabaseClient';

const now = () => new Date().toISOString();
const id = () => `msg-${Date.now()}-${Math.round(Math.random() * 10000)}`;

const userMessage = (content: string): AiTutorMessage => ({
  id: id(),
  role: 'user',
  content,
  createdAt: now()
});

const assistantMessage = (content: string): AiTutorMessage => ({
  id: id(),
  role: 'assistant',
  content,
  createdAt: now()
});

export const aiTutorService = {
  isRemoteConfigured: isSupabaseConfigured,

  async loadHistory(): Promise<AiTutorMessage[]> {
    const raw = await AsyncStorage.getItem(storageKeys.aiTutorHistory);
    return parseArrayOrFallback<AiTutorMessage>(raw, []);
  },

  async saveHistory(history: AiTutorMessage[]) {
    await AsyncStorage.setItem(storageKeys.aiTutorHistory, JSON.stringify(history.slice(-60)));
  },

  async clearHistory() {
    await AsyncStorage.removeItem(storageKeys.aiTutorHistory);
  },

  createUserMessage: userMessage,

  async ask(input: { message: string; history: AiTutorMessage[]; context?: AiTutorContext }): Promise<AiTutorResponse> {
    try {
      const result = await professorByteAi.ask(input.message, input.context);
      if (result.mode === 'fallback') {
        const fallback = await aiMockService.reply({ message: input.message, context: input.context });
        return {
          ...fallback,
          warning: result.warning ?? fallback.warning,
          message: assistantMessage(fallback.message.content || result.answer)
        };
      }

      return {
        mode: 'remote',
        message: assistantMessage(result.answer)
      };
    } catch {
        return aiMockService.reply({ message: input.message, context: input.context });
    }
  }
};
