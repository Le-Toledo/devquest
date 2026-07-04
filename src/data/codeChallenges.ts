import { AreaId, Difficulty } from '../types/game';
import { CodeChallenge, CodeChallengeKind } from '../types/codeArena';

type ChallengeConfig = Pick<CodeChallenge, 'language' | 'areaId'> & {
  prefix: string;
  count: number;
  concepts: string[];
  correct: string[];
  snippets: string[];
};

const configs: ChallengeConfig[] = [
  { language: 'JavaScript', areaId: 'javascript', prefix: 'arena-js', count: 50, concepts: ['arrays', 'async', 'DOM', 'closures', 'eventos', 'performance'], correct: ['filter', 'await', 'addEventListener', 'return', 'map', 'Promise.all'], snippets: ['const active = users.____((u) => u.active);', 'const data = ____ fetch(url);', 'button.____("click", save);'] },
  { language: 'TypeScript', areaId: 'typescript', prefix: 'arena-ts', count: 40, concepts: ['interfaces', 'unions', 'unknown', 'generics', 'guards'], correct: ['interface', 'unknown', 'extends', 'value is User', 'never'], snippets: ['____ User { id: string }', 'function parse(value: ____) {}', 'type Result<T> = { data: T ____ }'] },
  { language: 'Python', areaId: 'python', prefix: 'arena-python', count: 50, concepts: ['listas', 'dicts', 'with', 'generators', 'comprehension'], correct: ['sum', 'get', 'with', 'yield', 'enumerate'], snippets: ['total = ____(items)', 'name = user.____("name", "")', '____ open(path) as file:'] },
  { language: 'Java', areaId: 'java', prefix: 'arena-java', count: 50, concepts: ['OOP', 'Collections', 'equals', 'generics', 'streams'], correct: ['String', 'equals', 'ArrayList', 'List<String>', 'stream'], snippets: ['private ____ name;', 'if (name.____(other)) {}', '____<User> users = new ArrayList<>();'] },
  { language: 'Kotlin', areaId: 'kotlin', prefix: 'arena-kotlin', count: 50, concepts: ['null safety', 'data class', 'sealed', 'coroutines', 'collections'], correct: ['?:', 'data class', 'sealed interface', 'suspend', 'map'], snippets: ['val name = user?.name ____ "Anon"', '____ User(val id: String)', '____ fun loadUser()'] },
  { language: 'SQL', areaId: 'sql', prefix: 'arena-sql', count: 50, concepts: ['SELECT', 'JOIN', 'GROUP BY', 'indices', 'transacoes'], correct: ['WHERE', 'JOIN', 'GROUP BY', 'INDEX', 'COMMIT'], snippets: ['SELECT * FROM users ____ active = 1;', 'SELECT * FROM orders ____ users ON users.id = orders.user_id;', 'SELECT status, COUNT(*) FROM orders ____ status;'] },
  { language: 'HTML', areaId: 'html', prefix: 'arena-html', count: 30, concepts: ['semantica', 'links', 'formularios', 'a11y', 'metadata'], correct: ['main', 'a', 'label', 'alt', 'title'], snippets: ['<____>Conteudo</____>', '<____ href="/perfil">Perfil</____>', '<____ for="email">Email</____>'] },
  { language: 'CSS', areaId: 'css', prefix: 'arena-css', count: 30, concepts: ['flexbox', 'grid', 'responsividade', 'tokens', 'foco'], correct: ['flex', 'grid', '@media', 'var(--space-md)', ':focus-visible'], snippets: ['.row { display: ____; }', '.layout { display: ____; }', '____ (max-width: 600px) { }'] },
  { language: 'React', areaId: 'react', prefix: 'arena-react', count: 40, concepts: ['state', 'props', 'effects', 'keys', 'memo'], correct: ['useState', 'props', 'useEffect', 'key', 'useMemo'], snippets: ['const [count, setCount] = ____(0);', 'function Card(____) { return null; }', '____(() => { load(); }, []);'] },
  { language: 'Node.js', areaId: 'node', prefix: 'arena-node', count: 40, concepts: ['rotas', 'middleware', 'env', 'event loop', 'erros'], correct: ['get', 'next', 'process.env', 'try/catch', 'worker_threads'], snippets: ['app.____("/health", handler);', 'function auth(req, res, ____) {}', 'const key = ____.API_KEY;'] },
  { language: 'APIs REST', areaId: 'rest', prefix: 'arena-rest', count: 40, concepts: ['GET', 'POST', 'status', 'auth', 'paginacao'], correct: ['GET', 'POST', '404', 'Authorization', 'limit'], snippets: ['____ /api/users', '____ /api/users { name }', 'Not found -> ____'] },
  { language: 'Git', areaId: 'git', prefix: 'arena-git', count: 40, concepts: ['commit', 'branch', 'merge', 'rebase', 'CI'], correct: ['commit', 'checkout -b', 'merge', 'rebase', 'pull request'], snippets: ['git ____ -m "fix"', 'git ____ feature/login', 'git ____ main'] },
  { language: 'Entrevista', areaId: 'interview', prefix: 'arena-interview', count: 60, concepts: ['trade-offs', 'debug', 'complexidade', 'testes', 'comunicacao'], correct: ['explicar trade-offs', 'formular hipotese', 'tempo e memoria', 'casos de borda', 'pensar em voz alta'], snippets: ['Problema -> alternativas -> ____', 'Bug -> reproduzir -> ____', 'Solucao -> custo de ____'] }
];

