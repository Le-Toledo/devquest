import { AreaId, Difficulty, Stage, World } from '../types/game';
import { questions } from './questions';

export const worlds: World[] = [
  { id: 'logic-world', title: 'Mundo da Lógica', subtitle: 'Pense como programador antes de escrever código.', areaIds: ['logic'], requiredLevel: 1, color: '#49E3B3' },
  { id: 'js-world', title: 'Mundo do JavaScript', subtitle: 'Domine JavaScript e TypeScript na web moderna.', areaIds: ['javascript', 'typescript'], requiredLevel: 2, color: '#ffd166' },
  { id: 'python-world', title: 'Mundo do Python', subtitle: 'Automação, dados e raciocínio limpo.', areaIds: ['python'], requiredLevel: 3, color: '#8EA7FF' },
  { id: 'frontend-world', title: 'Mundo do Front-end', subtitle: 'HTML, CSS, DOM, React e interfaces responsivas.', areaIds: ['html', 'css', 'javascript', 'react'], requiredLevel: 4, color: '#ff8fab' },
  { id: 'backend-world', title: 'Mundo do Back-end', subtitle: 'Node.js, APIs REST, Java, Kotlin, C# e arquitetura.', areaIds: ['node', 'rest', 'java', 'kotlin', 'csharp'], requiredLevel: 5, color: '#a78bfa' },
  { id: 'database-world', title: 'Mundo de Banco de Dados', subtitle: 'SQL, modelagem, índices e segurança.', areaIds: ['sql'], requiredLevel: 6, color: '#34d399' },
  { id: 'pro-world', title: 'Desafios Profissionais', subtitle: 'Git, REST, entrevistas e boas práticas.', areaIds: ['git', 'rest', 'interview'], requiredLevel: 7, color: '#fb7185', premium: true }
];

type StageConfig = {
  id: string;
  worldId: string;
  title: string;
  areaId: AreaId;
  areaIds: AreaId[];
  difficulties: Difficulty[];
  tags?: string[];
  requiredLevel: number;
  premium?: boolean;
};

const difficultyRank: Record<Difficulty, number> = {
  iniciante: 1,
  intermediario: 2,
  avancado: 3
};

const idsFor = ({ areaIds, difficulties, tags = [], id }: StageConfig) => {
  const matching = questions.filter((question) => {
    const areaMatches = areaIds.includes(question.areaId);
    const difficultyMatches = difficulties.includes(question.difficulty);
    const tagMatches = tags.length === 0 || tags.some((tag) => question.tags.includes(tag));
    return areaMatches && difficultyMatches && tagMatches;
  });

  const fallback = questions.filter((question) => areaIds.includes(question.areaId) && difficulties.includes(question.difficulty));
  const broadFallback = questions.filter((question) => areaIds.includes(question.areaId));
  const pool = matching.length >= 8 ? matching : fallback.length >= 12 ? fallback : broadFallback;
  const sorted = [...pool].sort((a, b) => difficultyRank[a.difficulty] - difficultyRank[b.difficulty] || a.id.localeCompare(b.id));
  const offset = sorted.length ? id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % sorted.length : 0;
  const rotated = [...sorted.slice(offset), ...sorted.slice(0, offset)];
  const bucketCount = rotated.length >= 36 ? 4 : rotated.length >= 24 ? 3 : 2;
  const bucket = offset % bucketCount;
  const bucketed = rotated.filter((_, index) => index % bucketCount === bucket);
  const candidateList = bucketed.length >= 8 ? bucketed : rotated;

  return candidateList
    .slice(0, Math.min(12, candidateList.length))
    .map((question) => question.id);
};

const stage = (config: StageConfig): Stage => ({
  id: config.id,
  worldId: config.worldId,
  title: config.title,
  areaId: config.areaId,
  requiredLevel: config.requiredLevel,
  questionIds: idsFor(config),
  premium: config.premium
});

