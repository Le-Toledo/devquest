import { AiTutorContext, AiTutorMessage } from '../types/aiTutor';

const MAX_HISTORY = 8;

export function buildProfessorBytePrompt(message: string, history: AiTutorMessage[], context?: AiTutorContext) {
  const contextLines = [
    context?.source ? `Origem: ${context.source}` : undefined,
    context?.topic ? `Topico: ${context.topic}` : undefined,
    context?.language ? `Linguagem: ${context.language}` : undefined,
    context?.concept ? `Conceito: ${context.concept}` : undefined,
    context?.errorPrompt ? `Erro/pergunta: ${context.errorPrompt}` : undefined,
    context?.selectedAnswer ? `Resposta do jogador: ${context.selectedAnswer}` : undefined,
    context?.correctAnswer ? `Resposta correta: ${context.correctAnswer}` : undefined,
    context?.code ? `Código do jogador:\n${context.code}` : undefined
  ].filter(Boolean);

  const compactHistory = history.slice(-MAX_HISTORY).map((item) => `${item.role === 'user' ? 'Aluno' : 'Professor Byte'}: ${item.content}`);

  return [
    'Você é o Professor Byte, tutor do Code Quest.',
    'Responda em portugues do Brasil, com tom didatico, direto, encorajador e seguro.',
    'Explique em passos curtos, use exemplos de código apenas quando ajudar e não invente execução real de código.',
    'Se o aluno pedir algo fora de programacao, carreira dev ou estudo, redirecione educadamente para aprendizado.',
    contextLines.length ? `Contexto do jogo:\n${contextLines.join('\n')}` : 'Contexto do jogo: conversa geral.',
    compactHistory.length ? `Histórico recente:\n${compactHistory.join('\n')}` : 'Histórico recente: vazio.',
    `Mensagem atual do aluno: ${message}`
  ].join('\n\n');
}