const kinds: CodeChallengeKind[] = ['complete-code', 'bug-hunt', 'order-blocks', 'best-solution', 'simulate-output', 'refactor'];
const difficulties: Difficulty[] = ['iniciante', 'intermediario', 'avancado'];

const pad = (value: number) => String(value).padStart(3, '0');

const optionsFor = (correct: string, index: number) => {
  const distractors = ['undefined', 'return false', 'console.log', 'any'];
  const options = [correct, ...distractors.filter((item) => item !== correct).slice(0, 3)];
  const shift = index % options.length;
  const rotated = [...options.slice(shift), ...options.slice(0, shift)];
  return { options: rotated, correctIndex: rotated.indexOf(correct) };
};

export const codeChallenges: CodeChallenge[] = configs.flatMap((config) =>
  Array.from({ length: config.count }, (_, itemIndex) => {
    const index = itemIndex + 1;
    const concept = config.concepts[itemIndex % config.concepts.length] ?? config.concepts[0] ?? config.language;
    const correct = config.correct[itemIndex % config.correct.length] ?? config.correct[0] ?? 'return';
    const code = config.snippets[itemIndex % config.snippets.length] ?? `${config.language}: ____`;
    const difficulty = difficulties[Math.floor((itemIndex / config.count) * difficulties.length)] ?? 'iniciante';
    const kind = kinds[itemIndex % kinds.length] ?? 'complete-code';
    const { options, correctIndex } = optionsFor(correct, itemIndex);

    return {
      id: `${config.prefix}-${concept.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${pad(index)}`,
      title: `${config.language}: ${concept}`,
      description: `Resolva um desafio de ${concept} em ${config.language}, sem executar codigo real.`,
      areaId: config.areaId,
      language: config.language,
      difficulty,
      kind,
      code,
      options,
      correctIndex,
      explanation: `"${correct}" e a melhor resposta para este trecho porque resolve o foco de ${concept} sem criar efeito colateral desnecessario.`,
      hint: `Leia o trecho como se estivesse revisando PR: encontre a lacuna ligada a ${concept}.`,
      xpReward: difficulty === 'avancado' ? 180 : difficulty === 'intermediario' ? 130 : 90,
      coinReward: difficulty === 'avancado' ? 70 : difficulty === 'intermediario' ? 50 : 35
    };
  })
);

export const codeChallengeById = (id: string) => codeChallenges.find((challenge) => challenge.id === id);

export const recommendedCodeChallengeFor = (areaId?: AreaId) => {
  const candidates = codeChallenges.filter((challenge) => challenge.areaId === areaId);
  return candidates[0] ?? codeChallenges[0];
};
