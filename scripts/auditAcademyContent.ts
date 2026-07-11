import { learningPaths } from '../src/data/learningPaths';
import { academyModules, lessonById, lessons, lessonsByPath, protectedAcademyLessonIds } from '../src/data/lessons';
import { recommendedCodeChallengeFor } from '../src/data/codeChallenges';

const errors: string[] = [];
const validLevels = new Set(['iniciante', 'intermediario', 'avancado']);
const requiredSectionTitles = [
  'Introdução',
  'O que é',
  'Por que existe',
  'Como funciona',
  'Analogia do mundo real',
  'Exemplo em código',
  'Explicação linha por linha',
  'Resultado esperado',
  'Erros comuns',
  'Dicas profissionais',
  'Curiosidade',
  'Exercício guiado',
  'Desafio',
  'Resumo'
];
const forbiddenTerms = ['peça de conhecimento', 'peca de conhecimento'];
const forbiddenCodeIdentifiers = /\b(name|age|score|max|player|stage|stages|lesson|lessons|input|result|valid|user|users|items|price|quantity|active|published)\b/i;
const challengePrompts: string[] = [];
const challengeOptions: string[] = [];
const correctIndexCount = [0, 0, 0, 0];
const moduleIds = new Set(academyModules.map((module) => module.id));
const pathIds = new Set(learningPaths.map((path) => path.id));
const codeExamples = new Map<string, string[]>();

const duplicated = (items: string[]) => {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  items.forEach((item) => {
    if (seen.has(item)) dupes.add(item);
    seen.add(item);
  });
  return Array.from(dupes);
};

const requireText = (label: string, value: string | undefined, min: number, id: string) => {
  if (!value || value.trim().length < min) errors.push(`${id}: ${label} muito curto ou ausente.`);
};

duplicated(learningPaths.map((path) => path.id)).forEach((id) => errors.push(`Trilha duplicada: ${id}`));
duplicated(academyModules.map((module) => module.id)).forEach((id) => errors.push(`Modulo duplicado: ${id}`));
duplicated(lessons.map((lesson) => lesson.id)).forEach((id) => errors.push(`Aula duplicada: ${id}`));
learningPaths.forEach((path) => {
  duplicated(lessonsByPath(path.id).map((lesson) => lesson.title.toLowerCase())).forEach((title) => errors.push(`Titulo duplicado em ${path.id}: ${title}`));
});

learningPaths.forEach((path) => {
  const modules = academyModules.filter((module) => module.pathId === path.id);
  const pathLessons = lessonsByPath(path.id);
  duplicated(pathLessons.map((lesson) => String(lesson.order ?? 0))).forEach((order) => errors.push(`${path.id}: ordem duplicada em aulas: ${order}.`));
  if (modules.length < 5) errors.push(`${path.id}: precisa de pelo menos 5 modulos, encontrou ${modules.length}.`);
  if (pathLessons.length < 15) errors.push(`${path.id}: precisa de pelo menos 15 aulas, encontrou ${pathLessons.length}.`);
  modules.forEach((module) => {
    const moduleLessons = pathLessons.filter((lesson) => lesson.moduleId === module.id);
    if (moduleLessons.length < 3) errors.push(`${module.id}: precisa de pelo menos 3 aulas, encontrou ${moduleLessons.length}.`);
  });
});

