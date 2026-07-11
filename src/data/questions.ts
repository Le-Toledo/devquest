import { AreaId, Difficulty, Question, QuestionKind, QuestionType } from '../types/game';
import { filterValidQuestions } from '../services/questionBankValidation';

type Topic = {
  slug: string;
  label: string;
  correct: string;
  distractors: [string, string, string];
  explanation: string;
  hint: string;
  tags: string[];
};

type AreaBank = {
  areaId: AreaId;
  prefix: string;
  displayName: string;
  count: number;
  topics: Topic[];
};

const pointsByDifficulty: Record<Difficulty, number> = {
  iniciante: 80,
  intermediario: 120,
  avancado: 180
};

const difficulties: Difficulty[] = ['iniciante', 'intermediario', 'avancado'];
const kinds: QuestionKind[] = ['quiz', 'complete-code', 'bug-hunt', 'order-blocks', 'best-solution'];

const typeByKind: Record<QuestionKind, QuestionType> = {
  quiz: 'conceito',
  'complete-code': 'codigo',
  'bug-hunt': 'bug',
  'order-blocks': 'codigo',
  'best-solution': 'quiz'
};

const pad = (value: number) => String(value).padStart(3, '0');

const textReplacements: [RegExp, string][] = [
  [/\bvoce\b/g, 'você'],
  [/\bVoce\b/g, 'Você'],
  [/\bnao\b/g, 'não'],
  [/\bNao\b/g, 'Não'],
  [/\bLogica\b/g, 'Lógica'],
  [/\blogica\b/g, 'lógica'],
  [/\bo bug e\b/g, 'o bug é'],
  [/\bO erro central e\b/g, 'O erro central é'],
  [/\balternativa e\b/g, 'alternativa é'],
  [/\bprint e função\b/g, 'print é função'],
  [/\bGET e seguro\b/g, 'GET é seguro'],
  [/\bEntrada não e código\b/g, 'Entrada não é código'],
  [/\bcodigo\b/g, 'código'],
  [/\bCodigo\b/g, 'Código'],
  [/\bvalidacao\b/g, 'validação'],
  [/\bcomparacoes\b/g, 'comparações'],
  [/\bsolucao\b/g, 'solução'],
  [/\bsolucoes\b/g, 'soluções'],
  [/\bdecisao\b/g, 'decisão'],
  [/\bcenario\b/g, 'cenário'],
  [/\bpratico\b/g, 'prático'],
  [/\bpratica\b/g, 'prática'],
  [/\bavancado\b/g, 'avançado'],
  [/\bNivel\b/g, 'Nível'],
  [/\bnivel\b/g, 'nível'],
  [/\bsequencia\b/g, 'sequência'],
  [/\baleatoria\b/g, 'aleatória'],
  [/\bopcao\b/g, 'opção'],
  [/\blegivel\b/g, 'legível'],
  [/\brevisavel\b/g, 'revisável'],
  [/\bintencao\b/g, 'intenção'],
  [/\bpedagogico\b/g, 'pedagógico'],
  [/\bmetodo\b/g, 'método'],
  [/\bMetodo\b/g, 'Método'],
  [/\bdecomposicao\b/g, 'decomposição'],
  [/\bsaida\b/g, 'saída'],
  [/\bsaidas\b/g, 'saídas'],
  [/\bnumero\b/g, 'número'],
  [/\bverificavel\b/g, 'verificável'],
  [/\bmissoes\b/g, 'missões'],
  [/\bultimo\b/g, 'último'],
  [/\bbinario\b/g, 'binário'],
  [/\bbinaria\b/g, 'binária'],
  [/\bespaco\b/g, 'espaço'],
  [/\bEspacos\b/g, 'Espaços'],
  [/\bcondicao\b/g, 'condição'],
  [/\bassincrono\b/g, 'assíncrono'],
  [/\bfuncao\b/g, 'função'],
  [/\bFuncao\b/g, 'Função'],
  [/\bfuncoes\b/g, 'funções'],
  [/\bvariaveis\b/g, 'variáveis'],
  [/\binteracoes\b/g, 'interações'],
  [/\busuario\b/g, 'usuário'],
  [/\bvalidas\b/g, 'válidas'],
  [/\bobrigatoria\b/g, 'obrigatória'],
  [/\bobrigatorio\b/g, 'obrigatório'],
  [/\bbasico\b/g, 'básico'],
  [/\bindentacao\b/g, 'indentação'],
  [/\bespacos\b/g, 'espaços'],
  [/\bseguranca\b/g, 'segurança'],
  [/\bsemantico\b/g, 'semântico'],
  [/\bsemantica\b/g, 'semântica'],
  [/\bconteudo\b/g, 'conteúdo'],
  [/\bRegiao\b/g, 'Região'],
  [/\bUnico\b/g, 'Único'],
  [/\bunicos\b/g, 'únicos'],
  [/\breferencias\b/g, 'referências'],
  [/\bmanutencao\b/g, 'manutenção'],
  [/\brotulos\b/g, 'rótulos'],
  [/\btambem\b/g, 'também'],
  [/\brequisicao\b/g, 'requisição'],
  [/\btemporaria\b/g, 'temporária'],
  [/\bcomentario\b/g, 'comentário'],
  [/\baleatorios\b/g, 'aleatórios'],
  [/\bvariaveis\b/g, 'variáveis'],
  [/\bconfiguracoes\b/g, 'configurações'],
  [/\brepositorio\b/g, 'repositório'],
  [/\bmetricas\b/g, 'métricas'],
  [/\blatencia\b/g, 'latência'],
  [/\bautenticacao\b/g, 'autenticação'],
  [/\bautorizacao\b/g, 'autorização'],
  [/\bpermissoes\b/g, 'permissões'],
  [/\bparametros\b/g, 'parâmetros'],
  [/\bnormalizacao\b/g, 'normalização'],
  [/\bduplicacao\b/g, 'duplicação'],
  [/\bdescricao\b/g, 'descrição'],
  [/\brelacoes\b/g, 'relações'],
  [/\bmudancas\b/g, 'mudanças'],
  [/\bcorrecoes\b/g, 'correções'],
  [/\bHistoria\b/g, 'História'],
  [/\bhistoria\b/g, 'história'],
  [/\bdominio\b/g, 'domínio'],
  [/\bdinamica\b/g, 'dinâmica'],
  [/\bmutavel\b/g, 'mutável'],
  [/\bexcecoes\b/g, 'exceções'],
  [/\bconcorrencia\b/g, 'concorrência'],
  [/\bmutacao\b/g, 'mutação'],
  [/\breferencia\b/g, 'referência'],
  [/\bcolecoes\b/g, 'coleções'],
  [/\bausencia\b/g, 'ausência'],
  [/\btransformacoes\b/g, 'transformações'],
  [/\bconfiguracao\b/g, 'configuração'],
  [/\bcomunicacao\b/g, 'comunicação'],
  [/\braciocinio\b/g, 'raciocínio'],
  [/\bmemoria\b/g, 'memória'],
  [/\brapido\b/g, 'rápido'],
  [/\bacao\b/g, 'ação'],
  [/\bregressao\b/g, 'regressão'],
  [/\bconfianca\b/g, 'confiança'],
  [/\bjargao\b/g, 'jargão'],
  [/\bbasico\b/g, 'básico']
];

const pt = (value: string) => textReplacements.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value);

const topic = (
  slug: string,
  label: string,
  correct: string,
  distractors: [string, string, string],
  explanation: string,
  hint: string,
  tags: string[]
): Topic => ({ slug, label, correct, distractors, explanation, hint, tags });

const optionSetFor = (questionId: string, correct: string, distractors: [string, string, string], index: number) => {
  const entries = [
    { id: `${questionId}:correct`, text: correct },
    { id: `${questionId}:distractor-1`, text: distractors[0] },
    { id: `${questionId}:distractor-2`, text: distractors[1] },
    { id: `${questionId}:distractor-3`, text: distractors[2] }
  ];
  const shift = index % entries.length;
  const rotated = [...entries.slice(shift), ...entries.slice(0, shift)];
  return {
    options: rotated.map((entry) => entry.text),
    optionIds: rotated.map((entry) => entry.id),
    correctIndex: rotated.findIndex((entry) => entry.id === `${questionId}:correct`),
    correctAnswerId: `${questionId}:correct`
  };
};

type Variant = {
  skill: string;
  module: string;
  topic: string;
  objective: string;
  prompt: string;
  code?: string;
  correct: string;
  distractors: [string, string, string];
  explanation: string;
  hint: string;
  tags: string[];
};

