import { codeLabChallenges } from '../src/data/codeLabChallenges';
import { countExactPlaceholders, hasInvalidUnderscorePlaceholder } from '../src/services/codeLabPlaceholderService';
import { CodeLabChallengeKind } from '../src/types/codeLab';
import { Difficulty } from '../src/types/game';

const errors: string[] = [];
const warnings: string[] = [];

const expectedByLanguage: Record<string, number> = {
  JavaScript: 8,
  TypeScript: 5,
  Python: 5,
  SQL: 5,
  HTML: 3,
  CSS: 2,
  React: 2
};

const requiredKinds: CodeLabChallengeKind[] = [
  'complete-code',
  'fix-bug',
  'predict-output',
  'implement-function',
  'refactor',
  'sql-query',
  'html-structure',
  'css-layout',
  'mini-project'
];

const requiredDifficulties: Difficulty[] = ['iniciante', 'intermediario', 'avancado'];

const countBy = <T>(items: T[], key: (item: T) => string) =>
  items.reduce<Record<string, number>>((acc, item) => {
    const value = key(item);
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});

const duplicates = (values: string[]) => {
  const counts = countBy(values, (value) => value.trim().toLowerCase());
  return Object.entries(counts).filter(([, count]) => count > 1).map(([value]) => value);
};

const commentWithPlaceholder = (code: string) =>
  code
    .split('\n')
    .some((line) => {
      const trimmed = line.trim();
      return (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('<!--')) && trimmed.includes('____');
    });

if (codeLabChallenges.length !== 30) errors.push(`Laboratorio deve ter 30 desafios iniciais, encontrou ${codeLabChallenges.length}.`);

const languageCounts = countBy(codeLabChallenges, (challenge) => challenge.language);
Object.entries(expectedByLanguage).forEach(([language, expected]) => {
  if ((languageCounts[language] ?? 0) !== expected) {
    errors.push(`${language} deve ter ${expected} desafios, encontrou ${languageCounts[language] ?? 0}.`);
  }
});

requiredDifficulties.forEach((difficulty) => {
  if (!codeLabChallenges.some((challenge) => challenge.difficulty === difficulty)) {
    errors.push(`Sem desafios de dificuldade ${difficulty}.`);
  }
});

requiredKinds.forEach((kind) => {
  if (!codeLabChallenges.some((challenge) => challenge.kind === kind)) {
    errors.push(`Sem desafio do tipo ${kind}.`);
  }
});

duplicates(codeLabChallenges.map((challenge) => challenge.id)).forEach((id) => errors.push(`ID duplicado: ${id}.`));
duplicates(codeLabChallenges.map((challenge) => challenge.title)).forEach((title) => errors.push(`Titulo duplicado: ${title}.`));

codeLabChallenges.forEach((challenge) => {
  const label = `${challenge.id} (${challenge.language})`;
  if (!challenge.title || !challenge.objective || !challenge.context || !challenge.starterCode || !challenge.solution) {
    errors.push(`${label} possui campo obrigatorio vazio.`);
  }
  if (challenge.hints.length < 3) errors.push(`${label} precisa de pelo menos 3 dicas.`);
  if (challenge.instructions.length < 3) errors.push(`${label} precisa de instrucoes progressivas.`);
  if (challenge.acceptanceCriteria.length < 3) errors.push(`${label} precisa de 3 criterios de aceite.`);
  if (challenge.validationRules.length < 2) errors.push(`${label} precisa de pelo menos 2 regras de validacao.`);
  if (!challenge.testCases.some((test) => test.hidden)) errors.push(`${label} precisa ter pelo menos um criterio interno hidden.`);
  if (!challenge.testCases.some((test) => !test.hidden)) errors.push(`${label} precisa ter pelo menos um criterio visivel.`);
  if (challenge.solution.trim() === challenge.starterCode.trim()) errors.push(`${label} solucao nao pode ser igual ao codigo inicial.`);
  const placeholderCount = countExactPlaceholders(challenge.starterCode);
  if (challenge.kind === 'complete-code' && placeholderCount === 0) errors.push(`${label} e complete-code mas nao possui placeholder ____.`);
  if (hasInvalidUnderscorePlaceholder(challenge.starterCode)) errors.push(`${label} possui sequencia invalida com cinco ou mais underscores.`);
  if (hasInvalidUnderscorePlaceholder(challenge.solution)) errors.push(`${label} possui solucao com sequencia invalida de underscores.`);
  if (placeholderCount > 4) errors.push(`${label} possui lacunas demais (${placeholderCount}).`);
  if (challenge.solution.includes('____')) errors.push(`${label} solucao ainda contem placeholder ____.`);
  if (commentWithPlaceholder(challenge.starterCode) && challenge.kind !== 'predict-output') {
    errors.push(`${label} possui lacuna em comentario sem intencao pedagogica de previsao de saida.`);
  }
  if (!challenge.tags.includes(challenge.language.toLowerCase().replace('.', '').replace(' ', '-'))) {
    warnings.push(`${label} nao usa tag canonica da linguagem.`);
  }

  const requiredRules = challenge.validationRules.filter((rule) => rule.type === 'required-fragment');
  if (requiredRules.length === challenge.validationRules.length && challenge.validationRules.length < 3) {
    errors.push(`${label} tem validacao fragil: apenas fragments obrigatorios insuficientes.`);
  }
  challenge.validationRules.forEach((rule) => {
    if (!rule.id || !rule.message) errors.push(`${label} tem regra sem id ou mensagem.`);
    if (rule.type === 'required-fragment' && (!rule.value || rule.value.trim().length < 2)) {
      errors.push(`${label} tem required-fragment fraco.`);
    }
    if (rule.type === 'forbidden-fragment' && (!rule.value || rule.value.trim().length < 2)) {
      errors.push(`${label} tem forbidden-fragment fraco.`);
    }
    if (rule.type === 'ordered-fragments' && (rule.values?.length ?? 0) < 2) {
      errors.push(`${label} tem ordered-fragments com menos de 2 itens.`);
    }
    if (rule.type === 'regex' && !rule.value) errors.push(`${label} tem regex vazia.`);
  });
});

if (warnings.length) {
  console.warn('Avisos do Laboratorio de Codigo:');
  warnings.forEach((warning) => console.warn(`- ${warning}`));
}

if (errors.length) {
  console.error('Falhas na auditoria do Laboratorio de Codigo:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Auditoria do Laboratorio de Codigo OK: ${codeLabChallenges.length} desafios, ${Object.keys(languageCounts).length} linguagens com conteudo.`);
