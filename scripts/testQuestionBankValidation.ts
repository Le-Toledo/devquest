import assert from 'node:assert/strict';
import { questions } from '../src/data/questions';
import { shuffleQuestionOptions, validateQuestion, validateQuestionBank } from '../src/services/questionBankValidation';
import { Question } from '../src/types/game';

const fixedReactQuestion = questions.find((question) => question.id === 'frontend-react-props-002');
assert(fixedReactQuestion, 'Questao React reportada deve continuar existindo com o mesmo ID.');
assert.equal(fixedReactQuestion.correctAnswerId, `${fixedReactQuestion.id}:correct`, 'Questao corrigida deve usar correctAnswerId estavel.');
assert.equal(fixedReactQuestion.options[fixedReactQuestion.correctIndex], 'useState', 'Questao corrigida deve ter useState como resposta.');
assert(fixedReactQuestion.prompt.includes('estado local'), 'Enunciado corrigido deve tratar estado local.');
assert(fixedReactQuestion.explanation.includes('useState é o Hook'), 'Explicacao corrigida deve tratar useState.');
assert(!fixedReactQuestion.explanation.toLowerCase().includes('props tornam'), 'Explicacao corrigida nao deve falar de props.');

const validQuestion: Question = {
  ...fixedReactQuestion,
  id: 'test-valid-react-state',
  optionIds: fixedReactQuestion.optionIds.map((optionId) => optionId.replace(fixedReactQuestion.id, 'test-valid-react-state')),
  correctAnswerId: 'test-valid-react-state:correct',
  correctIndex: fixedReactQuestion.correctIndex
};

assert.equal(validateQuestion(validQuestion).filter((issue) => issue.severity === 'error').length, 0, 'Questao valida deve passar.');

const missingCorrect = {
  ...validQuestion,
  id: 'test-missing-correct',
  correctAnswerId: 'missing'
};
assert(validateQuestion(missingCorrect).some((issue) => issue.type === 'correct-answer-id-not-found'), 'Resposta correta ausente deve falhar.');

const duplicatedOption = {
  ...validQuestion,
  id: 'test-duplicated-option',
  options: ['useEffect', 'useMemo', 'useState', 'useState']
};
assert(validateQuestion(duplicatedOption).some((issue) => issue.type === 'duplicated-options'), 'Alternativa duplicada deve falhar.');

const duplicatedIds = validateQuestionBank([validQuestion, { ...validQuestion }]);
assert(duplicatedIds.errors.some((issue) => issue.type === 'duplicated-question-id'), 'ID duplicado deve falhar.');

const propsWithUseState = {
  ...validQuestion,
  id: 'test-props-use-state',
  topic: 'props',
  objective: 'Receber entradas passadas pelo componente.',
  prompt: 'Você está revisando props em React. Qual escolha completa o exemplo sem mudar o objetivo do trecho?',
  explanation: 'Props tornam componentes configuráveis por entradas recebidas do componente pai.',
  hint: 'Pense em entradas do componente.'
};
assert(validateQuestion(propsWithUseState).some((issue) => issue.type === 'semantic-react-use-state'), 'useState com topico de props deve falhar.');

const useEffectAnswerUseState = {
  ...validQuestion,
  id: 'test-effect-wrong-answer',
  topic: 'useEffect',
  prompt: 'Qual Hook completa o efeito depois do render?',
  code: '____(() => {\n  document.title = title;\n}, [title]);',
  options: ['useState', 'useMemo', 'useRef', 'props'],
  optionIds: ['test-effect-wrong-answer:correct', 'test-effect-wrong-answer:d1', 'test-effect-wrong-answer:d2', 'test-effect-wrong-answer:d3'],
  correctIndex: 0,
  correctAnswerId: 'test-effect-wrong-answer:correct',
  explanation: 'useState cria estado local, mas este texto cita dependências de efeito.'
};
assert(validateQuestion(useEffectAnswerUseState).some((issue) => issue.type === 'semantic-react-use-effect'), 'useEffect com resposta useState deve falhar.');

const phraseFillAnswer = {
  ...validQuestion,
  id: 'test-phrase-fill-answer',
  options: ['usar estado local para completar', 'useEffect', 'useMemo', 'useRef'],
  optionIds: ['test-phrase-fill-answer:correct', 'test-phrase-fill-answer:d1', 'test-phrase-fill-answer:d2', 'test-phrase-fill-answer:d3'],
  correctIndex: 0,
  correctAnswerId: 'test-phrase-fill-answer:correct'
};
assert(validateQuestion(phraseFillAnswer).some((issue) => issue.type === 'fill-answer-not-code'), 'Lacuna com resposta em frase deve falhar.');

const shuffled = shuffleQuestionOptions(fixedReactQuestion, 'question-validation-test');
assert.equal(shuffled.correctAnswerId, fixedReactQuestion.correctAnswerId, 'Shuffle deve preservar correctAnswerId.');
assert.deepEqual(new Set(shuffled.optionIds), new Set(fixedReactQuestion.optionIds), 'Shuffle nao deve misturar alternativas.');
assert.equal(shuffled.options[shuffled.correctIndex], 'useState', 'Shuffle deve recalcular correctIndex pelo ID correto.');
assert.equal(shuffled.id, fixedReactQuestion.id, 'Shuffle deve preservar ID e progresso da pergunta.');

const fullAudit = validateQuestionBank(questions);
assert.equal(fullAudit.errors.length, 0, `Banco de perguntas nao deve ter erros criticos: ${fullAudit.errors.map((issue) => issue.questionId).join(', ')}`);

console.log('Question bank validation tests OK');