type CompletionScenario = {
  module: string;
  topic: string;
  objective: string;
  prompt: string;
  code: string;
  correct: string;
  distractors: [string, string, string];
  explanation: string;
  hint: string;
  tags: string[];
};

const promptFor = (area: AreaBank, topicItem: Topic, kind: QuestionKind, difficulty: Difficulty, index: number) => {
  const contextByDifficulty: Record<Difficulty, string> = {
    iniciante: `Você está revisando ${topicItem.label} em ${area.displayName}.`,
    intermediario: `Durante uma revisão de código em ${area.displayName}, aparece uma decisão ligada a ${topicItem.label}.`,
    avancado: `Em um projeto real de ${area.displayName}, uma escolha sobre ${topicItem.label} pode afetar manutenção, testes e evolução.`
  };
  const context = contextByDifficulty[difficulty];
  const promptsByKind: Record<QuestionKind, string[]> = {
    quiz: [
      `${context} Qual alternativa descreve melhor quando esse conceito deve ser usado?`,
      `${context} Que decisão mostra entendimento correto desse conceito?`,
      `${context} Qual opção evita uma interpretação superficial do problema?`
    ],
    'complete-code': [
      `${context} Qual alternativa completa o trecho mantendo a intenção do código?`,
      `${context} O que deve entrar na lacuna para o código expressar a regra correta?`,
      `${context} Qual escolha completa o exemplo sem mudar o objetivo do trecho?`
    ],
    'bug-hunt': [
      `${context} Qual alternativa identifica a causa do problema no trecho?`,
      `${context} Em uma investigação de bug, qual opção aponta a regra que foi quebrada?`,
      `${context} Qual diagnóstico ajudaria a corrigir o erro sem reescrever tudo?`
    ],
    'order-blocks': [
      `${context} Qual sequência de passos resolveria melhor esse caso?`,
      `${context} Em que ordem uma pessoa experiente analisaria esse problema?`,
      `${context} Qual fluxo reduz tentativa aleatória e valida o resultado?`
    ],
    'best-solution': [
      `${context} Qual alternativa seria mais sustentável em um projeto real?`,
      `${context} Qual solução equilibra clareza, segurança e manutenção?`,
      `${context} Qual escolha passaria melhor por uma revisão técnica?`
    ]
  };
  return promptsByKind[kind][index % promptsByKind[kind].length] ?? promptsByKind[kind][0];
};

const answerContext: Record<Difficulty, string> = {
  iniciante: 'em um caso simples',
  intermediario: 'durante uma revisão de código',
  avancado: 'considerando manutenção, testes e evolução'
};

