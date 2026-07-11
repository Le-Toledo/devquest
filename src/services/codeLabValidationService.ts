import { CodeLabChallenge, CodeLabValidationResult, CodeLabValidationRule } from '../types/codeLab';

export const normalizeCodeForValidation = (code: string) =>
  code
    .replace(/\r\n/g, '\n')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/;/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n')
    .toLowerCase();

const includesNormalized = (code: string, fragment: string) => normalizeCodeForValidation(code).includes(normalizeCodeForValidation(fragment));

const validateRule = (code: string, rule: CodeLabValidationRule) => {
  if (rule.type === 'required-fragment') {
    return Boolean(rule.value && includesNormalized(code, rule.value));
  }
  if (rule.type === 'forbidden-fragment') {
    return Boolean(rule.value && !includesNormalized(code, rule.value));
  }
  if (rule.type === 'ordered-fragments') {
    const normalized = normalizeCodeForValidation(code);
    let cursor = -1;
    return (rule.values ?? []).every((value) => {
      const nextIndex = normalized.indexOf(normalizeCodeForValidation(value), cursor + 1);
      if (nextIndex < 0) return false;
      cursor = nextIndex;
      return true;
    });
  }
  if (rule.type === 'regex') {
    if (!rule.value) return false;
    return new RegExp(rule.value, 'i').test(code);
  }
  if (rule.type === 'normalized-equality') {
    return Boolean(rule.value && normalizeCodeForValidation(code) === normalizeCodeForValidation(rule.value));
  }
  if (rule.type === 'custom-validator') {
    return (rule.values ?? []).every((value) => includesNormalized(code, value));
  }
  return false;
};

export const validateCodeLabSolution = (challenge: CodeLabChallenge, code: string): CodeLabValidationResult => {
  if (!code.trim()) {
    return {
      passed: false,
      score: 0,
      checks: challenge.validationRules.map((rule) => ({ id: rule.id, passed: false, message: rule.message })),
      feedback: 'A solução está vazia. Escreva uma tentativa antes de validar.'
    };
  }

  const checks = challenge.validationRules.map((rule) => ({
    id: rule.id,
    passed: validateRule(code, rule),
    message: rule.message
  }));
  const passedCount = checks.filter((check) => check.passed).length;
  const score = checks.length ? Math.round((passedCount / checks.length) * 100) : 0;
  const passed = checks.length > 0 && checks.every((check) => check.passed);

  return {
    passed,
    score,
    checks,
    feedback: passed
      ? 'Solução validada. Os pontos principais foram atendidos sem executar código arbitrário.'
      : 'Revise os pontos que falharam. A validação confere estrutura, trechos e intenção, não executa o programa.'
  };
};
