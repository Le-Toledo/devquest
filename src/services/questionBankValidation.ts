import { Question } from '../types/game';
import { seededShuffle } from '../utils/shuffle';

export type QuestionAuditSeverity = 'error' | 'warning';

export type QuestionAuditIssue = {
  questionId: string;
  language?: string;
  module?: string;
  topic?: string;
  type: string;
  severity: QuestionAuditSeverity;
  message: string;
  suggestion: string;
};

export type QuestionAuditResult = {
  total: number;
  issues: QuestionAuditIssue[];
  errors: QuestionAuditIssue[];
  warnings: QuestionAuditIssue[];
};

const normalize = (value = '') =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const issueFor = (
  question: Partial<Question>,
  type: string,
  severity: QuestionAuditSeverity,
  message: string,
  suggestion: string
): QuestionAuditIssue => ({
  questionId: question.id || '(sem-id)',
  language: question.language ?? question.areaId,
  module: question.module,
  topic: question.topic,
  type,
  severity,
  message,
  suggestion
});

const hasAny = (value: string, terms: string[]) => terms.some((term) => value.includes(term));

const fillCodeAnswerLooksLikeCode = (answer: string) => /^[\w$.[\]'"`<>/:?&=+\-{}()]+$/.test(normalize(answer));

const semanticRules: {
  name: string;
  matches: (question: Question, haystack: string) => boolean;
  isValid: (question: Question, haystack: string, answer: string) => boolean;
  suggestion: string;
}[] = [
  {
    name: 'react-use-state',
    matches: (question) => {
      const code = normalize(question.code);
      return question.areaId === 'react' && (code.includes('usestate') || /const\s*\[.*set.*\]\s*=/.test(code));
    },
    isValid: (question, _haystack, answer) => {
      const semanticText = normalize([question.prompt, question.explanation, question.hint, question.topic, question.objective].join(' '));
      return answer === 'usestate' && hasAny(semanticText, ['estado', 'hook']);
    },
    suggestion: 'Mantenha useState ligado a estado local, Hook e atualização de UI.'
  },
  {
    name: 'react-use-effect',
    matches: (question) => {
      const code = normalize(question.code);
      return question.areaId === 'react' && (code.includes('useeffect') || code.includes('document.title') || code.includes('}, ['));
    },
    isValid: (question, _haystack, answer) => {
      const semanticText = normalize([question.prompt, question.explanation, question.hint, question.topic, question.objective].join(' '));
      return answer === 'useeffect' && hasAny(semanticText, ['efeito', 'effect', 'sincronizar', 'dependencia', 'externo']);
    },
    suggestion: 'Mantenha useEffect ligado a efeitos, dependências e sincronização externa.'
  },
  {
    name: 'react-props',
    matches: (question, haystack) => question.areaId === 'react' && haystack.includes('props'),
    isValid: (_question, haystack) => hasAny(haystack, ['propriedade', 'props', 'entrada', 'componente']),
    suggestion: 'Quando o código usa props, enunciado e explicação precisam falar de entradas do componente.'
  },
  {
    name: 'array-map',
    matches: (_question, haystack) => haystack.includes('.map('),
    isValid: (_question, haystack, answer) =>
      answer === 'map' && hasAny(haystack, ['transform', 'lista', 'array', 'render']),
    suggestion: 'Quando o código usa .map, a resposta deve tratar transformação de listas.'
  },
  {
    name: 'array-filter',
    matches: (_question, haystack) => haystack.includes('.filter('),
    isValid: (_question, haystack, answer) =>
      answer === 'filter' && hasAny(haystack, ['filtr', 'manter', 'condicao', 'lista', 'array']),
    suggestion: 'Quando o código usa .filter, a resposta deve tratar filtragem por condição.'
  },
  {
    name: 'fetch',
    matches: (_question, haystack) => haystack.includes('fetch('),
    isValid: (_question, haystack) => hasAny(haystack, ['http', 'api', 'promise', 'resposta', 'requisicao', 'rede']),
    suggestion: 'fetch deve aparecer com API, HTTP, Promise ou tratamento de resposta.'
  },
  {
    name: 'async-await',
    matches: (_question, haystack) => /\basync\b|\bawait\b/.test(haystack),
    isValid: (_question, haystack) => hasAny(haystack, ['assincron', 'promise', 'await', 'async', 'task']),
    suggestion: 'async/await deve tratar assincronismo, Promise/Task ou fluxo assíncrono.'
  },
  {
    name: 'typescript-types',
    matches: (question, haystack) => question.areaId === 'typescript' && /\binterface\b|\btype\b/.test(haystack),
    isValid: (_question, haystack) => hasAny(haystack, ['tipo', 'contrato', 'interface', 'payload', 'compilador']),
    suggestion: 'interface/type em TypeScript deve tratar tipagem ou contratos.'
  }
];

export const validateQuestion = (question: Question): QuestionAuditIssue[] => {
  const issues: QuestionAuditIssue[] = [];
  const optionTexts = question.options.map(normalize);
  const optionIds = question.optionIds ?? [];
  const correctAnswer = question.options[question.correctIndex] ?? '';
  const correctAnswerId = optionIds[question.correctIndex] ?? '';
  const haystack = normalize([
    question.prompt,
    question.code,
    question.explanation,
    question.hint,
    question.topic,
    question.objective,
    question.tags.join(' '),
    correctAnswer
  ].join(' '));

  if (!question.id) issues.push(issueFor(question, 'missing-id', 'error', 'ID ausente.', 'Informe um ID estavel para a pergunta.'));
  if (!question.language) issues.push(issueFor(question, 'missing-language', 'error', 'Linguagem ausente.', 'Informe language com a mesma area da pergunta.'));
  if (!question.topic) issues.push(issueFor(question, 'missing-topic', 'error', 'Topico ausente.', 'Informe o conceito central da pergunta.'));
  if (!question.prompt?.trim()) issues.push(issueFor(question, 'empty-prompt', 'error', 'Enunciado vazio.', 'Escreva um enunciado completo.'));
  if (!question.explanation?.trim()) issues.push(issueFor(question, 'empty-explanation', 'error', 'Explicacao vazia.', 'Explique por que a resposta correta resolve o caso.'));
  if (!Array.isArray(question.options) || question.options.length < 2) issues.push(issueFor(question, 'few-options', 'error', 'Menos de duas alternativas.', 'Forneca alternativas suficientes para escolha.'));
  if (new Set(optionTexts).size !== optionTexts.length) issues.push(issueFor(question, 'duplicated-options', 'error', 'Alternativas duplicadas.', 'Remova alternativas repetidas.'));
  if (optionIds.length !== question.options.length) issues.push(issueFor(question, 'missing-option-ids', 'error', 'IDs de alternativas ausentes ou incompletos.', 'Mantenha um ID estavel para cada alternativa.'));
  if (new Set(optionIds).size !== optionIds.length) issues.push(issueFor(question, 'duplicated-option-ids', 'error', 'IDs de alternativas duplicados.', 'Use IDs unicos por alternativa.'));
  if (question.correctIndex < 0 || question.correctIndex >= question.options.length) issues.push(issueFor(question, 'invalid-correct-index', 'error', 'Indice correto fora das alternativas.', 'Aponte para uma alternativa existente.'));
  if (!question.correctAnswerId) issues.push(issueFor(question, 'missing-correct-answer-id', 'error', 'correctAnswerId ausente.', 'Informe o ID estavel da resposta correta.'));
  if (question.correctAnswerId && !optionIds.includes(question.correctAnswerId)) issues.push(issueFor(question, 'correct-answer-id-not-found', 'error', 'correctAnswerId nao corresponde a nenhuma alternativa.', 'Use um ID existente em optionIds.'));
  if (question.correctAnswerId && correctAnswerId && question.correctAnswerId !== correctAnswerId) issues.push(issueFor(question, 'correct-index-id-mismatch', 'error', 'correctIndex aponta para alternativa diferente de correctAnswerId.', 'Recalcule correctIndex apos qualquer shuffle.'));

  if (question.kind === 'complete-code') {
    if (!question.code?.trim()) issues.push(issueFor(question, 'missing-code', 'error', 'Complete-code sem codigo.', 'Forneca um trecho com lacuna.'));
    if (question.code && !question.code.includes('____')) issues.push(issueFor(question, 'missing-code-blank', 'error', 'Complete-code sem lacuna ____.', 'Inclua exatamente a lacuna que sera preenchida.'));
    if (correctAnswer && !fillCodeAnswerLooksLikeCode(correctAnswer)) issues.push(issueFor(question, 'fill-answer-not-code', 'error', 'Resposta de lacuna nao parece codigo.', 'Use identificador, operador, palavra-chave ou trecho curto que substitua a lacuna.'));
    if (question.code?.includes('____') && !question.explanation.includes(correctAnswer)) issues.push(issueFor(question, 'explanation-without-answer', 'error', 'Explicacao nao menciona a resposta correta.', 'Mostre a resposta correta na explicacao.'));
  }

  if (question.kind !== 'complete-code' && question.code?.includes('____')) {
    issues.push(issueFor(question, 'blank-outside-fill-code', 'error', 'Codigo com lacuna fora de complete-code.', 'Remova a lacuna ou transforme a pergunta em complete-code.'));
  }

  semanticRules.forEach((rule) => {
    if (rule.matches(question, haystack) && !rule.isValid(question, haystack, normalize(correctAnswer))) {
      issues.push(issueFor(question, `semantic-${rule.name}`, 'error', `Incompatibilidade semantica detectada pela regra ${rule.name}.`, rule.suggestion));
    }
  });

  return issues;
};

export const validateQuestionBank = (items: Question[]): QuestionAuditResult => {
  const issues = items.flatMap(validateQuestion);
  const ids = new Map<string, number>();
  const prompts = new Map<string, string[]>();

  items.forEach((question) => {
    ids.set(question.id, (ids.get(question.id) ?? 0) + 1);
    const prompt = normalize(question.prompt);
    prompts.set(prompt, [...(prompts.get(prompt) ?? []), question.id]);
  });

  ids.forEach((count, id) => {
    if (count > 1) {
      issues.push({
        questionId: id,
        type: 'duplicated-question-id',
        severity: 'error',
        message: `ID duplicado em ${count} perguntas.`,
        suggestion: 'Preserve IDs existentes, mas cada pergunta precisa ter um ID unico.'
      });
    }
  });

  prompts.forEach((questionIds, prompt) => {
    if (prompt && questionIds.length > 1) {
      issues.push({
        questionId: questionIds.join(', '),
        type: 'duplicated-prompt',
        severity: 'warning',
        message: 'Enunciado duplicado ou quase identico.',
        suggestion: 'Varie o contexto ou consolide perguntas redundantes.'
      });
    }
  });

  return {
    total: items.length,
    issues,
    errors: issues.filter((issue) => issue.severity === 'error'),
    warnings: issues.filter((issue) => issue.severity === 'warning')
  };
};

export const filterValidQuestions = (items: Question[], source = 'src/data/questions.ts') => {
  const result = validateQuestionBank(items);
  if (result.errors.length) {
    const message = result.errors
      .slice(0, 20)
      .map((issue) => `${issue.questionId} [${source}] ${issue.type}: ${issue.message}`)
      .join('\n');
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.error(`[QuestionBank] Perguntas invalidas detectadas:\n${message}`);
    }
  }
  return items.filter((question) => validateQuestion(question).every((issue) => issue.severity !== 'error'));
};

export const shuffleQuestionOptions = (question: Question, seed: string): Question => {
  const paired = question.options.map((option, index) => ({
    option,
    optionId: question.optionIds[index] ?? `${question.id}:option-${index}`,
    correct: (question.optionIds[index] ?? '') === question.correctAnswerId || index === question.correctIndex
  }));
  const shuffled = seededShuffle(paired, seed);
  const correctIndex = shuffled.findIndex((item) => item.optionId === question.correctAnswerId || item.correct);
  return {
    ...question,
    options: shuffled.map((item) => item.option),
    optionIds: shuffled.map((item) => item.optionId),
    correctIndex: Math.max(0, correctIndex)
  };
};