const completionScenarios: Record<AreaId, CompletionScenario[]> = {
  logic: [
    { module: 'Lógica', topic: 'condicionais', objective: 'Escolher o bloco correto quando uma regra booleana é verdadeira.', prompt: 'Qual chamada completa o trecho para executar a ação apenas quando a regra é válida?', code: 'if (pedido.isValid) {\n  ____();\n}', correct: 'processOrder', distractors: ['renderCss', 'dropTable', 'commitFile'], explanation: 'processOrder completa o trecho porque representa a ação de processar o pedido depois que a condição foi validada. O código final fica: if (pedido.isValid) { processOrder(); }.', hint: 'A lacuna pede uma ação de domínio, não uma operação visual ou de infraestrutura.', tags: ['condicional', 'fluxo'] },
    { module: 'Lógica', topic: 'loops', objective: 'Escolher a estrutura que percorre uma coleção.', prompt: 'Qual palavra-chave completa o trecho para percorrer todos os itens?', code: '____ (const item of items) {\n  total += item.value;\n}', correct: 'for', distractors: ['if', 'try', 'new'], explanation: 'for completa o trecho porque cria um loop sobre os itens. O código final fica: for (const item of items) { total += item.value; }.', hint: 'A presença de "of items" indica uma iteração.', tags: ['loop', 'iteracao'] }
  ],
  javascript: [
    { module: 'JavaScript', topic: 'map em arrays', objective: 'Transformar cada item de uma lista em outro valor.', prompt: 'Qual método completa o trecho para transformar usuários em nomes?', code: 'const names = users.____((user) => user.name);', correct: 'map', distractors: ['filter', 'find', 'forEach'], explanation: 'map completa o trecho porque retorna um novo array com o resultado da transformação de cada item. O código final fica: const names = users.map((user) => user.name);.', hint: 'A saída precisa continuar sendo uma lista, mas com outro formato.', tags: ['array', 'map'] },
    { module: 'JavaScript', topic: 'filter em arrays', objective: 'Manter somente itens que passam em uma condição.', prompt: 'Qual método completa o trecho para manter apenas usuários ativos?', code: 'const activeUsers = users.____((user) => user.active);', correct: 'filter', distractors: ['map', 'reduce', 'push'], explanation: 'filter completa o trecho porque mantém os itens cujo predicado retorna verdadeiro. O código final fica: const activeUsers = users.filter((user) => user.active);.', hint: 'A função retorna verdadeiro ou falso para cada item.', tags: ['array', 'filter'] },
    { module: 'JavaScript', topic: 'async/await', objective: 'Aguardar uma Promise antes de usar seu resultado.', prompt: 'Qual palavra-chave completa o trecho para esperar a resposta da API?', code: 'const response = ____ fetch("/api/users");', correct: 'await', distractors: ['async', 'return', 'yield'], explanation: 'await completa o trecho porque aguarda a Promise retornada por fetch antes de seguir. O código final fica: const response = await fetch("/api/users");.', hint: 'A lacuna fica antes de uma chamada que retorna Promise.', tags: ['async', 'fetch'] }
  ],
  typescript: [
    { module: 'TypeScript', topic: 'type alias', objective: 'Declarar um contrato de dados reutilizável.', prompt: 'Qual palavra-chave completa o trecho para declarar o formato de Payload?', code: '____ Payload = {\n  status: "ok";\n  data: string[];\n};', correct: 'type', distractors: ['const', 'enum', 'return'], explanation: 'type completa o trecho porque cria um alias de tipo para o payload. O código final fica: type Payload = { status: "ok"; data: string[]; };.', hint: 'A declaração descreve formato para o compilador, não valor de runtime.', tags: ['tipos', 'type'] },
    { module: 'TypeScript', topic: 'interfaces', objective: 'Descrever o contrato de um objeto.', prompt: 'Qual palavra-chave completa o trecho para declarar um contrato de usuário?', code: '____ User {\n  id: string;\n  name: string;\n}', correct: 'interface', distractors: ['function', 'await', 'className'], explanation: 'interface completa o trecho porque declara o contrato estrutural de User. O código final fica: interface User { id: string; name: string; }.', hint: 'A lacuna aparece antes de um nome e um bloco de propriedades.', tags: ['interface', 'tipos'] }
  ],
  python: [
    { module: 'Python', topic: 'print', objective: 'Exibir uma mensagem no terminal.', prompt: 'Qual função completa o trecho para mostrar a mensagem?', code: '____("Code Quest")', correct: 'print', distractors: ['console.log', 'echo', 'System.out'], explanation: 'print completa o trecho porque é a função embutida de Python para saída simples no terminal. O código final fica: print("Code Quest").', hint: 'Em Python, a função de saída simples tem cinco letras.', tags: ['basico', 'saida'] },
    { module: 'Python', topic: 'len', objective: 'Obter o tamanho de uma coleção.', prompt: 'Qual função completa o trecho para contar os itens da lista?', code: 'total = ____(items)', correct: 'len', distractors: ['size', 'count()', 'length'], explanation: 'len completa o trecho porque retorna a quantidade de itens em uma coleção Python. O código final fica: total = len(items).', hint: 'É uma função embutida curta, não uma propriedade da lista.', tags: ['lista', 'basico'] }
  ],
  java: [
    { module: 'Java', topic: 'modificadores de acesso', objective: 'Declarar um campo encapsulado dentro da classe.', prompt: 'Qual modificador completa o trecho para manter o campo encapsulado?', code: 'public class Service {\n  ____ String name;\n}', correct: 'private', distractors: ['package', 'static void', 'return'], explanation: 'private completa o trecho porque restringe o acesso direto ao campo dentro da classe. O código final fica: public class Service { private String name; }.', hint: 'O campo não deve ficar exposto publicamente.', tags: ['oop', 'encapsulamento'] },
    { module: 'Java', topic: 'ArrayList', objective: 'Instanciar uma lista dinâmica tipada.', prompt: 'Qual classe completa o trecho para criar uma lista dinâmica?', code: 'List<String> names = new ____<>();', correct: 'ArrayList', distractors: ['String', 'HashMap', 'Thread'], explanation: 'ArrayList completa o trecho porque implementa List com tamanho dinâmico. O código final fica: List<String> names = new ArrayList<>();.', hint: 'A variável é do tipo List e precisa de uma implementação de lista.', tags: ['collections', 'arraylist'] }
  ],
  kotlin: [
    { module: 'Kotlin', topic: 'null safety', objective: 'Fornecer fallback quando o valor pode ser nulo.', prompt: 'Qual operador completa o trecho para usar fallback quando profile for nulo?', code: 'val result = user.profile ____ fallback', correct: '?:', distractors: ['?.', '!!', '=='], explanation: '?: completa o trecho porque é o operador Elvis usado para retornar fallback quando o lado esquerdo é nulo. O código final fica: val result = user.profile ?: fallback.', hint: 'O operador parece uma pergunta seguida de dois-pontos.', tags: ['null', 'elvis'] },
    { module: 'Kotlin', topic: 'val', objective: 'Declarar uma referência somente leitura.', prompt: 'Qual palavra-chave completa o trecho para declarar um valor que não será reatribuído?', code: '____ total = items.size', correct: 'val', distractors: ['var', 'let', 'const'], explanation: 'val completa o trecho porque declara uma referência somente leitura em Kotlin. O código final fica: val total = items.size.', hint: 'Use a palavra-chave de imutabilidade de referência.', tags: ['sintaxe', 'imutabilidade'] }
  ],
  csharp: [
    { module: 'C#', topic: 'propriedades', objective: 'Declarar uma propriedade pública.', prompt: 'Qual palavra-chave completa o trecho para expor a propriedade Name?', code: 'public ____ Name { get; init; }', correct: 'string', distractors: ['var', 'class', 'await'], explanation: 'string completa o trecho porque define o tipo da propriedade Name. O código final fica: public string Name { get; init; }.', hint: 'Name armazena texto, então precisa de um tipo textual.', tags: ['property', 'tipos'] },
    { module: 'C#', topic: 'async/await', objective: 'Aguardar uma tarefa assíncrona.', prompt: 'Qual palavra-chave completa o trecho para esperar a operação assíncrona?', code: 'var user = ____ repository.GetUserAsync(id);', correct: 'await', distractors: ['async', 'yield', 'new'], explanation: 'await completa o trecho porque aguarda a Task retornada por GetUserAsync. O código final fica: var user = await repository.GetUserAsync(id);.', hint: 'A chamada termina com Async e retorna uma operação futura.', tags: ['async', 'task'] }
  ],
  sql: [
    { module: 'SQL', topic: 'SELECT', objective: 'Selecionar colunas em uma consulta.', prompt: 'Qual palavra-chave completa o trecho para buscar dados da tabela users?', code: '____ name FROM users WHERE active = 1;', correct: 'SELECT', distractors: ['DELETE', 'INSERT', 'COMMIT'], explanation: 'SELECT completa o trecho porque inicia uma consulta de leitura. O código final fica: SELECT name FROM users WHERE active = 1;.', hint: 'A consulta lê uma coluna, não altera a tabela.', tags: ['select', 'consulta'] },
    { module: 'SQL', topic: 'WHERE', objective: 'Filtrar linhas por uma condição.', prompt: 'Qual palavra-chave completa o trecho para filtrar usuários ativos?', code: 'SELECT name FROM users ____ active = 1;', correct: 'WHERE', distractors: ['JOIN', 'ORDER', 'TABLE'], explanation: 'WHERE completa o trecho porque aplica uma condição às linhas retornadas. O código final fica: SELECT name FROM users WHERE active = 1;.', hint: 'A lacuna aparece antes da condição booleana.', tags: ['where', 'filtro'] }
  ],
  html: [
    { module: 'HTML', topic: 'main semântico', objective: 'Marcar o conteúdo principal da página.', prompt: 'Qual tag completa o trecho para representar o conteúdo principal?', code: '<____ class="content">CodeQuest</____>', correct: 'main', distractors: ['span', 'script', 'style'], explanation: 'main completa o trecho porque representa a região principal única da página. O código final fica: <main class="content">CodeQuest</main>.', hint: 'A tag semântica indica a região central da página.', tags: ['semantica', 'main'] },
    { module: 'HTML', topic: 'texto alternativo', objective: 'Descrever imagem relevante para acessibilidade.', prompt: 'Qual atributo completa o trecho para descrever a imagem?', code: '<img src="avatar.png" ____="Avatar do jogador" />', correct: 'alt', distractors: ['href', 'target', 'rel'], explanation: 'alt completa o trecho porque descreve a imagem para leitores de tela e fallback. O código final fica: <img src="avatar.png" alt="Avatar do jogador" />.', hint: 'O atributo tem três letras.', tags: ['a11y', 'imagem'] }
  ],
  css: [
    { module: 'CSS', topic: 'espaçamento', objective: 'Aplicar espaçamento interno em um painel.', prompt: 'Qual propriedade completa o trecho para criar espaço interno?', code: '.panel {\n  ____: 16px;\n}', correct: 'padding', distractors: ['margin', 'display', 'fetch'], explanation: 'padding completa o trecho porque controla o espaço interno entre conteúdo e borda. O código final fica: .panel { padding: 16px; }.', hint: 'A propriedade mexe dentro do elemento, não fora dele.', tags: ['layout', 'spacing'] },
    { module: 'CSS', topic: 'Flexbox', objective: 'Ativar layout flexível em uma dimensão.', prompt: 'Qual valor completa o trecho para ativar Flexbox?', code: '.toolbar {\n  display: ____;\n}', correct: 'flex', distractors: ['grid-template', 'absolute', 'SELECT'], explanation: 'flex completa o trecho porque ativa o modelo de layout Flexbox. O código final fica: .toolbar { display: flex; }.', hint: 'O valor pertence à propriedade display.', tags: ['layout', 'flexbox'] }
  ],
  react: [
    { module: 'React', topic: 'useState', objective: 'Criar estado local em componente funcional.', prompt: 'Qual Hook do React completa corretamente o trecho abaixo para criar um estado local?', code: 'const [state, setState] = ____(initialState);', correct: 'useState', distractors: ['useEffect', 'useMemo', 'useRef'], explanation: 'useState é o Hook utilizado para criar e atualizar estado local em componentes funcionais do React. Ele retorna o valor atual do estado e uma função para atualizá-lo. O código final fica: const [state, setState] = useState(initialState);.', hint: 'Observe que o código utiliza desestruturação para obter o valor do estado e sua função de atualização.', tags: ['state', 'hook'] },
    { module: 'React', topic: 'useEffect', objective: 'Executar sincronização depois do render.', prompt: 'Qual Hook completa o trecho para sincronizar o título depois do render?', code: '____(() => {\n  document.title = title;\n}, [title]);', correct: 'useEffect', distractors: ['useState', 'useRef', 'useMemo'], explanation: 'useEffect completa o trecho porque executa efeitos depois do render e reage à mudança de dependências. O código final fica: useEffect(() => { document.title = title; }, [title]);.', hint: 'O array de dependências é uma pista de efeito.', tags: ['effect', 'hook'] },
    { module: 'React', topic: 'props', objective: 'Receber entradas passadas pelo componente pai.', prompt: 'Qual parâmetro completa o trecho para acessar entradas recebidas pelo componente?', code: 'function Card(____) {\n  return <Text>{props.title}</Text>;\n}', correct: 'props', distractors: ['state', 'context', 'effect'], explanation: 'props completa o trecho porque representa as entradas recebidas pelo componente. O código final fica: function Card(props) { return <Text>{props.title}</Text>; }.', hint: 'O corpo já acessa props.title.', tags: ['props', 'componentes'] }
  ],
  node: [
    { module: 'Node.js', topic: 'rotas Express', objective: 'Registrar uma rota HTTP GET.', prompt: 'Qual método completa o trecho para registrar uma rota de leitura?', code: 'app.____("/health", handler);', correct: 'get', distractors: ['map', 'render', 'commit'], explanation: 'get completa o trecho porque registra um handler para requisições HTTP GET no Express. O código final fica: app.get("/health", handler);.', hint: 'A rota de health normalmente é uma leitura.', tags: ['express', 'http'] },
    { module: 'Node.js', topic: 'erros assíncronos', objective: 'Aguardar uma operação antes de responder.', prompt: 'Qual palavra-chave completa o trecho para esperar a consulta assíncrona?', code: 'const users = ____ repository.listUsers();', correct: 'await', distractors: ['async', 'new', 'throw'], explanation: 'await completa o trecho porque aguarda a Promise da consulta antes de usar o resultado. O código final fica: const users = await repository.listUsers();.', hint: 'A chamada retorna uma operação assíncrona.', tags: ['async', 'promise'] }
  ],
  git: [
    { module: 'Git/GitHub', topic: 'commits', objective: 'Criar um commit com mensagem.', prompt: 'Qual subcomando completa o trecho para registrar as mudanças com mensagem?', code: 'git ____ -m "ajuste do desafio"', correct: 'commit', distractors: ['status', 'branch', 'pull'], explanation: 'commit completa o trecho porque grava uma unidade de mudança no histórico. O código final fica: git commit -m "ajuste do desafio".', hint: 'A flag -m acompanha a mensagem do registro.', tags: ['commit', 'workflow'] },
    { module: 'Git/GitHub', topic: 'status', objective: 'Verificar arquivos modificados e staged.', prompt: 'Qual subcomando completa o trecho para ver o estado do repositório?', code: 'git ____', correct: 'status', distractors: ['push', 'merge', 'clone'], explanation: 'status completa o trecho porque mostra branch, staged e arquivos modificados. O código final fica: git status.', hint: 'É o comando que você roda antes de decidir o próximo passo.', tags: ['git', 'status'] }
  ],
  rest: [
    { module: 'APIs REST', topic: 'GET', objective: 'Buscar um recurso sem alterar estado.', prompt: 'Qual método HTTP completa o trecho para consultar um usuário?', code: '____ /api/users/42', correct: 'GET', distractors: ['POST', 'DELETE', 'PATCH'], explanation: 'GET completa o trecho porque representa uma leitura segura do recurso. O código final fica: GET /api/users/42.', hint: 'A rota está buscando um usuário específico.', tags: ['http', 'get'] },
    { module: 'APIs REST', topic: 'POST', objective: 'Enviar dados para criar um recurso.', prompt: 'Qual método HTTP completa o trecho para criar um novo usuário?', code: '____ /api/users', correct: 'POST', distractors: ['GET', 'DELETE', 'OPTIONS'], explanation: 'POST completa o trecho porque envia dados para criação ou processamento. O código final fica: POST /api/users.', hint: 'Criar um recurso normalmente usa envio de corpo.', tags: ['http', 'post'] }
  ],
  interview: [
    { module: 'Entrevista Técnica', topic: 'comunicação', objective: 'Organizar a explicação em etapas claras.', prompt: 'Qual etapa completa o roteiro para fechar a resposta com maturidade técnica?', code: 'problema -> trade-off -> ____', correct: 'validacao', distractors: ['culpa', 'silencio', 'atalho'], explanation: 'validacao completa o roteiro porque uma resposta madura mostra como confirmar que a escolha funciona. O roteiro final fica: problema -> trade-off -> validacao.', hint: 'Depois de explicar escolhas, mostre como provar que elas funcionam.', tags: ['comunicacao', 'validacao'] },
    { module: 'Entrevista Técnica', topic: 'debugging', objective: 'Testar uma hipótese por vez.', prompt: 'Qual palavra completa o fluxo profissional de investigação?', code: 'hipotese -> teste -> ____', correct: 'conclusao', distractors: ['achismo', 'mudanca-total', 'silencio'], explanation: 'conclusao completa o fluxo porque cada teste precisa gerar aprendizado antes do próximo passo. O fluxo final fica: hipotese -> teste -> conclusao.', hint: 'O último passo registra o que o teste provou.', tags: ['debug', 'hipotese'] }
  ]
};

