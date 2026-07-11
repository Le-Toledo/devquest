import { codeChallenges } from "../src/data/codeChallenges";
import { lessons } from "../src/data/lessons";
import { questions } from "../src/data/questions";
import { stages } from "../src/data/worlds";
import { AreaId, Difficulty, QuestionType } from "../src/types/game";

const requiredByArea: Partial<Record<AreaId, number>> = {
  logic: 60,
  javascript: 50,
  html: 30,
  css: 30,
  react: 40,
  node: 40,
  rest: 40,
  sql: 50,
  git: 40,
  java: 50,
  kotlin: 50,
  python: 50,
  typescript: 40,
  interview: 60,
};

const byKey = <T>(items: T[], key: (item: T) => string) => {
  const counts = new Map<string, number>();
  items.forEach((item) =>
    counts.set(key(item), (counts.get(key(item)) ?? 0) + 1),
  );
  return counts;
};

const duplicatesFrom = (counts: Map<string, number>) =>
  [...counts.entries()].filter(([, count]) => count > 1).map(([key]) => key);

const countBy = <T, K extends string>(items: T[], key: (item: T) => K) =>
  items.reduce<Record<string, number>>((acc, item) => {
    const group = key(item);
    acc[group] = (acc[group] ?? 0) + 1;
    return acc;
  }, {});

const errors: string[] = [];
const warnings: string[] = [];
const semanticSkillTags = [
  "conceito",
  "codigo",
  "bug",
  "sequencia",
  "boa-pratica",
];
const weakAlternativePatterns = [
  "distrator tecnico",
  "conceito sem relacao",
  "apenas decorar",
  "sem relacao",
];
const forbiddenVisibleMetadataPatterns: RegExp[] = [
  /objetivo\s+pedag[oó]gico/i,
  /\bfundamento\s*\d+\b/i,
  /\bl[oó]gica\s+fundamento\b/i,
  /\bo que voc[eê] deve lembrar\b/i,
  /\breconhecer o fundamento\b/i,
  /\bdescri[cç][aã]o t[eé]cnica\b/i,
  /\bcampo auxiliar\b/i,
  /\b[a-z]+-[a-z0-9-]+-\d{3}\b/i,
  /^\s*(l[oó]gica|javascript|typescript|python|java|kotlin|c#|sql|html|css|react|node\.js|apis rest|git|entrevista)\s+(fundamento|cen[aá]rio avan[cç]ado|decis[aã]o pr[aá]tica)\s+\d+\s*:/i,
];
const unfinishedTextPattern = /____|lorem ipsum/i;
const explicitTodoPattern = /\b(?:TODO|TBD)\b/;

const assertNoVisibleMetadata = (label: string, value?: string) => {
  if (!value) return;
  forbiddenVisibleMetadataPatterns.forEach((pattern) => {
    if (pattern.test(value)) errors.push(`${label} contem metadado interno: ${value}`);
  });
  if (unfinishedTextPattern.test(value) || explicitTodoPattern.test(value)) errors.push(`${label} contem placeholder ou texto inacabado: ${value}`);
  if (/^\s*\d+[\).:-]/.test(value)) errors.push(`${label} comeca com numero interno: ${value}`);
};

const coreConceptTags = (
  tags: string[],
  areaId: AreaId,
  difficulty: Difficulty,
) =>
  tags.filter((tag) => {
    if (tag === areaId || tag === difficulty) return false;
    if (semanticSkillTags.includes(tag)) return false;
    if (
      tag.includes("-iniciante") ||
      tag.includes("-intermediario") ||
      tag.includes("-avancado")
    )
      return false;
    return true;
  });

const semanticKeyFor = (question: (typeof questions)[number]) => {
  const core =
    coreConceptTags(question.tags, question.areaId, question.difficulty)
      .slice(0, 2)
      .join("+") || question.kind;
  return `${question.areaId}:${core}:${question.kind}:${question.difficulty}`;
};

const conceptKeyFor = (question: (typeof questions)[number]) => {
  const core =
    coreConceptTags(question.tags, question.areaId, question.difficulty)
      .slice(0, 2)
      .join("+") || question.kind;
  return `${question.areaId}:${core}`;
};

const questionIds = byKey(questions, (question) => question.id);
const duplicateQuestionIds = duplicatesFrom(questionIds);
if (duplicateQuestionIds.length)
  errors.push(
    `IDs duplicados em perguntas: ${duplicateQuestionIds.join(", ")}`,
  );

