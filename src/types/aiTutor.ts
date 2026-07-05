export type AiTutorMode = 'mock' | 'remote';

export interface AiTutorMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface AiTutorContext {
  source?: 'general' | 'review' | 'arena' | 'academy' | 'campaign';
  aiMode?: 'hint' | 'explanation' | 'concept' | 'error_help';
  topic?: string;
  language?: string;
  concept?: string;
  code?: string;
  options?: string[];
  errorPrompt?: string;
  selectedAnswer?: string;
  correctAnswer?: string;
}

export interface AiTutorRequest {
  message: string;
  history: AiTutorMessage[];
  context?: AiTutorContext;
}

export interface AiTutorResponse {
  message: AiTutorMessage;
  mode: AiTutorMode;
  warning?: string;
}