const completionScenarioFor = (areaId: AreaId, index: number) => {
  const scenarios = completionScenarios[areaId];
  return scenarios[Math.floor(Math.max(0, index - 2) / kinds.length) % scenarios.length] ?? scenarios[0];
};

const completionPromptFor = (scenario: CompletionScenario, difficulty: Difficulty, index: number) => {
  const contexts = [
    'Analise a lacuna pelo papel do trecho, não por palavra solta.',
    'Escolha a alternativa que poderia substituir exatamente os quatro underscores.',
    'Considere que o trecho precisa continuar sintaticamente correto.',
    'Pense no resultado final depois que a lacuna for preenchida.',
    'Use o contexto do código para eliminar opções de outro conceito.',
    'Procure a opção que mantém a intenção original do exemplo.'
  ];
  const difficultyContext: Record<Difficulty, string> = {
    iniciante: 'Cenário inicial.',
    intermediario: 'Cenário de revisão.',
    avancado: 'Cenário de manutenção.'
  };
  return `${scenario.prompt} ${difficultyContext[difficulty]} ${contexts[Math.floor(Math.max(0, index - 2) / kinds.length) % contexts.length]}`;
};

const variantFor = (area: AreaBank, topicItem: Topic, kind: QuestionKind, difficulty: Difficulty, index: number): Variant => {
  const basePrompt = promptFor(area, topicItem, kind, difficulty, index);
  const skillByKind: Record<QuestionKind, string> = {
    quiz: 'conceito',
    'complete-code': 'completar-codigo',
    'bug-hunt': 'diagnosticar-bug',
    'order-blocks': 'sequenciar-raciocinio',
    'best-solution': 'escolher-pratica'
  };
  const skill = `${skillByKind[kind]}-${difficulty}`;

  if (kind === 'complete-code') {
    const scenario = completionScenarioFor(area.areaId, index);
    return {
      skill,
      module: scenario.module,
      topic: scenario.topic,
      objective: scenario.objective,
      prompt: completionPromptFor(scenario, difficulty, index),
      code: scenario.code,
      correct: scenario.correct,
      distractors: scenario.distractors,
      explanation: scenario.explanation,
      hint: scenario.hint,
      tags: [...scenario.tags, skill, 'codigo']
    };
  }

  if (kind === 'bug-hunt') {
    return {
      skill,
      module: area.displayName,
      topic: topicItem.label,
      objective: `Diagnosticar um problema ligado a ${topicItem.label}.`,
      prompt: basePrompt,
      correct: `o bug e ignorar ${topicItem.correct} ${answerContext[difficulty]}`,
      distractors: [
        `o bug e usar ${topicItem.distractors[0]}`,
        `o bug e a falta de ${topicItem.distractors[1]}`,
        `o bug e trocar tudo por ${topicItem.distractors[2]}`
      ],
      explanation: `O erro central e ignorar ${topicItem.correct}. ${topicItem.explanation} Em bugs reais, a melhor resposta aponta a regra quebrada e permite corrigir sem reescrever tudo.`,
      hint: `${topicItem.hint} Pergunte qual regra foi violada.`,
      tags: [...topicItem.tags, skill, 'bug']
    };
  }

  if (kind === 'order-blocks') {
    return {
      skill,
      module: area.displayName,
      topic: topicItem.label,
      objective: `Sequenciar uma solução ligada a ${topicItem.label}.`,
      prompt: basePrompt,
      correct: `entender o objetivo -> aplicar ${topicItem.correct} -> validar o resultado ${answerContext[difficulty]}`,
      distractors: [
        `copiar ${topicItem.distractors[0]} -> testar depois -> ajustar se quebrar`,
        `escolher ${topicItem.distractors[1]} -> ignorar entrada -> publicar`,
        `trocar por ${topicItem.distractors[2]} -> remover validacao -> seguir`
      ],
      explanation: `A ordem correta começa pelo objetivo, aplica ${topicItem.correct} e valida o resultado. ${topicItem.explanation} Sequenciar bem reduz tentativa aleatoria e melhora debugging.`,
      hint: `${topicItem.hint} Primeiro entenda o problema, depois escolha a ferramenta.`,
      tags: [...topicItem.tags, skill, 'sequencia']
    };
  }

  if (kind === 'best-solution') {
    return {
      skill,
      module: area.displayName,
      topic: topicItem.label,
      objective: `Escolher a prática mais sustentável para ${topicItem.label}.`,
      prompt: basePrompt,
      correct: `${topicItem.correct}, com nomes claros e validacao do caso de uso ${answerContext[difficulty]}`,
      distractors: [
        `${topicItem.distractors[0]}, porque parece mais rapido no primeiro teste`,
        `${topicItem.distractors[1]}, mesmo sem validar o objetivo do problema`,
        `${topicItem.distractors[2]}, para evitar pensar no cenario real`
      ],
      explanation: `A melhor solucao usa ${topicItem.correct} com intencao clara. ${topicItem.explanation} Em projeto real, a escolha precisa ser legivel, revisavel e adequada ao caso de uso.`,
      hint: `${topicItem.hint} Escolha a opcao que continuaria clara em code review.`,
      tags: [...topicItem.tags, skill, 'boa-pratica']
    };
  }

  return {
    skill,
    module: area.displayName,
    topic: topicItem.label,
    objective: `Reconhecer quando usar ${topicItem.label}.`,
    prompt: basePrompt,
    correct: `usar ${topicItem.correct} quando o problema envolve ${topicItem.label} ${answerContext[difficulty]}`,
    distractors: [
      `aplicar uma solucao parecida sem verificar ${topicItem.label}`,
      `resolver apenas a sintaxe e ignorar o objetivo de ${topicItem.label}`,
      `trocar por outro recurso antes de entender o contexto`
    ],
    explanation: `${topicItem.explanation} A resposta correta conecta ${topicItem.correct} ao problema de ${topicItem.label}. Use esse conceito quando o contexto realmente pedir essa regra; evite responder por palavra-chave sem analisar o caso.`,
    hint: `${topicItem.hint} Compare o objetivo da pergunta com a regra principal.`,
    tags: [...topicItem.tags, skill, 'conceito']
  };
};