const duplicatePrompts = duplicatesFrom(
  byKey(questions, (question) => question.prompt.trim().toLowerCase()),
);
if (duplicatePrompts.length)
  errors.push(
    `Prompts duplicados em perguntas: ${duplicatePrompts.slice(0, 20).join(" | ")}`,
  );

const questionsByArea = countBy(questions, (question) => question.areaId);

questions.forEach((question) => {
  if (
    !question.id ||
    !question.prompt ||
    !question.explanation ||
    !question.hint
  )
    errors.push(
      `Pergunta com campo obrigatorio vazio: ${question.id || question.prompt}`,
    );
  if (question.options.length !== 4)
    errors.push(`Pergunta ${question.id} nao tem 4 alternativas.`);
  if (
    question.correctIndex < 0 ||
    question.correctIndex >= question.options.length
  )
    errors.push(`Pergunta ${question.id} tem correctIndex invalido.`);
  if (!question.tags.length)
    errors.push(`Pergunta ${question.id} nao tem tags.`);
  assertNoVisibleMetadata(`Pergunta ${question.id}`, question.prompt);
  assertNoVisibleMetadata(`Explicacao da pergunta ${question.id}`, question.explanation);
  assertNoVisibleMetadata(`Dica da pergunta ${question.id}`, question.hint);
  const normalizedOptions = question.options.map((option) =>
    option.trim().toLowerCase(),
  );
  if (new Set(normalizedOptions).size !== question.options.length)
    errors.push(`Pergunta ${question.id} tem alternativas repetidas.`);
  const correct = normalizedOptions[question.correctIndex] ?? "";
  question.options.forEach((option, index) => {
    const lower = option.toLowerCase();
    assertNoVisibleMetadata(`Alternativa ${index + 1} da pergunta ${question.id}`, option);
    if (index !== question.correctIndex && lower === correct)
      errors.push(
        `Pergunta ${question.id} tem distrator igual a resposta correta.`,
      );
    if (weakAlternativePatterns.some((pattern) => lower.includes(pattern)))
      errors.push(`Pergunta ${question.id} tem alternativa fraca: ${option}`);
    if (option.trim().length < 8)
      warnings.push(`Pergunta ${question.id} tem alternativa curta: ${option}`);
  });
  if (question.explanation.length < 90)
    errors.push(`Pergunta ${question.id} tem explicacao curta demais.`);
});

const semanticDuplicates = [
  ...byKey(questions, semanticKeyFor).entries(),
].filter(([, count]) => count > 2);
semanticDuplicates.forEach(([key, count]) =>
  errors.push(
    `Repeticao semantica excessiva em ${key}: ${count} perguntas com mesmo conceito/habilidade.`,
  ),
);

const conceptCounts = byKey(questions, conceptKeyFor);
const conceptDominance = [...conceptCounts.entries()].filter(([key, count]) => {
  const area = key.split(":")[0] as AreaId;
  const areaTotal = questionsByArea[area] ?? 1;
  return count / areaTotal > 0.28;
});
conceptDominance.forEach(([key, count]) =>
  errors.push(`Conceito domina area ${key}: ${count} perguntas.`),
);

const repeatedCorrectAnswers = [
  ...byKey(
    questions.filter((question) => question.kind !== "complete-code"),
    (question) =>
      question.options[question.correctIndex]?.trim().toLowerCase() ?? "",
  ).entries(),
].filter(([answer, count]) => answer && count > 3);
repeatedCorrectAnswers.forEach(([answer, count]) =>
  errors.push(`Resposta correta repetida demais (${count}x): ${answer}`),
);

Object.entries(requiredByArea).forEach(([area, minimum]) => {
  const count = questionsByArea[area] ?? 0;
  if (count < minimum)
    errors.push(`Area ${area} tem ${count} perguntas, minimo ${minimum}.`);
});

const questionsByDifficulty = countBy(
  questions,
  (question) => question.difficulty,
);
(["iniciante", "intermediario", "avancado"] satisfies Difficulty[]).forEach(
  (difficulty) => {
    if (!questionsByDifficulty[difficulty])
      errors.push(`Sem perguntas de dificuldade ${difficulty}.`);
  },
);

const questionsByType = countBy(questions, (question) => question.type);
(
  [
    "quiz",
    "codigo",
    "bug",
    "conceito",
    "saida",
    "entrevista",
  ] satisfies QuestionType[]
).forEach((type) => {
  if (!questionsByType[type])
    warnings.push(`Nenhuma pergunta do tipo ${type}.`);
});