lessons.forEach((lesson) => {
  const shouldHaveCode = !['career-path', 'interview-path'].includes(lesson.pathId);
  requireText('titulo', lesson.title, 3, lesson.id);
  requireText('descricao', lesson.description, 20, lesson.id);
  requireText('objetivo', lesson.objective, 20, lesson.id);
  requireText('conteudo', lesson.content, 220, lesson.id);
  requireText('dica do Professor Byte', lesson.professorTip, 30, lesson.id);
  requireText('resumo', lesson.summary, 80, lesson.id);
  if (!pathIds.has(lesson.pathId)) errors.push(`${lesson.id}: trilha invalida: ${lesson.pathId}.`);
  if (!lesson.moduleId || !moduleIds.has(lesson.moduleId)) errors.push(`${lesson.id}: modulo invalido: ${lesson.moduleId ?? 'ausente'}.`);
  if (!lesson.moduleId) errors.push(`${lesson.id}: sem moduleId.`);
  if (!lesson.sections || lesson.sections.length !== requiredSectionTitles.length) {
    errors.push(`${lesson.id}: precisa ter exatamente ${requiredSectionTitles.length} secoes pedagogicas.`);
  } else {
    const titles = new Set(lesson.sections.map((section) => section.title));
    requiredSectionTitles.forEach((title) => {
      if (!titles.has(title)) errors.push(`${lesson.id}: secao obrigatoria ausente: ${title}.`);
    });
  }
  if (!lesson.commonMistakes || lesson.commonMistakes.length < 3) errors.push(`${lesson.id}: precisa de pelo menos 3 erros comuns.`);
  if (!lesson.bestPractices || lesson.bestPractices.length < 3) errors.push(`${lesson.id}: precisa de pelo menos 3 boas práticas.`);
  if (!lesson.tags || lesson.tags.length < 3) errors.push(`${lesson.id}: precisa de tags.`);
  if (!lesson.level || !validLevels.has(lesson.level)) errors.push(`${lesson.id}: nivel invalido.`);
  if (!lesson.challenge) errors.push(`${lesson.id}: sem pergunta de fixacao.`);
  if (!lesson.professionalExample) {
    errors.push(`${lesson.id}: sem exemplo profissional específico.`);
  } else {
    requireText('cenario profissional', lesson.professionalExample.scenario, 70, lesson.id);
    requireText('passo a passo profissional', lesson.professionalExample.walkthrough, 90, lesson.id);
    if (shouldHaveCode && !lesson.professionalExample.code) errors.push(`${lesson.id}: exemplo profissional deveria ter codigo.`);
  }
  if (!lesson.exercises || lesson.exercises.length !== 3) {
    errors.push(`${lesson.id}: precisa ter 3 exercicios progressivos.`);
  } else {
    const expectedLevels = ['aquecimento', 'pratica', 'desafio'];
    expectedLevels.forEach((level, index) => {
      const exercise = lesson.exercises?.[index];
      if (exercise?.level !== level) errors.push(`${lesson.id}: exercicio ${index + 1} deveria ser ${level}.`);
      requireText(`exercicio ${level}`, exercise?.prompt, 70, lesson.id);
      if (!exercise?.acceptanceCriteria || exercise.acceptanceCriteria.length < 2) errors.push(`${lesson.id}: exercicio ${level} precisa de criterios de aceite.`);
      requireText(`solucao do exercicio ${level}`, exercise?.solution, 60, lesson.id);
      requireText(`dica do exercicio ${level}`, exercise?.hint, 40, lesson.id);
    });
  }
  if (lesson.challenge) {
    if (lesson.challenge.options.length !== 4) errors.push(`${lesson.id}: pergunta precisa de 4 alternativas.`);
    if (lesson.challenge.correctIndex < 0 || lesson.challenge.correctIndex >= lesson.challenge.options.length) errors.push(`${lesson.id}: resposta correta inexistente.`);
    const normalizedOptions = lesson.challenge.options.map((option) => option.trim().toLowerCase());
    if (new Set(normalizedOptions).size !== lesson.challenge.options.length) errors.push(`${lesson.id}: alternativas repetidas no desafio rapido.`);
    challengePrompts.push(lesson.challenge.prompt.trim().toLowerCase());
    challengeOptions.push(...normalizedOptions);
    correctIndexCount[lesson.challenge.correctIndex] += 1;
    requireText('explicacao da resposta', lesson.challenge.explanation, 50, lesson.id);
  }
  if (shouldHaveCode && !lesson.codeExample && !lesson.sections?.some((section) => section.code)) {
    errors.push(`${lesson.id}: deveria ter exemplo de codigo.`);
  }
  if (lesson.codeExample) {
    const normalizedCode = lesson.codeExample.trim();
    codeExamples.set(normalizedCode, [...(codeExamples.get(normalizedCode) ?? []), lesson.id]);
  }
  const arenaRecommendation = recommendedCodeChallengeFor(lesson.areaId, lesson.concept);
  if (!arenaRecommendation || arenaRecommendation.areaId !== lesson.areaId) errors.push(`${lesson.id}: recomendacao invalida da Arena para ${lesson.areaId}/${lesson.concept}.`);
  if (lesson.pathId !== 'html-path' && lesson.codeExample && forbiddenCodeIdentifiers.test(lesson.codeExample)) {
    errors.push(`${lesson.id}: exemplo de codigo ainda usa identificadores em ingles.`);
  }
  const searchableText = [
    lesson.title,
    lesson.description,
    lesson.objective,
    lesson.content,
    lesson.summary,
    lesson.professorTip,
    ...(lesson.sections ?? []).flatMap((section) => [section.title, section.body]),
    ...(lesson.commonMistakes ?? []),
    ...(lesson.bestPractices ?? [])
  ].join('\n').toLowerCase();
  forbiddenTerms.forEach((term) => {
    if (searchableText.includes(term)) errors.push(`${lesson.id}: termo artificial encontrado: ${term}.`);
  });
  if (/\b\d{4,}\b/.test(searchableText)) errors.push(`${lesson.id}: texto contem numero grande sem funcao pedagogica clara.`);
  const sentenceCounts = searchableText.split(/[.!?]\s+/).map((sentence) => sentence.trim()).filter((sentence) => sentence.length > 80).reduce<Record<string, number>>((acc, sentence) => ({ ...acc, [sentence]: (acc[sentence] ?? 0) + 1 }), {});
  const repeatedSentences = Object.entries(sentenceCounts).filter(([, count]) => count > 2).map(([sentence]) => sentence);
  repeatedSentences.forEach((sentence) => errors.push(`${lesson.id}: conteudo artificialmente repetido: ${sentence.slice(0, 80)}.`));
});

