import { AiTutorContext, AiTutorMessage, AiTutorResponse } from '../types/aiTutor';

const now = () => new Date().toISOString();
const id = () => `byte-${Date.now()}-${Math.round(Math.random() * 10000)}`;

const messageFor = (content: string): AiTutorMessage => ({
  id: id(),
  role: 'assistant',
  content,
  createdAt: now()
});

export const aiMockService = {
  async reply(input: { message: string; context?: AiTutorContext }): Promise<AiTutorResponse> {
    const text = input.message.toLowerCase();
    const context = input.context;

    if (context?.source === 'review' || text.includes('erro')) {
      return {
        mode: 'mock',
        warning: 'Modo Professor Byte offline',
        message: messageFor(
          `Vamos transformar esse erro em aprendizado.\n\n1. Conceito: ${context?.concept ?? 'fundamento de programação'}.\n2. O que revisar: compare sua resposta com a regra principal antes de escolher.\n3. Dica Byte: explique o problema em voz alta, depois elimine as alternativas impossíveis.\n\n${context?.correctAnswer ? `Resposta correta esperada: ${context.correctAnswer}` : 'Quando tiver uma resposta correta, eu comparo com a sua tentativa.'}`
        )
      };
    }

    if (text.includes('kotlin') || text.includes('null safety')) {
      return {
        mode: 'mock',
        warning: 'Modo Professor Byte offline',
        message: messageFor(
          'Null safety em Kotlin evita acessar valores nulos sem checagem.\n\n```kotlin\nvar nome: String? = null\nprintln(nome?.length ?: 0)\n```\n\nUse `?` quando a variável pode ser nula, `?.` para acessar com segurança e `?:` para definir um valor padrão.'
        )
      };
    }

    if (text.includes('desafio') || text.includes('javascript')) {
      return {
        mode: 'mock',
        warning: 'Modo Professor Byte offline',
        message: messageFor(
          'Desafio rápido de JavaScript:\n\nQual será a saída?\n\n```js\nconst pontos = [10, 20, 30];\nconsole.log(pontos.map((p) => p / 10).join("-"));\n```\n\nResponda antes de olhar: a ideia é treinar arrays, `map` e `join`.'
        )
      };
    }

    if (text.includes('codigo') || text.includes('código') || text.includes('analise')) {
      return {
        mode: 'mock',
        warning: 'Modo Professor Byte offline',
        message: messageFor(
          `Posso analisar seu código por leitura. Cole o trecho e eu vou verificar:\n\n1. clareza do nome das variáveis;\n2. possíveis bugs;\n3. oportunidades de simplificar;\n4. um exemplo melhorado.\n\n${context?.code ? `Primeira leitura do trecho: procure entradas nulas, repetição desnecessária e nomes ambiciosos demais.` : 'Envie o código na próxima mensagem.'}`
        )
      };
    }

    if (text.includes('entrevista')) {
      return {
        mode: 'mock',
        warning: 'Modo Professor Byte offline',
        message: messageFor(
          'Treino de entrevista: responda usando Problema, Ação e Resultado.\n\nPergunta: conte sobre uma vez em que você precisou aprender uma tecnologia nova rapidamente.\n\nDica Byte: seja específico, fale do contexto, do que você estudou e do resultado mensurável.'
        )
      };
    }

    return {
      mode: 'mock',
      warning: 'Modo Professor Byte offline',
      message: messageFor(
        'Estou em modo offline, mas ainda posso ajudar. Me diga o conceito, linguagem ou erro que você quer entender e eu respondo como tutor: explicação curta, exemplo e um minidesafio para fixar.'
      )
    };
  }
};