const questionIdSet = new Set(questions.map((question) => question.id));
const questionById = new Map(
  questions.map((question) => [question.id, question]),
);
stages.forEach((stage) => {
  const missing = stage.questionIds.filter((id) => !questionIdSet.has(id));
  if (missing.length)
    errors.push(
      `Fase ${stage.id} referencia perguntas inexistentes: ${missing.join(", ")}`,
    );
  const duplicateStageIds = duplicatesFrom(
    byKey(stage.questionIds, (id) => id),
  );
  if (duplicateStageIds.length)
    errors.push(
      `Fase ${stage.id} repete perguntas internamente: ${duplicateStageIds.join(", ")}`,
    );
  if (stage.questionIds.length < 8)
    errors.push(
      `Fase ${stage.id} tem apenas ${stage.questionIds.length} perguntas candidatas.`,
    );
});

const stagesByWorld = stages.reduce<Record<string, typeof stages>>(
  (acc, stage) => {
    acc[stage.worldId] = [...(acc[stage.worldId] ?? []), stage];
    return acc;
  },
  {},
);

Object.entries(stagesByWorld).forEach(([worldId, worldStages]) => {
  for (let outer = 0; outer < worldStages.length; outer += 1) {
    for (let inner = outer + 1; inner < worldStages.length; inner += 1) {
      const left = worldStages[outer];
      const right = worldStages[inner];
      if (!left || !right) continue;
      const leftSet = new Set(left.questionIds);
      const overlap = right.questionIds.filter((id) => leftSet.has(id)).length;
      const smaller = Math.min(
        left.questionIds.length,
        right.questionIds.length,
      );
      const ratio = smaller === 0 ? 0 : overlap / smaller;
      if (ratio > 0.75)
        errors.push(
          `Fases ${left.id} e ${right.id} em ${worldId} compartilham ${Math.round(ratio * 100)}% das perguntas.`,
        );

      if (inner === outer + 1) {
        const leftConcepts = new Set(
          left.questionIds
            .map((id) => questionById.get(id))
            .filter((question): question is (typeof questions)[number] =>
              Boolean(question),
            )
            .map(conceptKeyFor),
        );
        const rightConcepts = new Set(
          right.questionIds
            .map((id) => questionById.get(id))
            .filter((question): question is (typeof questions)[number] =>
              Boolean(question),
            )
            .map(conceptKeyFor),
        );
        const conceptOverlap = [...rightConcepts].filter((key) =>
          leftConcepts.has(key),
        ).length;
        const conceptSmaller = Math.min(leftConcepts.size, rightConcepts.size);
        const conceptRatio =
          conceptSmaller === 0 ? 0 : conceptOverlap / conceptSmaller;
        if (conceptRatio > 0.8)
          errors.push(
            `Fases adjacentes ${left.id} e ${right.id} em ${worldId} repetem ${Math.round(conceptRatio * 100)}% dos conceitos.`,
          );
      }
    }
  }
});

const challengeIds = byKey(codeChallenges, (challenge) => challenge.id);
const duplicateChallengeIds = duplicatesFrom(challengeIds);
if (duplicateChallengeIds.length)
  errors.push(
    `IDs duplicados em desafios de arena: ${duplicateChallengeIds.join(", ")}`,
  );

const genericArenaExplanationPatterns = [
  "é a melhor resposta para este trecho porque resolve o foco",
  "sem criar efeito colateral desnecessário",
];
const forbiddenArenaTermsByArea: Partial<Record<AreaId, string[]>> = {
  python: ["console.log", "undefined", "return false", "any", "addEventListener"],
  sql: ["console.log", "undefined", "return false", "any", "enumerate", "yield", "def "],
  html: ["console.log", "undefined", "return false", "any"],
  css: ["console.log", "undefined", "return false", "any"],
  git: ["console.log", "undefined", "return false", "any"],
};
const allowedTermsByArea: Partial<Record<AreaId, string[]>> = {
  javascript: ["undefined"],
  typescript: ["any"],
};
const arenaDistractorKeyCounts = byKey(
  codeChallenges,
  (challenge) =>
    challenge.options
      .filter((_, index) => index !== challenge.correctIndex)
      .map((option) => option.trim().toLowerCase())
      .sort()
      .join("|"),
);
const repeatedDistractorSets = [...arenaDistractorKeyCounts.entries()].filter(
  ([key, count]) => key && count > 30,
);
repeatedDistractorSets.forEach(([key, count]) =>
  errors.push(`Lista de distratores repetida demais (${count}x): ${key}`),
);

