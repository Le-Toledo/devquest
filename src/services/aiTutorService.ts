import AsyncStorage from '@react-native-async-storage/async-storage';
import { AiTutorContext, AiTutorMessage, AiTutorResponse } from '../types/aiTutor';
import { parseArrayOrFallback } from '../utils/jsonStorage';
import { aiMockService } from './aiMockService';
import { buildProfessorBytePrompt } from './promptBuilder';
import { storageKeys } from './storageKeys';

const endpoint = process.env.EXPO_PUBLIC_AI_TUTOR_ENDPOINT;
const isEndpointConfigured = Boolean(endpoint && endpoint.startsWith('https://'));
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
  isRemoteConfigured: isEndpointConfigured,

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
    if (!isEndpointConfigured || !endpoint) {
      return aiMockService.reply({ message: input.message, context: input.context });
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input.message,
          prompt: buildProfessorBytePrompt(input.message, input.history, input.context),
          history: input.history.slice(-8),
          context: input.context
        })
      });

      if (!response.ok) {
        return aiMockService.reply({ message: input.message, context: input.context });
      }

      const data = (await response.json()) as { answer?: string; message?: string };
      const content = data.answer ?? data.message;
      if (!content) {
        return aiMockService.reply({ message: input.message, context: input.context });
      }

      return {
        mode: 'remote',
        message: assistantMessage(content)
      };
    } catch {
      return aiMockService.reply({ message: input.message, context: input.context });
    }
  }
};