export const stages: Stage[] = [
  stage({ id: 'logic-world-logic', worldId: 'logic-world', title: '1. Fundamentos de Lógica', areaId: 'logic', areaIds: ['logic'], difficulties: ['iniciante'], tags: ['algoritmo', 'condicional', 'boolean'], requiredLevel: 1 }),
  stage({ id: 'logic-world-flow', worldId: 'logic-world', title: '2. Fluxo e Repetição', areaId: 'logic', areaIds: ['logic'], difficulties: ['iniciante', 'intermediario'], tags: ['loop', 'condicional'], requiredLevel: 1 }),
  stage({ id: 'logic-world-decomposition', worldId: 'logic-world', title: '3. Decomposição', areaId: 'logic', areaIds: ['logic'], difficulties: ['iniciante', 'intermediario', 'avancado'], tags: ['decomposicao', 'edge-case'], requiredLevel: 2 }),
  stage({ id: 'logic-world-complexity', worldId: 'logic-world', title: '4. Complexidade', areaId: 'logic', areaIds: ['logic'], difficulties: ['iniciante', 'intermediario', 'avancado'], tags: ['complexidade', 'busca'], requiredLevel: 3 }),
  stage({ id: 'logic-world-boss', worldId: 'logic-world', title: '5. Boss da Lógica', areaId: 'logic', areaIds: ['logic'], difficulties: ['iniciante', 'intermediario', 'avancado'], tags: ['algoritmo', 'boolean'], requiredLevel: 4 }),

  stage({ id: 'js-world-javascript', worldId: 'js-world', title: '1. JavaScript Base', areaId: 'javascript', areaIds: ['javascript'], difficulties: ['iniciante'], requiredLevel: 2 }),
  stage({ id: 'js-world-typescript', worldId: 'js-world', title: '2. TypeScript Base', areaId: 'typescript', areaIds: ['typescript'], difficulties: ['iniciante'], requiredLevel: 2 }),
  stage({ id: 'js-world-async-types', worldId: 'js-world', title: '3. Async e Tipos', areaId: 'javascript', areaIds: ['javascript', 'typescript'], difficulties: ['intermediario'], tags: ['async', 'tipos', 'unknown'], requiredLevel: 3 }),
  stage({ id: 'js-world-bugs', worldId: 'js-world', title: '4. Bugs de Runtime', areaId: 'typescript', areaIds: ['javascript', 'typescript'], difficulties: ['intermediario', 'avancado'], tags: ['bug', 'comparacao', 'assertion'], requiredLevel: 4 }),
  stage({ id: 'js-world-boss', worldId: 'js-world', title: '5. Boss JS/TS', areaId: 'javascript', areaIds: ['javascript', 'typescript'], difficulties: ['intermediario', 'avancado'], requiredLevel: 5 }),

  stage({ id: 'python-world-python', worldId: 'python-world', title: '1. Python Essencial', areaId: 'python', areaIds: ['python'], difficulties: ['iniciante', 'intermediario', 'avancado'], tags: ['basico', 'sintaxe'], requiredLevel: 3 }),
  stage({ id: 'python-world-data', worldId: 'python-world', title: '2. Listas e Dicionários', areaId: 'python', areaIds: ['python'], difficulties: ['iniciante', 'intermediario', 'avancado'], tags: ['lista', 'dict'], requiredLevel: 3 }),
  stage({ id: 'python-world-flow', worldId: 'python-world', title: '3. Fluxo Pythônico', areaId: 'python', areaIds: ['python'], difficulties: ['iniciante', 'intermediario', 'avancado'], tags: ['comprehension', 'with'], requiredLevel: 4 }),
  stage({ id: 'python-world-bugs', worldId: 'python-world', title: '4. Bugs Clássicos', areaId: 'python', areaIds: ['python'], difficulties: ['iniciante', 'intermediario', 'avancado'], tags: ['bug', 'generator'], requiredLevel: 5 }),
  stage({ id: 'python-world-boss', worldId: 'python-world', title: '5. Boss Python', areaId: 'python', areaIds: ['python'], difficulties: ['iniciante', 'intermediario', 'avancado'], tags: ['sintaxe', 'with'], requiredLevel: 6 }),

  stage({ id: 'frontend-world-html', worldId: 'frontend-world', title: '1. HTML Semântico', areaId: 'html', areaIds: ['html'], difficulties: ['iniciante', 'intermediario'], tags: ['semantica', 'a11y'], requiredLevel: 4 }),
  stage({ id: 'frontend-world-css', worldId: 'frontend-world', title: '2. CSS Layout', areaId: 'css', areaIds: ['css'], difficulties: ['iniciante', 'intermediario'], tags: ['layout', 'responsivo'], requiredLevel: 4 }),
  stage({ id: 'frontend-world-dom', worldId: 'frontend-world', title: '3. DOM e JavaScript', areaId: 'javascript', areaIds: ['javascript', 'html'], difficulties: ['intermediario'], tags: ['dom', 'forms', 'a11y'], requiredLevel: 5 }),
  stage({ id: 'frontend-world-react', worldId: 'frontend-world', title: '4. React e Estado', areaId: 'react', areaIds: ['react'], difficulties: ['intermediario', 'avancado'], tags: ['state', 'props', 'effect'], requiredLevel: 6 }),
  stage({ id: 'frontend-world-boss-ui', worldId: 'frontend-world', title: '5. Boss UI Responsiva', areaId: 'react', areaIds: ['html', 'css', 'javascript', 'react'], difficulties: ['intermediario', 'avancado'], tags: ['a11y', 'performance', 'responsivo'], requiredLevel: 7 }),

  stage({ id: 'backend-world-node', worldId: 'backend-world', title: '1. Node.js Runtime', areaId: 'node', areaIds: ['node'], difficulties: ['iniciante', 'intermediario'], requiredLevel: 5 }),
  stage({ id: 'backend-world-rest', worldId: 'backend-world', title: '2. APIs REST', areaId: 'rest', areaIds: ['rest'], difficulties: ['iniciante', 'intermediario'], requiredLevel: 5 }),
  stage({ id: 'backend-world-java', worldId: 'backend-world', title: '3. Java Profissional', areaId: 'java', areaIds: ['java'], difficulties: ['intermediario'], requiredLevel: 6 }),
  stage({ id: 'backend-world-kotlin', worldId: 'backend-world', title: '4. Kotlin Seguro', areaId: 'kotlin', areaIds: ['kotlin'], difficulties: ['intermediario', 'avancado'], requiredLevel: 7 }),
  stage({ id: 'backend-world-csharp', worldId: 'backend-world', title: '5. C# e Arquitetura', areaId: 'csharp', areaIds: ['csharp', 'node', 'rest'], difficulties: ['intermediario', 'avancado'], requiredLevel: 8 }),

  stage({ id: 'database-world-sql', worldId: 'database-world', title: '1. SELECT e Filtros', areaId: 'sql', areaIds: ['sql'], difficulties: ['iniciante', 'intermediario', 'avancado'], tags: ['select', 'where'], requiredLevel: 6 }),
  stage({ id: 'database-world-joins', worldId: 'database-world', title: '2. Relacionamentos', areaId: 'sql', areaIds: ['sql'], difficulties: ['iniciante', 'intermediario', 'avancado'], tags: ['join', 'modelagem'], requiredLevel: 6 }),
  stage({ id: 'database-world-analytics', worldId: 'database-world', title: '3. Agregações', areaId: 'sql', areaIds: ['sql'], difficulties: ['iniciante', 'intermediario', 'avancado'], tags: ['group', 'transaction'], requiredLevel: 7 }),
  stage({ id: 'database-world-security', worldId: 'database-world', title: '4. Segurança e Performance', areaId: 'sql', areaIds: ['sql'], difficulties: ['iniciante', 'intermediario', 'avancado'], tags: ['security', 'performance'], requiredLevel: 8 }),
  stage({ id: 'database-world-boss', worldId: 'database-world', title: '5. Boss SQL', areaId: 'sql', areaIds: ['sql'], difficulties: ['iniciante', 'intermediario', 'avancado'], tags: ['modelagem', 'transaction'], requiredLevel: 9 }),

  stage({ id: 'pro-world-git', worldId: 'pro-world', title: '1. Git em Time', areaId: 'git', areaIds: ['git'], difficulties: ['iniciante', 'intermediario'], requiredLevel: 7, premium: true }),
  stage({ id: 'pro-world-rest', worldId: 'pro-world', title: '2. Contratos REST', areaId: 'rest', areaIds: ['rest'], difficulties: ['intermediario', 'avancado'], requiredLevel: 8, premium: true }),
  stage({ id: 'pro-world-interview', worldId: 'pro-world', title: '3. Entrevista Técnica', areaId: 'interview', areaIds: ['interview'], difficulties: ['iniciante', 'intermediario'], requiredLevel: 9, premium: true }),
  stage({ id: 'pro-world-system-thinking', worldId: 'pro-world', title: '4. Debug e Design', areaId: 'interview', areaIds: ['interview', 'rest'], difficulties: ['intermediario', 'avancado'], tags: ['debug', 'design', 'qa'], requiredLevel: 10, premium: true }),
  stage({ id: 'pro-world-boss', worldId: 'pro-world', title: '5. Entrevista Final', areaId: 'interview', areaIds: ['interview', 'git', 'rest'], difficulties: ['avancado'], requiredLevel: 11, premium: true })
];

export function areaName(areaId: AreaId) {
  const names: Record<AreaId, string> = {
    logic: 'Lógica',
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
    java: 'Java',
    kotlin: 'Kotlin',
    csharp: 'C#',
    sql: 'SQL',
    html: 'HTML',
    css: 'CSS',
    react: 'React',
    node: 'Node.js',
    git: 'Git',
    rest: 'APIs REST',
    interview: 'Entrevista Técnica'
  };
  return names[areaId];
}