const buildArea = (area: AreaBank): Question[] =>
  Array.from({ length: area.count }, (_, itemIndex) => {
    const index = itemIndex + 1;
    const topicItem = area.topics[itemIndex % area.topics.length] ?? area.topics[0];
    const difficulty = difficulties[Math.floor((itemIndex / area.count) * difficulties.length)] ?? 'iniciante';
    const kind = kinds[itemIndex % kinds.length] ?? 'quiz';
    const variant = variantFor(area, topicItem, kind, difficulty, index);
    const id = `${area.prefix}-${topicItem.slug}-${pad(index)}`;
    const { options, optionIds, correctIndex, correctAnswerId } = optionSetFor(id, variant.correct, variant.distractors, itemIndex);

    return {
      id,
      language: area.areaId,
      module: pt(variant.module),
      topic: pt(variant.topic),
      objective: pt(variant.objective),
      areaId: area.areaId,
      kind,
      difficulty,
      prompt: pt(variant.prompt),
      code: variant.code,
      options: options.map(pt),
      optionIds,
      correctIndex,
      correctAnswerId,
      explanation: pt(variant.explanation),
      hint: pt(variant.hint),
      tags: Array.from(new Set([area.areaId, difficulty, ...variant.tags])),
      type: area.areaId === 'interview' ? 'entrevista' : itemIndex % 11 === 0 ? 'saida' : typeByKind[kind],
      points: pointsByDifficulty[difficulty],
      timeLimitSeconds: difficulty === 'avancado' ? 75 : 60
    };
  });

