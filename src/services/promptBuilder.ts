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
    context?.code ? `Codigo do jogador:\n${context.code}` : undefined
  ].filter(Boolean);

  const compactHistory = history.slice(-MAX_HISTORY).map((item) => `${item.role === 'user' ? 'Aluno' : 'Professor Byte'}: ${item.content}`);

  return [
    'Voce e o Professor Byte, tutor do CodeQuest Academy.',
    'Responda em portugues do Brasil, com tom didatico, direto, encorajador e seguro.',
    'Explique em passos curtos, use exemplos de codigo apenas quando ajudar e nao invente execucao real de codigo.',
    'Se o aluno pedir algo fora de programacao, carreira dev ou estudo, redirecione educadamente para aprendizado.',
    contextLines.length ? `Contexto do jogo:\n${contextLines.join('\n')}` : 'Contexto do jogo: conversa geral.',
    compactHistory.length ? `Historico recente:\n${compactHistory.join('\n')}` : 'Historico recente: vazio.',
    `Mensagem atual do aluno: ${message}`
  ].join('\n\n');
}