const codeBySnippet = new Map<string, Set<string>>();
codeChallenges.forEach((challenge) => {
  const normalizedCode = challenge.code.trim().toLowerCase();
  const concepts = codeBySnippet.get(normalizedCode) ?? new Set<string>();
  concepts.add(`${challenge.areaId}:${challenge.concept}`);
  codeBySnippet.set(normalizedCode, concepts);
});
codeBySnippet.forEach((concepts, code) => {
  if (concepts.size > 1)
    errors.push(
      `Mesmo codigo usado em conceitos diferentes: ${[...concepts].join(", ")} -> ${code.slice(0, 80)}`,
    );
});

codeChallenges.forEach((challenge) => {
  assertNoVisibleMetadata(`Titulo do desafio de arena ${challenge.id}`, challenge.title);
  assertNoVisibleMetadata(`Descricao do desafio de arena ${challenge.id}`, challenge.description);
  assertNoVisibleMetadata(`Conceito do desafio de arena ${challenge.id}`, challenge.concept);
  assertNoVisibleMetadata(`Explicacao do desafio de arena ${challenge.id}`, challenge.explanation);
  assertNoVisibleMetadata(`Dica do desafio de arena ${challenge.id}`, challenge.hint);
  challenge.options.forEach((option, index) => assertNoVisibleMetadata(`Alternativa ${index + 1} do desafio de arena ${challenge.id}`, option));
  if (!challenge.concept || challenge.concept.trim().length < 3)
    errors.push(`Desafio ${challenge.id} sem conceito de recomendacao.`);
  if (challenge.options.length !== 4)
    errors.push(`Desafio ${challenge.id} nao tem 4 alternativas.`);
  if (
    challenge.correctIndex < 0 ||
    challenge.correctIndex >= challenge.options.length
  )
    errors.push(`Desafio ${challenge.id} tem correctIndex invalido.`);
  const correctAnswer = challenge.options[challenge.correctIndex];
  if (!correctAnswer)
    errors.push(`Desafio ${challenge.id} nao possui resposta correta nas opcoes.`);
  if (new Set(challenge.options.map((option) => option.trim().toLowerCase())).size !== challenge.options.length)
    errors.push(`Desafio ${challenge.id} possui alternativas repetidas.`);
  if (genericArenaExplanationPatterns.some((pattern) => challenge.explanation.toLowerCase().includes(pattern)))
    errors.push(`Desafio ${challenge.id} possui explicacao generica.`);
  if (!challenge.explanation.toLowerCase().includes(challenge.concept.toLowerCase().split(" ")[0]))
    warnings.push(`Desafio ${challenge.id} pode nao mencionar o conceito na explicacao.`);
  if (challenge.kind === "complete-code" && !challenge.code.includes("____"))
    errors.push(`Desafio ${challenge.id} e complete-code mas nao possui lacuna.`);
  if (challenge.kind === "bug-hunt" && !/corre[cç][aã]o|erro|falha|bug/i.test(`${challenge.code} ${challenge.description}`))
    errors.push(`Desafio ${challenge.id} e bug-hunt mas nao descreve bug/correcao.`);
  if (challenge.kind === "simulate-output" && challenge.code.includes("____"))
    errors.push(`Desafio ${challenge.id} e simulate-output mas possui lacuna.`);
  if (challenge.kind === "simulate-output" && !/print|console\.log|sa[ií]da|resultado/i.test(`${challenge.code} ${challenge.description}`))
    errors.push(`Desafio ${challenge.id} e simulate-output mas nao possui saida previsivel.`);
  if (challenge.kind === "order-blocks" && !/ordem|ordene|->/i.test(`${challenge.code} ${challenge.description}`))
    errors.push(`Desafio ${challenge.id} e order-blocks mas nao pede ordenacao.`);
  if (challenge.areaId === "python" && /compreens[aã]o|comprehension/i.test(`${challenge.title} ${challenge.concept}`) && !/\[[^\]]+\s+for\s+[^\]]+\s+in\s+[^\]]+\]/.test(challenge.code))
    errors.push(`Desafio ${challenge.id} fala de comprehension sem sintaxe de comprehension.`);
  const forbiddenTerms = forbiddenArenaTermsByArea[challenge.areaId] ?? [];
  const allowedTerms = allowedTermsByArea[challenge.areaId] ?? [];
  challenge.options.forEach((option) => {
    const lower = option.toLowerCase();
    forbiddenTerms.forEach((term) => {
      if (lower.includes(term) && !allowedTerms.includes(term))
        errors.push(`Desafio ${challenge.id} usa alternativa de outra linguagem/conceito: ${option}`);
    });
  });
  if (/user\.____\("name",\s*""\)/.test(challenge.code) && correctAnswer !== "get")
    errors.push(`Desafio ${challenge.id} usa user.get mas resposta correta nao e get.`);
  if (/user\.____\("name",\s*""\)/.test(challenge.code) && challenge.options.includes("enumerate"))
    errors.push(`Desafio ${challenge.id} ainda aceita enumerate no acesso a dicionario.`);
});