const banks: AreaBank[] = [
  {
    areaId: 'logic',
    prefix: 'logic',
    displayName: 'Logica',
    count: 60,
    topics: [
      topic('algorithm', 'algoritmos', 'sequencia finita de passos', ['arquivo visual', 'tabela de estilos', 'senha de API'], 'Algoritmos organizam entradas, processamento e saidas de forma verificavel.', 'Pense em receita com começo, meio e fim.', ['algoritmo']),
      topic('conditionals', 'condicionais', 'if/else', ['array', 'comentario', 'commit'], 'Condicionais escolhem caminhos conforme uma regra booleana.', 'Procure a decisao do fluxo.', ['condicional']),
      topic('loops', 'loops', 'for ou while com condicao de parada', ['constante global', 'classe CSS', 'endpoint REST'], 'Loops repetem trabalho enquanto a condicao permitir.', 'Sem parada, vira loop infinito.', ['loop']),
      topic('decomposition', 'decomposicao', 'quebrar problema em partes menores', ['duplicar codigo', 'aumentar aninhamento', 'ignorar casos'], 'Decompor reduz carga mental e facilita teste.', 'Chefes grandes viram missoes menores.', ['decomposicao']),
      topic('boolean', 'booleanos', 'verdadeiro ou falso', ['texto longo', 'lista ordenada', 'arquivo binario'], 'Booleanos sustentam comparacoes e desvios de fluxo.', 'Pergunta de sim ou nao.', ['boolean']),
      topic('edge-cases', 'casos de borda', 'testar limites e entradas incomuns', ['testar apenas caminho feliz', 'remover validacao', 'usar any'], 'Casos de borda revelam falhas onde regra muda de comportamento.', 'Olhe para zero, vazio e ultimo item.', ['edge-case']),
      topic('complexity', 'complexidade', 'medir custo conforme entrada cresce', ['trocar cor do botao', 'subir servidor', 'criar branch'], 'Complexidade ajuda escolher solucoes que escalam.', 'Pense no que acontece com 10x mais dados.', ['complexidade']),
      topic('binary-search', 'busca binaria', 'dados ordenados', ['dados criptografados', 'dados duplicados', 'dados em CSS'], 'Busca binaria depende de ordem para descartar metade do espaco.', 'Sem ordem, nao corte metade.', ['busca'])
    ]
  },
  {
    areaId: 'javascript',
    prefix: 'frontend-js',
    displayName: 'JavaScript',
    count: 50,
    topics: [
      topic('const-let', 'const e let', 'const para referencia que nao sera reatribuida', ['var para tudo', 'static em todo valor', 'define no navegador'], 'const e let reduzem escopo acidental e tornam intencao clara.', 'Comece imutavel por padrao.', ['variaveis']),
      topic('array-map', 'map em arrays', 'transformar cada item e retornar novo array', ['filtrar itens', 'mutar DOM sempre', 'interromper loop'], 'map preserva tamanho e cria uma nova lista transformada.', 'Mesmo numero de itens na saida.', ['array']),
      topic('array-filter', 'filter em arrays', 'manter itens que passam em uma condicao', ['somar todos os itens', 'renderizar JSX', 'declarar tipo'], 'filter remove elementos que nao satisfazem a regra.', 'Pergunta verdadeiro/falso por item.', ['array']),
      topic('async-await', 'async/await', 'ler codigo assincrono de forma sequencial', ['garantir rede rapida', 'criar CSS', 'evitar tratamento de erro'], 'async/await melhora clareza, mas ainda exige try/catch.', 'Promise com sintaxe mais linear.', ['async']),
      topic('closure', 'closures', 'funcao lembrar escopo onde nasceu', ['apagar variaveis', 'criar banco', 'renderizar servidor'], 'Closures encapsulam contexto e estado privado.', 'Funcao com mochila de variaveis.', ['closure']),
      topic('strict-equality', 'igualdade estrita', 'comparar valor e tipo com ===', ['converter sempre', 'atribuir valor', 'comparar CSS'], '=== evita coercao implicita e surpresas.', 'Tres sinais.', ['comparacao']),
      topic('dom-events', 'eventos DOM', 'responder a interacoes do usuario', ['criar tabela SQL', 'compilar Java', 'assinar commit'], 'Eventos conectam UI a comportamento.', 'Clique, input e submit.', ['dom']),
      topic('performance-main-thread', 'thread principal', 'fatiar trabalho ou usar worker', ['while infinito', 'alert em loop', 'mutacao global'], 'Tarefas pesadas travam interacao se ocupam a thread principal.', 'A UI precisa respirar.', ['performance'])
    ]
  },
  {
    areaId: 'typescript',
    prefix: 'typescript',
    displayName: 'TypeScript',
    count: 40,
    topics: [
      topic('type-annotation', 'anotacao de tipo', 'documentar formato esperado pelo compilador', ['executar SQL', 'estilizar tela', 'criar commit'], 'Anotacoes ajudam o compilador a prevenir usos invalidos.', 'Contrato antes de rodar.', ['tipos']),
      topic('interface-contract', 'interfaces', 'descrever contratos de objetos', ['criar classe CSS', 'abrir porta HTTP', 'minificar imagem'], 'Interfaces tornam props e payloads previsiveis.', 'Formato esperado.', ['interface']),
      topic('union', 'union types', 'valor com alternativas validas', ['valor secreto', 'array fixo', 'classe abstrata obrigatoria'], 'Unions modelam escolhas como string | number.', 'Use pipe.', ['union']),
      topic('unknown', 'unknown', 'validar antes de usar dado externo', ['usar any sempre', 'assumir string', 'ignorar API'], 'unknown obriga checagem antes do uso.', 'Nao confie na borda.', ['unknown']),
      topic('generics', 'generics', 'preservar tipo em funcoes reutilizaveis', ['remover runtime', 'criar HTML', 'evitar testes'], 'Generics mantem informacao de tipo sem duplicar funcao.', 'Tipo como parametro.', ['generics']),
      topic('discriminated-union', 'unions discriminadas', 'modelar estados fechados com campo discriminante', ['strings soltas', 'any global', 'comentarios'], 'Estados explicitos evitam combinacoes impossiveis.', 'Loading, success, error.', ['estado']),
      topic('type-guard', 'type guards', 'estreitar tipo com verificacao', ['forcar as sem checar', 'remover strict', 'converter CSS'], 'Type guards conectam validacao runtime ao compilador.', 'Checar antes de acessar.', ['guard']),
      topic('assertion-risk', 'type assertion', 'pode enganar o compilador sem converter valor', ['valida API', 'criptografa dados', 'compila nativo'], 'as Tipo nao valida em runtime.', 'Afirmar nao torna verdade.', ['assertion'])
    ]
  },
  {
    areaId: 'python',
    prefix: 'python',
    displayName: 'Python',
    count: 50,
    topics: [
      topic('print', 'print', 'exibir texto no terminal', ['console.log obrigatorio', 'System.out', 'echo CSS'], 'print e funcao embutida para saida simples.', 'Curta e direta.', ['basico']),
      topic('lists', 'listas', 'colecao ordenada e mutavel', ['dicionario sem chave', 'classe CSS', 'branch Git'], 'Listas guardam itens por indice.', 'Colchetes.', ['lista']),
      topic('dict', 'dicionarios', 'pares chave-valor', ['apenas numeros', 'rotas HTTP', 'tags HTML'], 'dict organiza dados por chave.', 'Pense em mapa.', ['dict']),
      topic('indentation', 'indentacao', 'definir blocos de codigo', ['decorar comentarios', 'instalar pacote', 'criar tabela'], 'Python usa indentacao como parte da sintaxe.', 'Espacos importam.', ['sintaxe']),
      topic('comprehension', 'list comprehension', 'criar listas de forma concisa', ['abrir rede', 'compilar Java', 'estilizar pagina'], 'Comprehensions combinam transformacao e filtro.', 'for dentro de expressao.', ['comprehension']),
      topic('context-manager', 'context manager', 'gerenciar recursos com with', ['variavel global', 'try vazio', 'while open'], 'with fecha arquivos e libera recursos corretamente.', 'Bloco que limpa ao sair.', ['with']),
      topic('generator', 'generators', 'produzir valores sob demanda', ['duplicar memoria', 'ignorar excecoes', 'converter tudo'], 'Generators economizam memoria em sequencias grandes.', 'yield.', ['generator']),
      topic('mutable-default', 'default mutavel', 'pode compartilhar estado entre chamadas', ['mais seguranca', 'tipagem estatica', 'HTML invalido'], 'Defaults mutaveis sao criados uma vez.', 'Use None e crie dentro.', ['bug'])
    ]
  },
  {
    areaId: 'html',
    prefix: 'frontend-html',
    displayName: 'HTML',
    count: 30,
    topics: [
      topic('semantic-main', 'main semantico', 'conteudo principal unico da pagina', ['rodape repetido', 'script externo', 'classe visual'], 'main ajuda navegadores e leitores a encontrar o conteudo central.', 'Regiao principal.', ['semantica', 'frontend']),
      topic('links', 'links', 'tag a com href', ['tag link para navegacao', 'div com url', 'span href'], 'A tag a cria navegacao acessivel.', 'Ancora.', ['html', 'frontend']),
      topic('image-alt', 'texto alternativo', 'descrever imagem para acessibilidade', ['aumentar resolucao', 'rodar JS', 'trocar cor'], 'alt atende leitores de tela e falha de carregamento.', 'Explique a imagem.', ['a11y', 'frontend']),
      topic('forms-label', 'labels de formulario', 'associar label ao input', ['usar placeholder sozinho', 'div para tudo', 'id duplicado'], 'Labels melhoram foco, clique e leitura assistiva.', 'Nome do campo conectado.', ['forms', 'a11y']),
      topic('button-native', 'botao nativo', 'usar button para acoes', ['div clicavel sem teclado', 'span com onClick', 'imagem clicavel'], 'button traz teclado, foco e papel semantico.', 'Controle nativo.', ['a11y']),
      topic('viewport', 'meta viewport', 'habilitar layout responsivo mobile', ['guardar senha', 'carregar banco', 'minificar CSS'], 'Viewport correta evita pagina desktop espremida no celular.', 'Mobile precisa disso.', ['responsivo']),
      topic('head-meta', 'metadados', 'title e description claros', ['comentarios longos', 'loops CSS', 'senha no HTML'], 'Metadados melhoram SEO e preview.', 'Preview do link.', ['seo']),
      topic('unique-id', 'IDs unicos', 'id deve aparecer uma vez por pagina', ['id duplicado', 'classe unica sempre', 'sem labels'], 'IDs duplicados quebram referencias e seletores.', 'Identidade nao se repete.', ['bug'])
    ]
  },
  {
    areaId: 'css',
    prefix: 'frontend-css',
    displayName: 'CSS',
    count: 30,
    topics: [
      topic('cascade', 'cascata', 'ordem, especificidade e origem decidem estilo', ['ordem SQL', 'compilador Java', 'branch remoto'], 'A cascata define qual regra vence.', 'Quem vence a disputa de estilos?', ['css']),
      topic('flexbox', 'Flexbox', 'alinhamento em uma dimensao', ['consulta SQL', 'backend REST', 'classe Java'], 'Flexbox distribui itens em linha ou coluna.', 'Uma direcao principal.', ['layout']),
      topic('grid', 'CSS Grid', 'layout em duas dimensoes', ['float antigo sempre', 'alert', 'JOIN SQL'], 'Grid cria linhas e colunas com controle forte.', 'Grade real.', ['layout']),
      topic('media-query', 'media queries', 'adaptar estilo a tela ou recurso', ['criptografia', 'auth', 'merge'], 'Media queries tornam layout responsivo.', 'Quando a largura muda.', ['responsivo']),
      topic('specificity', 'especificidade', 'seletores fortes demais dificultam manutencao', ['mais seguranca', 'menos HTML', 'query rapida'], 'Especificidade alta prende o design.', 'Evite guerra de !important.', ['bug']),
      topic('tokens', 'design tokens', 'valores reutilizaveis de design', ['senhas API', 'status HTTP', 'commits'], 'Tokens padronizam cores, espacos e tipografia.', 'Variaveis do design.', ['design-system']),
      topic('animation', 'animacoes performaticas', 'preferir transform e opacity', ['animar top sempre', 'loop de layout', 'SQL injection'], 'transform e opacity evitam muitos recalculos de layout.', 'Composicao.', ['performance']),
      topic('focus-visible', 'estado de foco', 'mostrar foco para navegacao por teclado', ['remover outline sempre', 'usar cor invisivel', 'apenas hover'], 'Foco visivel e requisito de acessibilidade.', 'Teclado tambem joga.', ['a11y'])
    ]
  },
  {
    areaId: 'react',
    prefix: 'frontend-react',
    displayName: 'React',
    count: 40,
    topics: [
      topic('components', 'componentes', 'pecas reutilizaveis de UI', ['tabela SQL', 'pacote Java', 'servidor DNS'], 'Componentes encapsulam interface e comportamento.', 'Bloco de tela.', ['componentes']),
      topic('props', 'props', 'entradas passadas para componente', ['estado global', 'banco local', 'classe CSS'], 'Props tornam componentes configuraveis.', 'Parametro da UI.', ['props']),
      topic('state', 'useState', 'estado local que re-renderiza UI', ['efeito de rede', 'tipo TS', 'rota API'], 'Estado muda a interface quando atualizado.', 'Valor vivo na tela.', ['state']),
      topic('effect', 'useEffect', 'sincronizar com sistemas externos', ['estilizar texto', 'criar tabela', 'renomear arquivo'], 'Efeitos lidam com rede, assinaturas e timers.', 'Depois do render.', ['effect']),
      topic('keys', 'keys em listas', 'identidade estavel para reconciliacao', ['indice sempre seguro', 'cor de item', 'senha'], 'Keys evitam troca de estado entre itens.', 'Use id estavel.', ['list']),
      topic('memo', 'memoizacao', 'evitar trabalho caro repetido quando medido', ['usar sempre', 'esconder bug', 'remover estado'], 'Memoizacao deve resolver gargalo real.', 'Otimize com criterio.', ['performance']),
      topic('context', 'Context', 'compartilhar dados sem prop drilling excessivo', ['variavel global solta', 'copiar componente', 'DOM manual'], 'Context serve para dados usados em muitas folhas.', 'Provider acima da arvore.', ['state']),
      topic('accessibility', 'acessibilidade em UI', 'rotulos, roles e foco claros', ['apenas cor', 'div clicavel sempre', 'placeholder unico'], 'UIs React precisam manter semantica acessivel.', 'Leitor de tela tambem usa o app.', ['a11y'])
    ]
  },
  {
    areaId: 'node',
    prefix: 'backend-node',
    displayName: 'Node.js',
    count: 40,
    topics: [
      topic('runtime', 'runtime Node', 'JavaScript fora do navegador', ['CSS no banco', 'HTML sem tag', 'Git remoto'], 'Node executa JS em servidores e ferramentas.', 'JS no servidor.', ['runtime']),
      topic('package-json', 'package.json', 'scripts, dependencias e metadados', ['senhas obrigatorias', 'imagens apenas', 'HTML final'], 'package.json descreve o projeto Node.', 'Centro do npm.', ['npm']),
      topic('express-route', 'rotas Express', 'mapear metodo e caminho para handler', ['classe CSS', 'query visual', 'commit'], 'Rotas conectam HTTP a funcoes.', 'GET /health.', ['express']),
      topic('middleware', 'middleware', 'funcao entre requisicao e resposta', ['componente visual', 'tabela temporaria', 'tipo primitivo'], 'Middlewares validam, autenticam e registram.', 'Passa pelo caminho.', ['middleware']),
      topic('env', 'variaveis de ambiente', 'guardar configuracoes e segredos fora do codigo', ['hardcode no repo', 'comentario README', 'nome do branch'], 'Segredos nao devem ir para o bundle/repositorio.', 'Use .env local.', ['security']),
      topic('promise-error', 'erros assincronos', 'capturar rejeicoes com try/catch ou handler', ['ignorar await', 'console apenas', 'CSS global'], 'Erros assincronos sem tratamento derrubam fluxo.', 'Promise tambem falha.', ['async']),
      topic('event-loop', 'event loop', 'coordenar callbacks e tarefas assincronas', ['indices SQL', 'layout mobile', 'somente CSS'], 'Event loop sustenta concorrencia do Node.', 'Cuidado com CPU pesada.', ['performance']),
      topic('observability', 'observabilidade', 'logs estruturados e metricas', ['prints aleatorios', 'sem status', 'senha no codigo'], 'Produção exige entender falhas e latencia.', 'Ver o sistema por dentro.', ['ops'])
    ]
  },
  {
    areaId: 'rest',
    prefix: 'backend-rest',
    displayName: 'APIs REST',
    count: 40,
    topics: [
      topic('resources', 'recursos REST', 'URLs representam recursos', ['classes CSS', 'commits', 'arquivos locais apenas'], 'REST organiza entidades por recursos.', 'GET /users.', ['rest']),
      topic('get', 'GET', 'buscar dados sem alterar estado', ['criar usuario sempre', 'apagar recurso', 'alterar CSS'], 'GET deve ser seguro para leitura.', 'Ler.', ['http']),
      topic('post', 'POST', 'criar recurso ou executar acao', ['listar sem filtro', 'apagar sempre', 'cachear CSS'], 'POST envia dados para processamento.', 'Cadastrar algo novo.', ['http']),
      topic('status-codes', 'status HTTP', 'comunicar resultado corretamente', ['retornar 200 sempre', 'ignorar erro', 'usar cor'], 'Status correto ajuda cliente e monitoramento.', 'Erro precisa parecer erro.', ['status']),
      topic('auth', 'autenticacao e autorizacao', 'identificar usuario e permissoes', ['URL secreta', 'comentario', 'CSS escondido'], 'Rotas privadas precisam verificar identidade e acesso.', 'Quem e voce e o que pode fazer.', ['security']),
      topic('pagination', 'paginacao', 'limitar listas grandes', ['mandar banco inteiro', 'sem filtro', 'status aleatorio'], 'Paginacao reduz custo e latencia.', 'Pagina por pagina.', ['performance']),
      topic('idempotency', 'idempotencia', 'repetir chamada mantem efeito final', ['nunca falhar', 'sem banco', 'tudo publico'], 'PUT/DELETE devem tolerar repeticao.', 'Repetir sem duplicar.', ['api-design']),
      topic('versioning', 'versionamento', 'evoluir contrato sem quebrar clientes', ['mudanca silenciosa', 'remover campos sem aviso', 'status aleatorio'], 'Contratos e versoes protegem integracoes.', 'Clientes dependem da promessa.', ['contract'])
    ]
  },
  {
    areaId: 'sql',
    prefix: 'sql',
    displayName: 'SQL',
    count: 50,
    topics: [
      topic('select', 'SELECT', 'buscar colunas de uma tabela', ['alterar CSS', 'criar branch', 'renderizar UI'], 'SELECT recupera dados.', 'Ler do banco.', ['select']),
      topic('where', 'WHERE', 'filtrar linhas por condicao', ['ordenar sempre', 'criar tabela', 'apagar banco'], 'WHERE reduz resultado conforme regra.', 'Filtro.', ['where']),
      topic('join', 'JOIN', 'combinar linhas relacionadas', ['duplicar CSS', 'compilar Java', 'criar tag'], 'JOIN conecta tabelas por chaves.', 'Relacionamentos.', ['join']),
      topic('group-by', 'GROUP BY', 'agrupar linhas para agregacoes', ['apagar duplicados', 'criar endpoint', 'estilizar'], 'GROUP BY permite contar, somar e resumir.', 'Relatorio por grupo.', ['group']),
      topic('index', 'indices', 'acelerar buscas com custo de escrita', ['criptografar tudo', 'remover filtros', 'trocar fonte'], 'Indices melhoram leitura, mas têm trade-off.', 'Sumario do livro.', ['performance']),
      topic('transactions', 'transacoes', 'garantir tudo-ou-nada', ['ignorar erro', 'comitar metade', 'sem rollback'], 'Transacoes preservam consistencia.', 'Ou tudo, ou nada.', ['transaction']),
      topic('injection', 'SQL injection', 'usar parametros em vez de concatenar entrada', ['concatenar string', 'confiar no usuario', 'remover auth'], 'Parametros evitam entrada virar comando.', 'Entrada nao e codigo.', ['security']),
      topic('normalization', 'normalizacao', 'reduzir duplicacao e anomalias', ['duplicar colunas', 'sem chaves', 'JSON para tudo'], 'Modelagem separa entidades e relacoes.', 'Uma fonte por fato.', ['modelagem'])
    ]
  },
  {
    areaId: 'git',
    prefix: 'git',
    displayName: 'Git/GitHub',
    count: 40,
    topics: [
      topic('status', 'git status', 'ver estado de arquivos e branch', ['uso de CPU', 'tamanho DB', 'rotas API'], 'Status mostra staged, modified e branch.', 'Como esta agora?', ['git']),
      topic('commit', 'commits', 'registrar mudancas no historico', ['subir banco', 'estilizar botao', 'consultar API'], 'Commit salva uma unidade de mudanca.', 'Snapshot com mensagem.', ['commit']),
      topic('branch', 'branches', 'trabalhar em linhas paralelas', ['senha', 'minificar CSS', 'teste automatico sempre'], 'Branches isolam features e correcoes.', 'Caminhos paralelos.', ['branch']),
      topic('merge-conflict', 'conflitos', 'mudancas concorrentes no mesmo trecho', ['internet ausente sempre', 'arquivo pequeno', 'commit com emoji'], 'Conflitos pedem decisao humana.', 'Mesmo lugar editado.', ['merge']),
      topic('pull-request', 'pull request', 'revisar e discutir mudancas antes do merge', ['apagar historico', 'commitar node_modules', 'sem descricao'], 'PR melhora colaboracao e qualidade.', 'Review antes de entrar.', ['github']),
      topic('rebase', 'rebase', 'reaplicar commits sobre outra base', ['mudar banco', 'compilar CSS', 'trocar senha'], 'Rebase reescreve hashes locais.', 'Cuidado em branch compartilhada.', ['history']),
      topic('ci', 'CI', 'rodar validacoes automaticamente', ['push direto sempre', 'senha compartilhada', 'sem testes'], 'CI reduz regressao antes do merge.', 'Robo revisando o basico.', ['ci']),
      topic('atomic-commit', 'commits atomicos', 'uma ideia por commit', ['mudancas enormes', 'tudo junto', 'sem mensagem'], 'Commits focados facilitam review e rollback.', 'Historia clara.', ['workflow'])
    ]
  },
  {
    areaId: 'java',
    prefix: 'java',
    displayName: 'Java',
    count: 50,
    topics: [
      topic('class-object', 'classes e objetos', 'modelar estado e comportamento', ['tags HTML', 'query CSS', 'branch'], 'Java organiza dominio com classes e objetos.', 'OOP.', ['oop']),
      topic('main', 'metodo main', 'ponto de entrada comum', ['start obrigatório', 'runApp', 'init CSS'], 'A JVM procura main em apps simples.', 'public static void main.', ['sintaxe']),
      topic('interface', 'interfaces', 'contratos de comportamento', ['imagem do app', 'query SQL', 'env'], 'Interfaces definem o que uma classe promete.', 'Contrato.', ['oop']),
      topic('arraylist', 'ArrayList', 'lista dinamica tipada', ['int fixo', 'switch', 'package'], 'ArrayList cresce e integra Collections.', 'Lista redimensionavel.', ['collections']),
      topic('null-pointer', 'NullPointerException', 'usar referencia nula como objeto', ['falta ; sempre', 'CSS falhou', 'porta ocupada'], 'NPE acontece ao acessar metodo/campo em null.', 'Objeto ausente.', ['bug']),
      topic('equals', 'equals em String', 'comparar conteudo textual', ['== sempre conteudo', 'tamanho bytes', 'encoding'], '== compara referencia; equals compara conteudo.', 'Mesmo texto, objeto diferente.', ['bug']),
      topic('generics', 'generics', 'parametrizar tipos', ['criar HTML', 'evitar compilacao', 'remover runtime'], 'Generics aumentam seguranca em colecoes.', 'List<String>.', ['generics']),
      topic('concurrency', 'concorrencia', 'reduzir estado compartilhado e usar APIs corretas', ['Thread.sleep como sync', 'global mutavel', 'ignorar excecoes'], 'Concorrencia exige controle de compartilhamento.', 'Menos mutacao global.', ['concurrency'])
    ]
  },
  {
    areaId: 'kotlin',
    prefix: 'kotlin',
    displayName: 'Kotlin',
    count: 50,
    topics: [
      topic('val-var', 'val e var', 'val para referencia somente leitura', ['var sempre', 'const let', 'finalize'], 'val comunica imutabilidade de referencia.', 'Parecido com const.', ['sintaxe']),
      topic('null-safety', 'null safety', 'tipos nulos explicitos e safe call', ['ignorar null', 'Any sempre', 'comentario'], 'Kotlin força pensar em ausencia.', '?. e ?:', ['null']),
      topic('data-class', 'data class', 'gerar equals, hashCode, toString e copy', ['layout XML', 'migration SQL', 'endpoint'], 'data class reduz boilerplate de modelos.', 'Modelo de dados.', ['data']),
      topic('sealed', 'sealed types', 'modelar estados fechados', ['string solta', 'Any sem validacao', 'comentarios'], 'sealed ajuda when exaustivo.', 'Loading, Success, Error.', ['state']),
      topic('coroutines', 'coroutines', 'assíncrono estruturado', ['CSS Grid', 'SQL JOIN', 'commit'], 'Coroutines lidam com tarefas assíncronas no Kotlin.', 'suspend.', ['async']),
      topic('extension', 'extension functions', 'adicionar funcoes sem heranca', ['alterar classe original sempre', 'criar banco', 'apagar tipo'], 'Extensions melhoram API sem modificar fonte.', 'Funcao como se fosse metodo.', ['api']),
      topic('scope-functions', 'let/apply/run', 'organizar transformacoes e configuracao', ['loop infinito', 'query sem filtro', 'CSS global'], 'Scope functions melhoram expressividade com cuidado.', 'Escolha pela intencao.', ['idiom']),
      topic('collections', 'colecoes Kotlin', 'map/filter/reduce imutaveis por padrao', ['mutar tudo', 'strings soltas', 'sem tipo'], 'Colecoes expressam transformacoes com clareza.', 'Pipeline de dados.', ['collections'])
    ]
  },
  {
    areaId: 'csharp',
    prefix: 'csharp',
    displayName: 'C#',
    count: 30,
    topics: [
      topic('dotnet', '.NET', 'runtime e bibliotecas do ecossistema C#', ['JVM apenas', 'navegador sem runtime', 'SQLite'], '.NET sustenta apps C# modernos.', 'Ecossistema Microsoft.', ['dotnet']),
      topic('property', 'propriedades', 'encapsular acesso a dados', ['tag HTML', 'branch', 'classe CSS'], 'Properties expressam leitura/escrita com controle.', 'get; set;.', ['oop']),
      topic('linq', 'LINQ', 'consultar colecoes com sintaxe expressiva', ['CSS media query', 'git merge', 'HTML link'], 'LINQ filtra, projeta e agrega dados.', 'Where e Select.', ['linq']),
      topic('nullable', 'nullable reference types', 'avisar sobre possivel null', ['apagar runtime', 'criar commit', 'minificar CSS'], 'Nullable ajuda evitar NullReferenceException.', 'string?.', ['null']),
      topic('async-await', 'async/await C#', 'assíncrono com Task', ['thread sleep sempre', 'sem await', 'CSS async'], 'Task modela operacoes futuras.', 'await Task.', ['async'])
    ]
  },
  {
    areaId: 'interview',
    prefix: 'interview',
    displayName: 'Entrevista Tecnica',
    count: 60,
    topics: [
      topic('explain-tradeoff', 'trade-offs', 'explicar escolhas e custos', ['decorar resposta', 'omitir risco', 'culpar ferramenta'], 'Entrevistas avaliam raciocinio, nao so resposta final.', 'Mostre por que.', ['entrevista']),
      topic('debugging', 'debugging', 'formular hipoteses e testar uma por vez', ['tentar aleatorio', 'mudar tudo junto', 'ignorar logs'], 'Debug profissional reduz incerteza em passos.', 'Hipotese, teste, conclusao.', ['debug']),
      topic('complexity-talk', 'complexidade', 'discutir custo de tempo e memoria', ['apenas dizer rapido', 'sem entrada', 'trocar tema'], 'Complexidade mostra maturidade na solucao.', 'E se dobrar o tamanho?', ['complexidade']),
      topic('system-design', 'design simples', 'começar por requisitos e limites', ['desenhar tecnologia primeiro', 'ignorar usuario', 'sem contrato'], 'Bons designs partem do problema.', 'Requisitos antes de ferramenta.', ['design']),
      topic('behavioral', 'comportamental', 'usar contexto, acao e resultado', ['resposta vaga', 'culpa externa', 'sem aprendizado'], 'STAR ajuda contar historias profissionais.', 'Situação, tarefa, ação, resultado.', ['carreira']),
      topic('testing', 'estrategia de testes', 'cobrir caminho feliz, bordas e regressao', ['testar so manual', 'sem casos negativos', 'prints'], 'Testes comunicam confianca.', 'O que quebraria?', ['qa']),
      topic('communication', 'comunicacao', 'pensar em voz alta com clareza', ['ficar mudo', 'pular etapas', 'usar jargao vazio'], 'Entrevistadores acompanham processo.', 'Narre o raciocinio.', ['comunicacao']),
      topic('code-review', 'code review', 'priorizar risco, clareza e comportamento', ['formatar apenas', 'ignorar bug', 'mudar tudo'], 'Review bom protege produto e equipe.', 'Comece pelo impacto.', ['review'])
    ]
  }
];

export const rawQuestions: Question[] = banks.flatMap(buildArea);
export const questions: Question[] = filterValidQuestions(rawQuestions);

const emptyQuestionsByArea: Record<AreaId, Question[]> = {
  logic: [],
  javascript: [],
  typescript: [],
  python: [],
  java: [],
  kotlin: [],
  csharp: [],
  sql: [],
  html: [],
  css: [],
  react: [],
  node: [],
  git: [],
  rest: [],
  interview: []
};

export const questionsByArea = questions.reduce<Record<AreaId, Question[]>>((acc, question) => {
  acc[question.areaId] = [...(acc[question.areaId] ?? []), question];
  return acc;
}, emptyQuestionsByArea);
