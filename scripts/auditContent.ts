import { codeChallenges } from "../src/data/codeChallenges";
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
  const normalizedOptions = question.options.map((option) =>
    option.trim().toLowerCase(),
  );
  if (new Set(normalizedOptions).size !== question.options.length)
    errors.push(`Pergunta ${question.id} tem alternativas repetidas.`);
  const correct = normalizedOptions[question.correctIndex] ?? "";
  question.options.forEach((option, index) => {
    const lower = option.toLowerCase();
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
    questions,
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

codeChallenges.forEach((challenge) => {
  if (challenge.options.length !== 4)
    errors.push(`Desafio ${challenge.id} nao tem 4 alternativas.`);
  if (
    challenge.correctIndex < 0 ||
    challenge.correctIndex >= challenge.options.length
  )
    errors.push(`Desafio ${challenge.id} tem correctIndex invalido.`);
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
