import assert from 'node:assert/strict';
import { codeChallengeById, codeChallenges, codeChallengeTemplates } from '../src/data/codeChallenges';

const completesBlank = (code: string, answer: string) => {
  if (!code.includes('____')) return false;
  const completed = code.replace('____', answer);
  if (/user\.get\("name",\s*""\)/.test(completed)) return true;
  if (/usuario\.get\("nome",\s*"Sem nome"\)/.test(completed)) return true;
  return false;
};

assert.equal(completesBlank('name = user.____("name", "")', 'get'), true, 'user.____("name", "") deve aceitar get.');
assert.equal(completesBlank('name = user.____("name", "")', 'enumerate'), false, 'user.____("name", "") nao deve aceitar enumerate.');

const dictionaryChallenge = codeChallengeById('arena-python-dicts-002');
assert(dictionaryChallenge, 'Desafio antigo de dicts deve continuar existindo.');
assert.equal(dictionaryChallenge.title, 'Python: acesso seguro a dicionários');
assert.equal(dictionaryChallenge.kind, 'complete-code');
assert.equal(dictionaryChallenge.options[dictionaryChallenge.correctIndex], 'get');
assert(!dictionaryChallenge.options.includes('enumerate'), 'Dict get nao deve oferecer enumerate.');

const comprehensionChallenge = codeChallengeById('arena-python-comprehension-005');
assert(comprehensionChallenge, 'Desafio antigo de comprehension deve continuar existindo.');
assert.match(comprehensionChallenge.code, /\[[^\]]+\s+for\s+[^\]]+\s+in\s+[^\]]+\]/, 'Comprehension precisa conter sintaxe de comprehension.');
assert.equal(comprehensionChallenge.kind, 'simulate-output', 'Comprehension criada deve avaliar saida previsivel.');

codeChallenges.forEach((challenge) => {
  assert.equal(challenge.options.length, 4, `${challenge.id} deve ter quatro alternativas.`);
  assert(challenge.correctIndex >= 0 && challenge.correctIndex < challenge.options.length, `${challenge.id} deve ter correctIndex valido.`);
  assert(challenge.options.includes(challenge.options[challenge.correctIndex]), `${challenge.id} deve conter resposta correta nas opcoes.`);
  assert.equal(new Set(challenge.options.map((option) => option.toLowerCase())).size, 4, `${challenge.id} nao deve repetir alternativas.`);
  if (challenge.areaId === 'python') {
    const lowerOptions = challenge.options.join(' ').toLowerCase();
    assert(!lowerOptions.includes('console.log'), `${challenge.id} nao deve usar console.log em Python.`);
    assert(!lowerOptions.includes('undefined'), `${challenge.id} nao deve usar undefined em Python.`);
  }
  if (challenge.kind === 'complete-code') assert(challenge.code.includes('____'), `${challenge.id} complete-code deve possuir lacuna.`);
  if (challenge.kind === 'simulate-output') {
    assert(!challenge.code.includes('____'), `${challenge.id} simulate-output nao deve possuir lacuna.`);
    assert(/print|console\.log|saída|resultado/i.test(`${challenge.code} ${challenge.description}`), `${challenge.id} simulate-output deve ter saida previsivel.`);
  }
  if (challenge.kind === 'bug-hunt') {
    assert(/corre[cç][aã]o|erro|falha|bug/i.test(`${challenge.code} ${challenge.description}`), `${challenge.id} bug-hunt deve conter bug real ou correcao.`);
  }
  assert(
    challenge.explanation.toLowerCase().includes(challenge.concept.toLowerCase().split(' ')[0]),
    `${challenge.id} deve explicar o conceito real.`
  );
});

const ids = codeChallenges.map((challenge) => challenge.id);
assert.equal(new Set(ids).size, ids.length, 'IDs da Arena devem permanecer unicos.');

const templateKeys = new Set(codeChallengeTemplates.map((item) => `${item.areaId}:${item.idSlug}:${item.correctAnswer}:${item.code}`));
assert.equal(templateKeys.size, codeChallengeTemplates.length, 'Conceito, snippet e resposta devem pertencer a templates coesos e unicos.');

console.log('Code Arena semantic tests OK');