lessons.forEach((lesson) => {
  assertNoVisibleMetadata(`Titulo da aula ${lesson.id}`, lesson.title);
  assertNoVisibleMetadata(`Descricao da aula ${lesson.id}`, lesson.description);
  assertNoVisibleMetadata(`Objetivo da aula ${lesson.id}`, lesson.objective);
  assertNoVisibleMetadata(`Conteudo da aula ${lesson.id}`, lesson.content);
  assertNoVisibleMetadata(`Resumo da aula ${lesson.id}`, lesson.summary);
  assertNoVisibleMetadata(`Conceito da aula ${lesson.id}`, lesson.concept);
  assertNoVisibleMetadata(`Dica do professor da aula ${lesson.id}`, lesson.professorTip);
  lesson.sections?.forEach((section, index) => {
    assertNoVisibleMetadata(`Secao ${index + 1} da aula ${lesson.id}`, section.title);
    assertNoVisibleMetadata(`Corpo da secao ${index + 1} da aula ${lesson.id}`, section.body);
  });
  lesson.commonMistakes?.forEach((mistake, index) => assertNoVisibleMetadata(`Armadilha ${index + 1} da aula ${lesson.id}`, mistake));
  lesson.bestPractices?.forEach((practice, index) => assertNoVisibleMetadata(`Boa pratica ${index + 1} da aula ${lesson.id}`, practice));
  assertNoVisibleMetadata(`Prompt do desafio rapido da aula ${lesson.id}`, lesson.challenge.prompt);
  assertNoVisibleMetadata(`Explicacao do desafio rapido da aula ${lesson.id}`, lesson.challenge.explanation);
  lesson.challenge.options.forEach((option, index) => assertNoVisibleMetadata(`Alternativa ${index + 1} da aula ${lesson.id}`, option));
  if (lesson.professionalExample) {
    assertNoVisibleMetadata(`Cenario profissional da aula ${lesson.id}`, lesson.professionalExample.scenario);
    assertNoVisibleMetadata(`Passo a passo profissional da aula ${lesson.id}`, lesson.professionalExample.walkthrough);
  }
  lesson.exercises?.forEach((exercise) => {
    assertNoVisibleMetadata(`Titulo do exercicio ${exercise.id}`, exercise.title);
    assertNoVisibleMetadata(`Exercicio ${exercise.id}`, exercise.prompt);
    assertNoVisibleMetadata(`Dica do exercicio ${exercise.id}`, exercise.hint);
    assertNoVisibleMetadata(`Conceito de revisao do exercicio ${exercise.id}`, exercise.reviewConcept);
    exercise.acceptanceCriteria.forEach((criterion, index) => assertNoVisibleMetadata(`Criterio ${index + 1} do exercicio ${exercise.id}`, criterion));
  });
});

const challengesByArea = countBy(
  codeChallenges,
  (challenge) => challenge.areaId,
);

console.log("CodeQuest Content Audit");
console.log("Perguntas por area:", JSON.stringify(questionsByArea, null, 2));
console.log(
  "Perguntas por dificuldade:",
  JSON.stringify(questionsByDifficulty, null, 2),
);
console.log("Perguntas por tipo:", JSON.stringify(questionsByType, null, 2));
console.log(
  "Conceitos por area:",
  JSON.stringify(
    Object.fromEntries([...conceptCounts.entries()].slice(0, 60)),
    null,
    2,
  ),
);
console.log(
  `Grupos semanticos repetidos acima do limite: ${semanticDuplicates.length}`,
);
console.log(
  "Desafios de arena por area:",
  JSON.stringify(challengesByArea, null, 2),
);
console.log(`Total de perguntas: ${questions.length}`);
console.log(`Total de desafios de arena: ${codeChallenges.length}`);
console.log(`Total de fases: ${stages.length}`);

if (warnings.length) {
  console.warn("Avisos:");
  warnings.forEach((warning) => console.warn(`- ${warning}`));
}

if (errors.length) {
  console.error("Erros encontrados:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Audit OK: conteúdo válido, IDs únicos e fases balanceadas.");