console.log('Code Quest Content Audit');
console.log(`Trilhas: ${learningPaths.length}`);
console.log(`Modulos: ${academyModules.length}`);
console.log(`Aulas: ${lessons.length}`);
console.log('Aulas por trilha:', Object.fromEntries(learningPaths.map((path) => [path.title, lessonsByPath(path.id).length])));

if (learningPaths.length < 17) errors.push(`Total de trilhas insuficiente: ${learningPaths.length}.`);
if (academyModules.length < 85) errors.push(`Total de modulos insuficiente: ${academyModules.length}.`);
if (lessons.length < 250) errors.push(`Total de aulas insuficiente: ${lessons.length}.`);
if (!Array.isArray(protectedAcademyLessonIds)) {
  errors.push('Protecao de IDs antigos ausente: exporte protectedAcademyLessonIds.');
} else {
  if (protectedAcademyLessonIds.length !== lessons.length) errors.push(`Protecao de IDs antigos incompleta: ${protectedAcademyLessonIds.length}/${lessons.length}.`);
  protectedAcademyLessonIds.forEach((id) => {
    if (!lessonById(id)) errors.push(`ID antigo sem resolução: ${id}`);
  });
}
duplicated(challengePrompts).forEach((prompt) => errors.push(`Pergunta repetida na Academia: ${prompt}`));
duplicated(challengeOptions).forEach((option) => errors.push(`Alternativa repetida na Academia: ${option}`));
if (correctIndexCount.filter((count) => count > 0).length < 4) errors.push(`Respostas corretas nao estao distribuidas entre as 4 posicoes: ${correctIndexCount.join(', ')}.`);
Array.from(codeExamples.entries()).forEach(([code, ids]) => {
  if (ids.length > 1 && code.length > 80) errors.push(`Exemplo de codigo identico em aulas diferentes: ${ids.join(', ')}.`);
});

if (errors.length) {
  console.error('Audit FAILED');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log('Audit OK: Academia Dev robusta, modular e com conteudo completo.');
}
