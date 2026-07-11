import { rawQuestions } from '../src/data/questions';
import { validateQuestionBank } from '../src/services/questionBankValidation';

const result = validateQuestionBank(rawQuestions);

const formatIssue = (issue: (typeof result.issues)[number]) =>
  [
    issue.severity.toUpperCase(),
    issue.questionId,
    issue.language ?? 'sem-linguagem',
    issue.module ?? 'sem-modulo',
    issue.topic ?? 'sem-topico',
    issue.type,
    issue.message,
    `Sugestao: ${issue.suggestion}`
  ].join(' | ');

console.log(`Total de perguntas auditadas: ${result.total}`);
console.log(`Problemas criticos: ${result.errors.length}`);
console.log(`Avisos: ${result.warnings.length}`);

if (result.issues.length) {
  console.log('\nRelatorio de auditoria:');
  result.issues.forEach((issue) => console.log(formatIssue(issue)));
}

if (result.errors.length) {
  process.exit(1);
}
