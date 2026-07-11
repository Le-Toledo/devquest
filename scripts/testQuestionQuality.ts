import assert from 'node:assert/strict';
import { codeChallenges } from '../src/data/codeChallenges';
import { lessons } from '../src/data/lessons';
import { questions } from '../src/data/questions';

const forbiddenPatterns = [
  /objetivo\s+pedag[oó]gico/i,
  /\bfundamento\s*\d+\b/i,
  /\bl[oó]gica\s+fundamento\b/i,
  /\bo que voc[eê] deve lembrar\b/i,
  /\breconhecer o fundamento\b/i,
  /\bdescri[cç][aã]o t[eé]cnica\b/i,
  /^\s*\d+[\).:-]/
];

const assertClean = (label: string, value?: string) => {
  if (!value) return;
  forbiddenPatterns.forEach((pattern) => assert(!pattern.test(value), `${label} contem metadado interno: ${value}`));
  assert(!/____|lorem ipsum/i.test(value), `${label} contem placeholder visivel: ${value}`);
  assert(!/\b(?:TODO|TBD)\b/.test(value), `${label} contem marcador inacabado: ${value}`);
};

questions.forEach((question) => {
  assertClean(`Pergunta ${question.id}`, question.prompt);
  assertClean(`Explicacao ${question.id}`, question.explanation);
  assertClean(`Dica ${question.id}`, question.hint);
  assert.equal(question.options.length, 4, `${question.id} precisa ter 4 alternativas.`);
  assert(question.correctIndex >= 0 && question.correctIndex < question.options.length, `${question.id} possui gabarito invalido.`);
  assert.equal(new Set(question.options.map((option) => option.trim().toLowerCase())).size, 4, `${question.id} possui alternativa duplicada.`);
  question.options.forEach((option, index) => assertClean(`Alternativa ${index + 1} ${question.id}`, option));
});

codeChallenges.forEach((challenge) => {
  assertClean(`Arena ${challenge.id}`, challenge.title);
  assertClean(`Arena ${challenge.id}`, challenge.description);
  assertClean(`Arena ${challenge.id}`, challenge.explanation);
  challenge.options.forEach((option, index) => assertClean(`Arena alternativa ${index + 1} ${challenge.id}`, option));
});

lessons.forEach((lesson) => {
  assertClean(`Aula ${lesson.id}`, lesson.title);
  assertClean(`Aula ${lesson.id}`, lesson.description);
  assertClean(`Aula ${lesson.id}`, lesson.content);
  assertClean(`Aula ${lesson.id}`, lesson.challenge.prompt);
  lesson.challenge.options.forEach((option, index) => assertClean(`Aula alternativa ${index + 1} ${lesson.id}`, option));
});

const sample = questions.find((question) => question.id === 'logic-binary-search-008');
assert(sample, 'Pergunta de busca binaria deve existir para proteger ID antigo.');
assert.equal(sample.prompt.includes('fundamento 8'), false, 'Prompt nao deve expor numero interno.');
assert.equal(sample.prompt.includes('Objetivo pedagógico'), false, 'Prompt nao deve expor objetivo pedagogico.');
assert(sample.prompt.includes('busca binária'), 'Prompt deve continuar ensinando o conceito real.');

console.log('Question quality tests OK');
