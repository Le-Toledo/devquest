import { AcademyModule, Lesson, LessonExercise, LessonProfessionalExample, QuickChallenge } from '../types/academy';

type LessonLevel = NonNullable<Lesson['level']>;

type TopicSpec = {
  slug: string;
  title: string;
  concept: string;
  objective: string;
  code?: string;
  why: string;
  practice: string;
  mistake: string;
  best: string;
  answer: string;
  wrong: [string, string, string];
};

type ModuleSpec = {
  slug: string;
  title: string;
  description: string;
  level: LessonLevel;
  topics: TopicSpec[];
};

type PathSpec = {
  pathId: string;
  areaId: Lesson['areaId'];
  label: string;
  modules: ModuleSpec[];
};

const replacements: [RegExp, string][] = [
  [/\bvoce\b/g, 'você'],
  [/\bVoce\b/g, 'Você'],
  [/\bcodigo\b/g, 'código'],
  [/\bcodigos\b/g, 'códigos'],
  [/\bvalidacao\b/g, 'validação'],
  [/\bvalidacoes\b/g, 'validações'],
  [/\bsolucao\b/g, 'solução'],
  [/\bsolucoes\b/g, 'soluções'],
  [/\bdecisao\b/g, 'decisão'],
  [/\bdecisoes\b/g, 'decisões'],
  [/\bpratica\b/g, 'prática'],
  [/\bpraticas\b/g, 'práticas'],
  [/\bvariavel\b/g, 'variável'],
  [/\bvariaveis\b/g, 'variáveis'],
  [/\bfuncao\b/g, 'função'],
  [/\bfuncoes\b/g, 'funções'],
  [/\bcolecao\b/g, 'coleção'],
  [/\bcolecoes\b/g, 'coleções'],
  [/\bsequencia\b/g, 'sequência'],
  [/\bsequencias\b/g, 'sequências'],
  [/\boperacao\b/g, 'operação'],
  [/\boperacoes\b/g, 'operações'],
  [/\bmanutencao\b/g, 'manutenção'],
  [/\brevisao\b/g, 'revisão'],
  [/\brevisoes\b/g, 'revisões'],
  [/\btecnica\b/g, 'técnica'],
  [/\btecnicas\b/g, 'técnicas'],
  [/\btecnico\b/g, 'técnico'],
  [/\btecnicos\b/g, 'técnicos'],
  [/\bexplicavel\b/g, 'explicável'],
  [/\bconfiavel\b/g, 'confiável'],
  [/\bdisponivel\b/g, 'disponível'],
  [/\bDisponivel\b/g, 'Disponível'],
  [/\bprevisivel\b/g, 'previsível'],
  [/\bcriterio\b/g, 'critério'],
  [/\bcriterios\b/g, 'critérios'],
  [/\bassincronia\b/g, 'assincronia'],
  [/\bassíncrono\b/g, 'assíncrono'],
  [/\bautenticacao\b/g, 'autenticação'],
  [/\bautorizacao\b/g, 'autorização'],
  [/\bpaginacao\b/g, 'paginação'],
  [/\bobservabilidade\b/g, 'observabilidade'],
  [/\bseguranca\b/g, 'segurança'],
  [/\bProgramacao\b/g, 'Programação'],
  [/\bprogramacao\b/g, 'programação'],
  [/\bcomecar\b/g, 'começar'],
  [/\bcomeca\b/g, 'começa'],
  [/\bComecar\b/g, 'Começar'],
  [/\baplicacao\b/g, 'aplicação'],
  [/\busuarios\b/g, 'usuários'],
  [/\bmudancas\b/g, 'mudanças'],
  [/\bexplicito\b/g, 'explícito'],
  [/\bfacil\b/g, 'fácil'],
  [/\bdificil\b/g, 'difícil'],
  [/\bduplicacao\b/g, 'duplicação'],
  [/\bestetico\b/g, 'estético'],
  [/\bintencao\b/g, 'intenção'],
  [/\bconfusao\b/g, 'confusão'],
  [/\bvarias\b/g, 'várias'],
  [/\bavancados\b/g, 'avançados'],
  [/\bavancado\b/g, 'avançado'],
  [/\bcolaboracao\b/g, 'colaboração'],
  [/\bbeneficio\b/g, 'benefício'],
  [/\bdecisao\b/g, 'decisão'],
  [/\bdecisoes\b/g, 'decisões'],
  [/\btestavel\b/g, 'testável'],
  [/\blegiveis\b/g, 'legíveis'],
  [/\blegiveis\b/g, 'legíveis'],
  [/\butil\b/g, 'útil'],
  [/\buteis\b/g, 'úteis'],
  [/\bsaida\b/g, 'saída'],
  [/\bsaidas\b/g, 'saídas'],
  [/\bintermediarias\b/g, 'intermediárias'],
  [/\bcalculos\b/g, 'cálculos'],
  [/\bunica\b/g, 'única'],
  [/\bportugues\b/g, 'português'],
  [/\bverificaveis\b/g, 'verificáveis'],
  [/\bhipoteses\b/g, 'hipóteses'],
  [/\bhipotese\b/g, 'hipótese'],
  [/\bmetodo\b/g, 'método'],
  [/\bnegocio\b/g, 'negócio'],
  [/\bapresentacao\b/g, 'apresentação'],
  [/\binformacoes\b/g, 'informações'],
  [/\bunico\b/g, 'único'],
  [/\bpaginas\b/g, 'páginas'],
  [/\bespecifico\b/g, 'específico'],
  [/\btitulos\b/g, 'títulos'],
  [/\bestao\b/g, 'estão'],
  [/\bsecoes\b/g, 'seções'],
  [/\baparencia\b/g, 'aparência'],
  [/\bnavegavel\b/g, 'navegável'],
  [/\bregioes\b/g, 'regiões'],
  [/\bnao\b/g, 'não'],
  [/\bve\b/g, 'vê'],
  [/\bdescricoes\b/g, 'descrições'],
  [/\bcompreensiveis\b/g, 'compreensíveis'],
  [/\bvalidas\b/g, 'válidas'],
  [/\bvalido\b/g, 'válido'],
  [/\binvalido\b/g, 'inválido'],
  [/\bcorrecao\b/g, 'correção'],
  [/\bautomatica\b/g, 'automática'],
  [/\bdescricao\b/g, 'descrição'],
  [/\bgenerico\b/g, 'genérico'],
  [/\bacessivel\b/g, 'acessível'],
  [/\bcriticos\b/g, 'críticos'],
  [/\bcomposicao\b/g, 'composição'],
  [/\bcriterio\b/g, 'critério'],
  [/\bassincronos\b/g, 'assíncronos'],
  [/\bPaginacao\b/g, 'Paginação'],
  [/\bpaginacao\b/g, 'paginação'],
  [/\bordenacao\b/g, 'ordenação'],
  [/\bAutenticacao\b/g, 'Autenticação'],
  [/\bAutorizacao\b/g, 'Autorização'],
  [/\bPermissoes\b/g, 'Permissões'],
  [/\bIdempotencia\b/g, 'Idempotência'],
  [/\bDocumentacao\b/g, 'Documentação'],
  [/\bVersoes\b/g, 'Versões'],
  [/\bAgregacao\b/g, 'Agregação'],
  [/\bNormalizacao\b/g, 'Normalização'],
  [/\brecuperacao\b/g, 'recuperação'],
  [/\bSeguranca\b/g, 'Segurança'],
  [/\bRepositorio\b/g, 'Repositório'],
  [/\bRepositorios\b/g, 'Repositórios'],
  [/\batomicos\b/g, 'atômicos'],
  [/\bportfolio\b/g, 'portfólio'],
  [/\bPortfolio\b/g, 'Portfólio'],
  [/\bAutomacao\b/g, 'Automação'],
  [/\bpythonico\b/g, 'pythônico'],
  [/\bMetodo\b/g, 'Método'],
  [/\bInjecao\b/g, 'Injeção'],
  [/\bdependencia\b/g, 'dependência'],
  [/\bHabitos\b/g, 'Hábitos'],
  [/\bsustentaveis\b/g, 'sustentáveis'],
  [/\bSolucao\b/g, 'Solução'],
  [/\bbruteforce\b/g, 'brute force'],
  [/\bLogica\b/g, 'Lógica'],
  [/\blogica\b/g, 'lógica'],
  [/\bComputacao\b/g, 'Computação'],
  [/\bEntrevista Tecnica\b/g, 'Entrevista Técnica'],
  [/\bCarreira Dev\b/g, 'Carreira Dev'],
  [/\bAPIs REST\b/g, 'APIs REST'],
  [/\bExpressoes\b/g, 'Expressões'],
  [/\bexpressoes\b/g, 'expressões'],
  [/\bCondicionais\b/g, 'Condicionais'],
  [/\bFuncoes\b/g, 'Funções'],
  [/\bObjetos\b/g, 'Objetos'],
  [/\bTransacoes\b/g, 'Transações'],
  [/\bTransacao\b/g, 'Transação'],
  [/\bIndices\b/g, 'Índices'],
  [/\bindices\b/g, 'índices'],
  [/\bExcecoes\b/g, 'Exceções'],
  [/\bexcecoes\b/g, 'exceções'],
  [/\bModulos\b/g, 'Módulos'],
  [/\bmodulos\b/g, 'módulos'],
  [/\bMetodos\b/g, 'Métodos'],
  [/\bmetodos\b/g, 'métodos'],
  [/\bRepositorio\b/g, 'Repositório'],
  [/\brepositorio\b/g, 'repositório'],
  [/\bRepositorios\b/g, 'Repositórios'],
  [/\brepositorios\b/g, 'repositórios'],
  [/\bComunicacao\b/g, 'Comunicação'],
  [/\bcomunicacao\b/g, 'comunicação'],
  [/\bEvolucao\b/g, 'Evolução'],
  [/\bevolucao\b/g, 'evolução'],
  [/\bNegociacao\b/g, 'Negociação'],
  [/\bnegociacao\b/g, 'negociação'],
  [/\bPlanejamento\b/g, 'Planejamento'],
  [/\bResponsavel\b/g, 'Responsável'],
  [/\bresponsavel\b/g, 'responsável'],
  [/\bInteracao\b/g, 'Interação'],
  [/\binteracao\b/g, 'interação'],
  [/\bNavegacao\b/g, 'Navegação'],
  [/\bnavegacao\b/g, 'navegação'],
  [/\bPublicacao\b/g, 'Publicação'],
  [/\bpublicacao\b/g, 'publicação'],
  [/\bPreparacao\b/g, 'Preparação'],
  [/\bpreparacao\b/g, 'preparação'],
  [/\bheranca\b/g, 'herança'],
  [/\bconcorrencia\b/g, 'concorrência'],
  [/\bConcorrencia\b/g, 'Concorrência'],
  [/\bInteligencia\b/g, 'Inteligência'],
  [/\binteligencia\b/g, 'inteligência'],
  [/\bnao\b/g, 'não'],
  [/\bsao\b/g, 'são']
];

const pt = (text: string) => replacements.reduce((value, [pattern, replacement]) => value.replace(pattern, replacement), text);

const hashText = (text: string) => text.split('').reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7);

const shuffleWithSeed = <T,>(items: T[], seedText: string) => {
  const shuffled = [...items];
  let seed = hashText(seedText);
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const swapIndex = seed % (index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
};

const uniqueOptions = (options: string[]) => Array.from(new Set(options.map((option) => pt(option).trim()))).slice(0, 4);

const buildChallenge = (
  seed: string,
  label: string,
  title: string,
  concept: string,
  objective: string,
  answer: string,
  wrong: [string, string, string]
): QuickChallenge => {
  const correct = pt(`${answer} em ${label}.`);
  const optionsWithFlag = uniqueOptions([
    correct,
    `${pt(wrong[0])} ao estudar ${concept} em ${label}, mesmo que isso esconda o raciocínio principal da aula.`,
    `${pt(wrong[1])} na aula "${title}" de ${label}, deixando a verificação para depois do código pronto.`,
    `${pt(wrong[2])}, sem separar o papel de ${concept} do restante da solução em ${label}.`
  ]).map((option) => ({ option, correct: option === correct }));
  const shuffled = shuffleWithSeed(optionsWithFlag, seed);
  const correctIndex = shuffled.findIndex((item) => item.correct);

  return {
    prompt: pt(`Em um projeto de ${label}, você precisa ${objective.toLowerCase()} Qual escolha demonstra melhor a compreensão de "${title}"?`),
    options: shuffled.map((item) => item.option),
    correctIndex,
    explanation: pt(`A alternativa correta aplica ${concept} ao problema real da aula: ${objective}`)
  };
};

const topic = (
  slug: string,
  title: string,
  concept: string,
  objective: string,
  code: string | undefined,
  why: string,
  practice: string,
  mistake: string,
  best: string,
  answer: string,
  wrong: [string, string, string] = ['Decorar a sintaxe sem relacionar com o problema real', 'Testar apenas o exemplo feliz', 'Misturar responsabilidades diferentes na mesma solução']
): TopicSpec => ({ slug, title, concept, objective, code, why, practice, mistake, best, answer, wrong });

const module = (slug: string, title: string, description: string, level: LessonLevel, topics: TopicSpec[]): ModuleSpec => ({ slug, title, description, level, topics });

const analogyFor = (concept: string) => {
  const normalized = concept.toLowerCase();
  if (normalized.includes('vari')) return 'Pense em uma variável como uma caixa com etiqueta. A etiqueta é o nome, e o conteúdo da caixa é o valor guardado para usar durante o programa.';
  if (normalized.includes('loop')) return 'Um loop parece uma pessoa conferindo produtos em uma prateleira: ela pega um produto, anota, passa para o próximo e para quando a prateleira termina.';
  if (normalized.includes('fun')) return 'Uma função é parecida com uma receita de bolo: recebe ingredientes, segue passos definidos e entrega um resultado.';
  if (normalized.includes('array') || normalized.includes('cole')) return 'Um array é como uma estante: cada posição guarda um item, e você pode percorrer a estante do primeiro ao último.';
  if (normalized.includes('objeto')) return 'Um objeto funciona como uma ficha de cadastro: várias informações sobre a mesma coisa ficam agrupadas em um só lugar.';
  if (normalized.includes('condicion')) return 'Uma condicional lembra um semáforo: dependendo da cor, a pessoa para, espera ou segue.';
  return `Uma forma simples de pensar em ${concept} é imaginar uma rotina organizada: cada parte tem um papel claro, uma ordem e um motivo para existir.`;
};

const lineByLineFor = (concept: string, code?: string) => {
  if (!code) return `Esta aula é conceitual. Leia o exemplo como uma sequência de decisões: primeiro identifique o problema, depois escolha onde ${concept} entra e, por fim, confira se o resultado faz sentido.`;
  if (concept.toLowerCase().includes('loop')) {
    return [
      'Linha 1: criamos a lista produtos com três itens do mercado.',
      'Linha 3: começamos um loop que pega um produto por vez da lista.',
      'Linha 4: mostramos o produto atual no console.',
      'Linha 7: criamos uma variável para somar valores.',
      'Linha 9: o segundo loop percorre cada preço da lista.',
      'Linha 10: cada preço é somado ao total.',
      'Linha 13: mostramos o valor final da compra.',
      'Linha 16: criamos um contador que começa em 1.',
      'Linha 18: o while continua enquanto o contador for menor ou igual a 3.',
      'Linha 20: aumentamos o contador para evitar um loop infinito.'
    ].join('\n');
  }
  return code
    .split('\n')
    .map((line, index) => {
      const cleanLine = line.trim() || '(linha em branco)';
      return `Linha ${index + 1}: ${cleanLine}`;
    })
    .join('\n');
};

const expectedResultFor = (concept: string, code?: string) => {
  if (!code) return 'Resultado esperado: você consegue explicar o conceito com suas palavras e reconhecer quando ele deve ser usado.';
  if (concept.toLowerCase().includes('loop')) {
    return [
      'Produto: Arroz',
      'Produto: Feijão',
      'Produto: Macarrão',
      'Total: R$ 18',
      'Contagem: 1',
      'Contagem: 2',
      'Contagem: 3'
    ].join('\n');
  }
  if (/console\.log/.test(code)) return 'Resultado esperado: o console mostra os valores definidos no exemplo, na mesma ordem dos comandos console.log.';
  if (/SELECT/i.test(code)) return 'Resultado esperado: o banco retorna as colunas solicitadas para os registros que passam pelo filtro.';
  if (/git /.test(code)) return 'Resultado esperado: o Git executa o comando e prepara o repositório para o próximo passo.';
  if (/<[a-z!]/i.test(code)) return 'Resultado esperado: o navegador interpreta a estrutura e exibe o conteúdo com significado correto.';
  return 'Resultado esperado: o exemplo fica completo, legível e pronto para ser adaptado em um projeto real.';
};

const guidedExerciseFor = (concept: string) =>
  `Vamos praticar ${concept}: crie um exemplo pequeno do seu cotidiano, dê nomes claros para cada parte e escreva uma frase explicando o resultado esperado antes de rodar o código.`;

const challengeFor = (concept: string) =>
  `Crie um novo exemplo usando ${concept} em outro contexto, como feira, escola, transporte ou finanças pessoais. Não copie o exemplo da aula.`;

const professionalExampleFor = (label: string, concept: string, objective: string, code?: string): LessonProfessionalExample => ({
  scenario: pt(`Cenario profissional: imagine uma equipe mantendo um produto de ${label} usado por clientes reais. A tarefa e ${objective.toLowerCase()} sem quebrar telas, dados salvos ou fluxos que ja funcionam em producao.`),
  code,
  walkthrough: pt(`Primeiro identifique a regra central de ${concept} e escreva um exemplo minimo. Depois aplique essa regra ao contexto de ${label}, nomeando entradas, saidas e caso de erro. Por fim, revise se o exemplo continua compreensivel para outra pessoa do time abrir um pull request, testar a mudanca e explicar a decisao.`)
});

const progressiveExercisesFor = (id: string, label: string, concept: string, objective: string, expectedResult: string): LessonExercise[] => [
  {
    id: `${id}-aquecimento`,
    level: 'aquecimento',
    title: 'Aquecimento guiado',
    prompt: pt(`Reescreva com suas palavras o objetivo "${objective}" e liste duas entradas que uma pessoa dev receberia em um projeto de ${label}.`),
    acceptanceCriteria: [
      pt(`Citou ${concept} explicitamente na explicacao.`),
      'Separou entrada, regra e resultado esperado.'
    ],
    solution: pt(`Uma boa resposta explica ${concept} com uma frase propria, aponta entradas reais e fecha com o resultado esperado antes de escrever codigo.`),
    hint: pt(`Comece identificando o dado ou decisao que ${concept} controla nesta aula.`),
    expectedOutput: pt(`Um paragrafo curto explicando ${concept} e uma lista com duas entradas reais.`),
    reviewConcept: concept
  },
  {
    id: `${id}-pratica`,
    level: 'pratica',
    title: 'Prática aplicada',
    prompt: pt(`Adapte o exemplo da aula para um caso diferente de ${label}, mudando nomes, dados e pelo menos uma regra para mostrar que voce entendeu ${concept}.`),
    acceptanceCriteria: [
      'Usou nomes específicos do novo domínio escolhido.',
      'Incluiu um caso feliz e um caso de borda para conferir a regra.'
    ],
    solution: pt(`A solucao deve reaproveitar a ideia de ${concept}, mas trocar dominio, nomes e dados. Se o exemplo ainda parece copia literal da aula, refaca a modelagem.`),
    hint: pt(`Escolha um contexto simples de ${label} e escreva primeiro o caso feliz, depois um limite que poderia quebrar.`),
    expectedOutput: expectedResult,
    reviewConcept: concept
  },
  {
    id: `${id}-desafio`,
    level: 'desafio',
    title: 'Desafio profissional',
    prompt: pt(`Prepare uma resposta como se fosse comentar em um pull request: explique a decisao tecnica, o risco evitado e como testar ${concept} em ${label}.`),
    acceptanceCriteria: [
      'Explicou o motivo técnico antes da sintaxe.',
      'Descreveu um teste manual ou automatizado que provaria a solução.'
    ],
    solution: pt(`A resposta ideal parece um comentario de revisao: decisao tecnica, risco evitado e teste claro para validar ${concept}.`),
    hint: pt(`Pense em como outra pessoa do time verificaria ${concept} sem depender da sua explicacao verbal.`),
    expectedOutput: pt(`Uma nota de revisão clara, com decisao, risco e teste verificavel para ${concept}.`),
    reviewConcept: concept
  }
];

const buildLesson = (path: PathSpec, moduleSpec: ModuleSpec, topicSpec: TopicSpec, moduleIndex: number, topicIndex: number): Lesson => {
  const moduleId = `${path.pathId}-${moduleSpec.slug}`;
  const id = `${path.pathId}-${moduleSpec.slug}-${topicSpec.slug}`;
  const order = moduleIndex * 3 + topicIndex + 1;
  const concept = pt(topicSpec.concept);
  const label = pt(path.label);
  const title = pt(topicSpec.title);
  const objective = pt(topicSpec.objective);
  const why = pt(topicSpec.why);
  const practice = pt(topicSpec.practice);
  const mistake = pt(topicSpec.mistake);
  const best = pt(topicSpec.best);
  const codeExplanation = lineByLineFor(concept, topicSpec.code);
  const expectedResult = expectedResultFor(concept, topicSpec.code);
  const market = `O conceito de ${concept} aparece em tarefas reais de ${label}, como manutenção de sistemas, criação de novas funcionalidades, correção de bugs, revisão de código e entrevistas técnicas. O valor profissional está em usar esse conhecimento para deixar o sistema mais claro, confiável e fácil de evoluir.`;
  const guidedExercise = guidedExerciseFor(concept);
  const practicalChallenge = challengeFor(concept);
  const professionalExample = professionalExampleFor(label, concept, objective, topicSpec.code);
  const exercises = progressiveExercisesFor(id, label, concept, objective, expectedResult);
  const content = `${why}\n\n${practice}\n\n${market}`;
  const summary = `Nesta aula você estudou ${concept} em ${label}, viu quando usar, analisou um exemplo prático e aprendeu a evitar o erro mais comum: ${mistake}`;
  const mistakes = [
    mistake,
    'Aplicar a técnica antes de entender qual problema ela resolve.',
    'Copiar um exemplo pronto sem adaptar nomes, entradas e casos de erro.'
  ];

  return {
    id,
    pathId: path.pathId,
    moduleId,
    moduleTitle: pt(moduleSpec.title),
    order,
    title,
    concept,
    areaId: path.areaId,
    description: objective,
    objective,
    content,
    sections: [
      {
        title: 'Introdução',
        body: `${concept} é importante porque transforma uma ideia solta em uma parte compreensível do programa. ${market}`
      },
      {
        title: 'O que é',
        body: `Esta aula trata de ${concept}, um tema usado para resolver problemas específicos em ${label}. ${why}`
      },
      {
        title: 'Por que existe',
        body: `Esse conceito existe para evitar código improvisado. Ele ajuda você a dar nome às decisões do programa, separar responsabilidades e explicar sua solução para outras pessoas.`
      },
      {
        title: 'Como funciona',
        body: practice
      },
      {
        title: 'Analogia do mundo real',
        body: analogyFor(concept)
      },
      {
        title: 'Exemplo em código',
        body: topicSpec.code ? 'Veja um exemplo completo, com contexto declarado antes de usar qualquer variável, lista ou função.' : 'Este tema não precisa de sintaxe específica para começar. Use o raciocínio abaixo como exemplo guiado.',
        code: topicSpec.code
      },
      {
        title: 'Explicação linha por linha',
        body: codeExplanation
      },
      {
        title: 'Resultado esperado',
        body: expectedResult
      },
      {
        title: 'Erros comuns',
        body: mistakes.map((item) => `- ${item}`).join('\n')
      },
      {
        title: 'Dicas profissionais',
        body: `${best} Em empresas, esse cuidado facilita revisão de código, manutenção e trabalho em equipe.`
      },
      {
        title: 'Curiosidade',
        body: `Muitos bugs difíceis não nascem de falta de sintaxe, mas de nomes ruins, exemplos incompletos e regras que não deixam claro o que deveria acontecer.`
      },
      {
        title: 'Exercício guiado',
        body: guidedExercise
      },
      {
        title: 'Desafio',
        body: practicalChallenge
      },
      {
        title: 'Resumo',
        body: summary
      }
    ],
    codeExample: topicSpec.code,
    professionalExample,
    exercises,
    commonMistakes: mistakes,
    bestPractices: [
      best,
      'Explique a solução em uma frase antes de escrever código.',
      'Teste pelo menos um caso feliz e um caso de borda.'
    ],
    professorTip: `Professor Byte: ${best}`,
    summary,
    prerequisites: moduleIndex === 0 ? ['Vontade de praticar e ler código com calma'] : [`Concluir o módulo anterior de ${label}`],
    tags: [path.pathId.replace('-path', ''), moduleSpec.slug, topicSpec.slug, concept.toLowerCase().replace(/\s+/g, '-')],
    level: moduleSpec.level,
    estimatedMinutes: moduleSpec.level === 'iniciante' ? 10 : moduleSpec.level === 'intermediario' ? 14 : 18,
    xpReward: moduleSpec.level === 'iniciante' ? 70 : moduleSpec.level === 'intermediario' ? 90 : 120,
    coinReward: moduleSpec.level === 'iniciante' ? 30 : moduleSpec.level === 'intermediario' ? 40 : 55,
    challenge: buildChallenge(id, label, title, concept, objective, topicSpec.answer, topicSpec.wrong)
  };
};

const specs: PathSpec[] = [
  {
    pathId: 'logic-path',
    areaId: 'logic',
    label: 'Logica de Programacao',
    modules: [
      module('fundamentos', 'Fundamentos do pensamento computacional', 'Variaveis, tipos e expressoes para representar problemas.', 'iniciante', [
        topic('variaveis', 'Variáveis', 'Variáveis', 'Entender que uma variável armazena um valor na memória usando um nome.', 'const nomeCliente = "Maria";\nconst idadeCliente = 25;\nconst cidadeCliente = "Recife";\n\nconsole.log("Cliente: " + nomeCliente);\nconsole.log("Idade: " + idadeCliente);\nconsole.log("Cidade: " + cidadeCliente);', 'Variáveis são um dos conceitos fundamentais da programação. Elas permitem armazenar informações na memória do programa usando um nome, como idade, nome, preço ou status. Isso torna o código mais claro, organizado e fácil de modificar.', 'Quando criamos uma variável, escolhemos um nome e atribuímos um valor a ela. Depois, usamos esse nome sempre que precisarmos acessar ou alterar o valor durante a execução do programa.', 'Criar nomes sem significado, como x ou a, esquecer aspas em textos ou tentar usar uma variável antes de criá-la.', 'Use nomes que expliquem o dado guardado, como idade, nomeProduto, precoTotal ou usuarioLogado.', 'Criar variáveis com nomes claros para guardar dados usados pelo programa'),
        topic('tipos', 'Tipos e formato dos dados', 'Tipos', 'Distinguir texto, número, booleano e listas antes de criar regras.', 'const nomeProduto = "Caderno";\nconst precoProduto = 18.5;\nconst produtoDisponivel = true;\nconst categorias = ["Papelaria", "Escola"];\n\nconsole.log(nomeProduto);\nconsole.log(precoProduto);\nconsole.log(produtoDisponivel);\nconsole.log(categorias);', 'Tipos indicam que tipo de valor uma variável guarda e quais operações fazem sentido com ele. Número pode participar de cálculo, texto pode ser exibido ou concatenado, booleano representa verdadeiro ou falso e listas guardam vários itens.', 'Antes de escrever uma regra, pergunte qual é o formato de cada entrada. Essa escolha evita somar textos como se fossem números, comparar valores incompatíveis ou salvar dados em formato difícil de usar depois.', 'Tratar todo dado como texto e converter tarde demais.', 'Valide o formato na entrada do fluxo e mantenha nomes que deixem o tipo fácil de reconhecer.', 'Escolher operações de acordo com o tipo'),
        topic('expressoes', 'Expressões e operadores', 'Expressões', 'Combinar valores para produzir uma nova resposta.', 'const precoProduto = 150;\nconst quantidade = 3;\nconst totalCompra = precoProduto * quantidade;\nconst freteGratis = totalCompra >= 300;\n\nconsole.log("Total: R$ " + totalCompra);\nconsole.log("Frete grátis? " + freteGratis);', 'Expressões são combinações de valores, variáveis e operadores que produzem um resultado. Elas aparecem em cálculos, comparações, validações e regras de acesso.', 'Use expressões pequenas para tornar regras legíveis. Quando uma expressão cresce demais, dê nome às partes importantes para que o próximo leitor entenda a intenção antes de olhar a sintaxe.', 'Criar uma expressão enorme sem nomes intermediários.', 'Extraia partes importantes para variáveis com nome, como temNivelMinimo ou totalCompra.', 'Quebrar regras complexas em expressões claras')
      ]),
      module('controle', 'Controle de fluxo', 'Condicionais, loops e funcoes para organizar decisoes.', 'iniciante', [
        topic('condicionais', 'Condicionais sem mistério', 'Condicionais', 'Escolher caminhos com if/else a partir de uma regra.', 'const idadeCliente = 17;\n\nif (idadeCliente >= 18) {\n  console.log("Pode criar conta sozinho.");\n} else {\n  console.log("Precisa de autorização de um responsável.");\n}', 'Condicionais permitem que o programa tome caminhos diferentes de acordo com uma pergunta verdadeira ou falsa. Elas são a base de regras como liberar uma fase, negar um login ou mostrar uma mensagem de erro.', 'Use quando duas ou mais ações dependem de uma regra verificável. Primeiro descreva a condição em português, depois transforme essa regra em uma expressão booleana clara.', 'Aninhar muitos ifs sem deixar claro qual regra vem primeiro.', 'Coloque o caso mais importante ou mais restritivo primeiro e mantenha cada condição legível.', 'Separar caminhos por regras booleanas claras'),
        topic('loops', 'Loops com condição de parada', 'Loops', 'Repetir uma ação sem copiar código.', 'const produtos = ["Arroz", "Feijão", "Macarrão"];\n\nfor (const produto of produtos) {\n  console.log("Produto: " + produto);\n}\n\nconst precos = [5, 7, 6];\nlet total = 0;\n\nfor (const preco of precos) {\n  total = total + preco;\n}\n\nconsole.log("Total: R$ " + total);\n\nlet contador = 1;\n\nwhile (contador <= 3) {\n  console.log("Contagem: " + contador);\n  contador = contador + 1;\n}\n\n// Erro comum: sem aumentar o contador, o while nunca termina.\n// while (contador <= 3) {\n//   console.log(contador);\n// }', 'Loops repetem um bloco de código enquanto houver itens para processar ou enquanto uma condição continuar verdadeira. Eles evitam copiar a mesma instrução várias vezes.', 'Use loops para percorrer listas, somar pontos, procurar itens ou executar tentativas controladas. O ponto principal é saber onde a repetição começa, o que muda a cada volta e quando ela termina.', 'Esquecer a condição de parada e criar loop infinito.', 'Garanta que cada repetição avance em direção ao fim ou percorra uma coleção bem definida.', 'Repetir trabalho em coleções com saída clara'),
        topic('funcoes', 'Funções pequenas e testáveis', 'Funções', 'Agrupar passos com nome, entrada e saída.', 'function calcularDesconto(precoProduto, percentualDesconto) {\n  const desconto = precoProduto * (percentualDesconto / 100);\n  return precoProduto - desconto;\n}\n\nconst precoFinal = calcularDesconto(100, 10);\n\nconsole.log("Preço final: R$ " + precoFinal);', 'Funções agrupam uma sequência de instruções sob um nome. Elas podem receber entradas, executar uma regra e devolver uma saída, facilitando reutilização, leitura e testes.', 'Use quando uma sequência de passos tem um objetivo nomeável. Uma boa função responde a uma pergunta simples: o que ela recebe, o que faz e o que entrega?', 'Criar funções que fazem muitas coisas sem retorno claro.', 'Uma função deve ter uma responsabilidade principal, nome claro e comportamento previsível.', 'Criar funções com objetivo único')
      ]),
      module('colecoes', 'Colecoes e transformacoes', 'Arrays, objetos e busca para trabalhar com varios dados.', 'intermediario', [
        topic('arrays', 'Arrays como listas ordenadas', 'Arrays', 'Guardar vários itens em ordem e percorrer com segurança.', 'const alunos = ["Ana", "Bruno", "Carla"];\n\nconsole.log(alunos[0]);\nconsole.log(alunos[1]);\nconsole.log(alunos[2]);', 'Arrays são listas ordenadas de valores. Eles servem para guardar vários itens relacionados, como fases, respostas, mensagens, produtos ou usuários.', 'Use quando a ordem, a quantidade ou a iteração dos itens importa. Métodos como map, filter e find ajudam a transformar, filtrar ou localizar elementos sem escrever tudo manualmente.', 'Modificar a lista original sem perceber efeitos colaterais.', 'Prefira criar uma nova lista ao transformar dados, especialmente em interfaces e estados de aplicação.', 'Transformar listas sem destruir o original'),
        topic('objetos', 'Objetos para representar entidades', 'Objetos', 'Agrupar propriedades de uma mesma coisa.', 'const produto = {\n  nome: "Café",\n  preco: 18,\n  disponivel: true\n};\n\nconsole.log(produto.nome);\nconsole.log("R$ " + produto.preco);', 'Objetos agrupam informações relacionadas usando pares de nome e valor. Eles representam entidades do sistema, como jogador, produto, aula, pedido ou configuração.', 'Use objetos quando diferentes dados descrevem a mesma coisa. Em vez de espalhar nome, nivel e moedas em variáveis soltas, um objeto jogador mostra que essas propriedades pertencem ao mesmo jogador.', 'Espalhar propriedades soltas sem uma entidade clara.', 'Agrupe dados que mudam e viajam juntos, usando nomes de propriedades claros e consistentes.', 'Modelar entidades com propriedades coerentes'),
        topic('busca', 'Busca linear e critério', 'Busca', 'Encontrar um item pelo critério correto.', 'const alunos = [\n  { id: 1, nome: "Ana" },\n  { id: 2, nome: "Bruno" },\n  { id: 3, nome: "Carla" }\n];\n\nconst alunoEncontrado = alunos.find((aluno) => aluno.id === 2);\n\nconsole.log(alunoEncontrado?.nome);', 'Buscar é localizar um dado dentro de uma coleção. A qualidade da busca depende do critério escolhido: id, slug, e-mail, nome ou outro valor que identifique o item.', 'Use identificadores estáveis para buscar entidades específicas. Buscar por título ou texto visível pode falhar quando o conteúdo muda, é traduzido ou se repete.', 'Buscar por título quando existe id único.', 'Use identificadores estáveis e únicos, como id ou slug, sempre que a regra pedir um item específico.', 'Buscar dados por critério confiável')
      ]),
      module('algoritmos', 'Algoritmos essenciais', 'Decomposicao, complexidade e casos de borda.', 'intermediario', [
        topic('decomposicao', 'Quebrando problemas grandes', 'Decomposicao', 'Transformar uma tarefa grande em passos menores.', 'const precoProduto = 50;\nconst quantidade = 2;\nconst frete = 10;\n\nconst subtotal = precoProduto * quantidade;\nconst totalPedido = subtotal + frete;\n\nconsole.log("Subtotal: R$ " + subtotal);\nconsole.log("Total: R$ " + totalPedido);', 'Problemas grandes confundem. Decompor revela entradas, saidas e regras intermediarias.', 'Use antes de codar telas, APIs, quizzes ou calculos.', 'Tentar resolver tudo em uma unica funcao.', 'Escreva os passos em portugues antes do codigo.', 'Dividir problema em etapas verificaveis'),
        topic('complexidade', 'Complexidade na pratica', 'Complexidade', 'Entender como custo cresce com a entrada.', 'const clientes = ["Ana", "Bruno", "Carla"];\n\nfor (const cliente of clientes) {\n  console.log("Enviando mensagem para " + cliente);\n}', 'Complexidade ajuda prever se uma solucao funciona com 10 itens e com 100 mil.', 'Use quando listas, loops aninhados ou buscas aparecem.', 'Ignorar crescimento dos dados porque funcionou no exemplo pequeno.', 'Pergunte o que acontece quando a entrada cresce 10x.', 'Escolher solucoes pensando no crescimento'),
        topic('bordas', 'Casos de borda', 'Casos de borda', 'Testar limites como vazio, zero, duplicado e ultimo item.', 'const itensDoCarrinho = [];\n\nif (itensDoCarrinho.length === 0) {\n  console.log("Carrinho vazio");\n} else {\n  console.log("Carrinho com produtos");\n}', 'Casos de borda revelam onde a regra muda de comportamento.', 'Use sempre que uma entrada vem do usuario ou de API.', 'Testar apenas o caminho feliz.', 'Inclua vazio, nulo, primeiro e ultimo nos testes.', 'Validar limites antes de confiar no fluxo')
      ]),
      module('projetos', 'Aplicando logica em projetos', 'Debug, leitura de codigo e pequenas arquiteturas.', 'avancado', [
        topic('debug', 'Debug por hipoteses', 'Debug', 'Investigar bugs com passos controlados.', 'const quantidade = 3;\nconst precoUnitario = 20;\nconst total = quantidade * precoUnitario;\n\nconsole.log({ quantidade, precoUnitario, total });', 'Debug profissional reduz incerteza. Voce cria uma hipotese, testa e conclui.', 'Use quando o app faz algo diferente do esperado.', 'Mudar varias coisas ao mesmo tempo.', 'Altere uma variavel por vez e observe o efeito.', 'Investigar bugs com metodo'),
        topic('estado', 'Estado e transicoes', 'Estado', 'Entender como uma coisa muda ao longo do tempo.', 'type EstadoTela = "parado" | "carregando" | "sucesso" | "erro";', 'Muitos bugs sao transicoes invalidas: salvar duas vezes, carregar sem dados ou concluir antes da hora.', 'Use estados nomeados para fluxos de tela e jogo.', 'Usar booleanos demais que permitem combinacoes impossiveis.', 'Modele estados como opcoes fechadas.', 'Representar fases do fluxo explicitamente'),
        topic('regras', 'Regras de negocio claras', 'Regras de negocio', 'Separar o que o sistema permite do detalhe visual.', 'const podeResgatar = !jaResgatou && missaoConcluida;', 'Regra de negocio define comportamento essencial. UI apenas apresenta essa regra.', 'Use para progresso, recompensa, bloqueio e validacao.', 'Colocar regra importante escondida em texto de botao.', 'Centralize regras que protegem progresso e economia.', 'Separar regra essencial da apresentacao')
      ])
    ]
  },
  {
    pathId: 'html-path',
    areaId: 'html',
    label: 'HTML',
    modules: [
      module('documento', 'Documento HTML', 'Estrutura base, head e conteudo principal.', 'iniciante', [
        topic('estrutura', 'Estrutura de uma pagina HTML', 'Documento HTML', 'Montar uma pagina com html, head e body bem definidos.', '<!doctype html>\n<html lang="pt-BR">\n  <head><title>Mercado do Bairro</title></head>\n  <body><main>Conteúdo principal</main></body>\n</html>', 'HTML descreve a estrutura do documento. Navegadores, buscadores e leitores de tela dependem dessa estrutura.', 'Use uma base completa para toda pagina publica.', 'Comecar direto com divs sem lang, title ou main.', 'Defina idioma, titulo e regiao principal.', 'Criar documento com estrutura completa'),
        topic('head', 'Head, title e metadados', 'Metadados', 'Configurar informacoes que nao aparecem como conteudo principal.', '<head>\n  <title>Perfil | CodeQuest</title>\n  <meta name="description" content="Perfil do jogador" />\n</head>', 'Metadados ajudam SEO, abas, compartilhamento e acessibilidade.', 'Use title unico e description objetiva em paginas importantes.', 'Repetir o mesmo title em todas as paginas.', 'Escreva title especifico e description real.', 'Usar metadados para orientar navegador e busca'),
        topic('main', 'Main e hierarquia de conteudo', 'Semantica principal', 'Marcar o conteudo central com main e titulos ordenados.', '<main>\n  <h1>Academia Dev</h1>\n  <section><h2>Aulas disponíveis</h2></section>\n</main>', 'Hierarquia ajuda pessoas e tecnologias a entenderem onde estao.', 'Use um h1 por tela e secoes com h2/h3.', 'Pular de h1 para h4 por tamanho visual.', 'Escolha heading por estrutura, nao por aparencia.', 'Criar hierarquia navegavel')
      ]),
      module('semantica', 'Semantica e acessibilidade', 'Tags que comunicam papel real do conteudo.', 'iniciante', [
        topic('landmarks', 'Header, nav, main e footer', 'Landmarks', 'Usar regioes semanticas para navegacao assistiva.', '<header>Topo</header>\n<nav>Menu</nav>\n<main>Conteúdo</main>\n<footer>Rodapé</footer>', 'Landmarks permitem que leitores de tela saltem entre regioes.', 'Use quando a pagina tem blocos com papel claro.', 'Usar div para tudo e perder navegacao semantica.', 'Prefira tags semanticas quando o papel existe.', 'Dividir pagina por regioes reconheciveis'),
        topic('buttons-links', 'Links e botoes sem confundir', 'Acoes e navegacao', 'Escolher a tag certa para acao ou navegacao.', '<a href="/ranking">Ranking</a>\n<button type="button">Salvar</button>', 'Links levam a outro lugar. Botoes executam uma acao.', 'Use a para navegacao e button para acao.', 'Criar div clicavel sem teclado.', 'Use controles nativos antes de inventar interacao.', 'Diferenciar acao de navegacao'),
        topic('alt', 'Imagens com texto alternativo', 'Texto alternativo', 'Descrever imagens relevantes para quem nao as ve.', '<img src="medalha.png" alt="Medalha de JavaScript concluído" />', 'alt comunica significado quando imagem falha ou quando usuario usa leitor de tela.', 'Use descricoes curtas para imagens informativas.', 'Colocar alt como "imagem" ou repetir arquivo.', 'Descreva o significado, nao o formato.', 'Tornar imagens compreensiveis')
      ]),
      module('formularios', 'Formularios profissionais', 'Inputs, labels, validacao e agrupamento.', 'intermediario', [
        topic('label', 'Labels conectados a inputs', 'Label', 'Associar nome do campo ao controle.', '<label for="email">Email</label>\n<input id="email" name="email" type="email" />', 'Label melhora clique, foco e leitura por tecnologia assistiva.', 'Use label visivel para todo campo importante.', 'Usar placeholder como unico nome do campo.', 'Placeholder ajuda, mas label identifica.', 'Conectar campos aos seus nomes'),
        topic('input-types', 'Tipos de input', 'Tipos de formulario', 'Escolher input adequado ao dado esperado.', '<input name="email" type="email" autocomplete="email" />\n<input name="senha" type="password" autocomplete="current-password" />', 'Tipos corretos ativam teclado adequado, validacao nativa e autocomplete.', 'Use email, number, password, date conforme o dado.', 'Usar type text para tudo.', 'Aproveite recursos nativos do navegador.', 'Escolher controle pelo dado'),
        topic('fieldset', 'Agrupando campos relacionados', 'Fieldset', 'Organizar grupos de opcoes com contexto.', '<fieldset>\n  <legend>Plano</legend>\n  <label><input type="radio" /> Premium</label>\n</fieldset>', 'Grupos ajudam entender perguntas com varias opcoes.', 'Use para radio buttons, checkboxes e secoes de formulario.', 'Criar varios inputs soltos sem pergunta clara.', 'Agrupe opcoes sob uma legenda.', 'Dar contexto para grupos de campos')
      ]),
      module('midia', 'Conteudo rico', 'Tabelas, listas, video e conteudo estruturado.', 'intermediario', [
        topic('listas', 'Listas ordenadas e nao ordenadas', 'Listas', 'Representar sequencias e conjuntos de itens.', '<ol>\n  <li>Ler</li>\n  <li>Praticar</li>\n</ol>', 'Listas carregam significado de agrupamento e ordem.', 'Use ol quando a ordem muda o sentido; ul quando nao muda.', 'Usar paragrafo com hifens falsos.', 'Use lista real para itens repetidos.', 'Escolher lista pelo significado'),
        topic('tabelas', 'Tabelas para dados tabulares', 'Tabelas', 'Mostrar relacoes de linhas e colunas.', '<table>\n  <thead><tr><th>Aluno</th><th>XP</th></tr></thead>\n</table>', 'Tabelas sao para dados comparaveis, nao para layout.', 'Use para ranking, relatorios e matrizes.', 'Usar tabela para posicionar card visual.', 'Reserve table para dados tabulares.', 'Apresentar dados comparaveis corretamente'),
        topic('details', 'Details e disclosure', 'Conteudo expansivel', 'Revelar detalhes sem sobrecarregar a pagina.', '<details>\n  <summary>Erros comuns</summary>\n  <p>Use labels...</p>\n</details>', 'Disclosure reduz ruido e mantem informacao acessivel.', 'Use para FAQ, exemplos longos e detalhes opcionais.', 'Esconder informacao essencial em bloco fechado.', 'Deixe o caminho principal visivel.', 'Organizar detalhes opcionais')
      ]),
      module('qualidade', 'Qualidade HTML', 'Validacao, SEO, performance e manutencao.', 'avancado', [
        topic('validacao', 'HTML valido e previsivel', 'Validacao HTML', 'Evitar estrutura quebrada que o navegador tenta corrigir.', '<button type="submit">Enviar</button>', 'HTML invalido pode funcionar por acaso e quebrar acessibilidade.', 'Valide nesting, ids unicos e atributos obrigatorios.', 'Duplicar ids ou aninhar elementos interativos.', 'Rode validacao e revise HTML gerado.', 'Escrever estrutura que nao dependa de correcao automatica'),
        topic('seo', 'SEO tecnico basico', 'SEO', 'Ajudar buscadores a entenderem paginas.', '<meta property="og:title" content="Code Quest" />', 'SEO tecnico comeca em titulo, descricao, hierarquia e links claros.', 'Use quando conteudo precisa ser encontrado ou compartilhado.', 'Escrever titulo generico e headings desordenados.', 'Combine semantica, conteudo real e metadata.', 'Tornar pagina compreensivel para busca'),
        topic('a11y-check', 'Checklist de acessibilidade HTML', 'Acessibilidade', 'Revisar teclado, nome acessivel e estrutura.', '<button aria-label="Fechar modal">X</button>', 'Acessibilidade nao e detalhe final; e parte da entrega.', 'Use quando criar controles, modais, forms ou menus.', 'Depender apenas de cor ou mouse.', 'Teste teclado e leitor de tela em fluxos criticos.', 'Garantir acesso por teclado e tecnologia assistiva')
      ])
    ]
  }
];

const additionalPath = (pathId: string, areaId: Lesson['areaId'], label: string, topics: [string, string, string][]): PathSpec => ({
  pathId,
  areaId,
  label,
  modules: [
    module('fundamentos', `Fundamentos de ${label}`, `Base essencial para comecar ${label}.`, 'iniciante', topics.slice(0, 3).map(([slug, title, concept]) => topic(slug, title, concept, `Entender ${concept} em ${label} e aplicar em um exemplo pequeno.`, sampleCode(areaId, slug, concept, label), `${concept} cria uma base para escrever solucoes de ${label} com clareza e menos surpresa.`, `Aplique ${concept} em um exemplo pequeno antes de levar para um projeto maior.`, `Usar ${concept} como receita decorada sem entender a regra.`, `Explique ${concept} com suas palavras e teste um exemplo simples.`, `Aplicar ${concept} para resolver um problema pequeno.`))),
    module('pratica', `${label} na pratica`, `Tecnicas usadas em tarefas reais de ${label}.`, 'iniciante', topics.slice(3, 6).map(([slug, title, concept]) => topic(slug, title, concept, `Praticar ${concept} em um fluxo real.`, sampleCode(areaId, slug, concept, label), `${concept} aparece quando a aplicacao precisa sair do exemplo e lidar com dados, usuarios e mudancas.`, `Use ${concept} para criar uma decisao verificavel e facil de revisar.`, `Misturar ${concept} com responsabilidades que deveriam ficar separadas.`, `Mantenha ${concept} pequeno, nomeado e testavel.`, `Usar ${concept} com uma responsabilidade clara.`))),
    module('qualidade', `Qualidade em ${label}`, `Boas praticas para codigo confiavel.`, 'intermediario', topics.slice(6, 9).map(([slug, title, concept]) => topic(slug, title, concept, `Melhorar qualidade usando ${concept}.`, sampleCode(areaId, slug, concept, label), `${concept} reduz bugs porque torna o comportamento mais explicito e facil de discutir em revisão.`, `Aplique ${concept} onde houver duplicacao, regra escondida ou falha dificil de diagnosticar.`, `Tratar ${concept} como detalhe estetico em vez de regra de manutencao.`, `Use ${concept} para comunicar intencao a outra pessoa dev.`, `Melhorar manutencao com ${concept}.`))),
    module('arquitetura', `Arquitetura de ${label}`, `Como organizar solucoes maiores.`, 'intermediario', topics.slice(9, 12).map(([slug, title, concept]) => topic(slug, title, concept, `Organizar codigo com ${concept}.`, sampleCode(areaId, slug, concept, label), `${concept} ajuda quando o projeto cresce e varias partes precisam colaborar sem virar confusao.`, `Use ${concept} para separar decisoes, dados e efeitos colaterais.`, `Centralizar tudo em um arquivo gigante.`, `Crie fronteiras claras e contratos pequenos.`, `Organizar responsabilidades com ${concept}.`))),
    module('profissional', `${label} profissional`, `Temas avancados para mercado e entrevistas.`, 'avancado', topics.slice(12, 15).map(([slug, title, concept]) => topic(slug, title, concept, `Aplicar ${concept} em contexto profissional.`, sampleCode(areaId, slug, concept, label), `${concept} e cobrado quando qualidade, escala, seguranca ou colaboracao importam de verdade.`, `Use ${concept} para tomar decisoes explicaveis, nao para parecer sofisticado.`, `Escolher ${concept} sem avaliar custo e beneficio.`, `Compare alternativas e registre o motivo da escolha.`, `Defender uma decisao tecnica usando ${concept}.`)))
  ]
});

function sampleCode(areaId: Lesson['areaId'], _slug: string, concept = 'Conceito', label: string = areaId) {
  const nomeConceito = pt(concept)
    .toLowerCase()
    .replace(/\breview\b/g, 'revisao')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9áéíóúãõç]+/gi, '-');
  const samples: Partial<Record<Lesson['areaId'], string>> = {
    css: `.cartao-${nomeConceito} {\n  display: flex;\n  gap: 16px;\n}`,
    javascript: `const produtos = [\n  { nome: "Arroz", disponivel: true },\n  { nome: "Feijão", disponivel: false },\n  { nome: "Macarrão", disponivel: true }\n];\n\nconst produtosDisponiveis = produtos.filter((produto) => produto.disponivel);\n\nconsole.log(produtosDisponiveis);`,
    typescript: `type ResultadoConsulta = { ok: true; dados: string } | { ok: false; erro: string };\n\nconst resposta: ResultadoConsulta = {\n  ok: true,\n  dados: "Aula encontrada"\n};\n\nconsole.log(resposta);`,
    react: `import { Text } from "react-native";\n\ntype PropriedadesCartao = {\n  titulo: string;\n};\n\nfunction CartaoAula({ titulo }: PropriedadesCartao) {\n  return <Text>{titulo}</Text>;\n}`,
    node: `const pedidos = [\n  { numero: 101, pago: true },\n  { numero: 102, pago: false }\n];\n\nconst pedidosPagos = pedidos.filter((pedido) => pedido.pago);\n\nconsole.log(pedidosPagos);`,
    rest: `GET /api/aulas?limite=20`,
    sql: `SELECT id, titulo FROM aulas WHERE publicada = true;`,
    git: `git switch -c feature/${nomeConceito}`,
    python: `def normalizar_nome(nome):\n    return nome.strip().title()\n\nnome_aluno = normalizar_nome(" ana maria ")\nprint(nome_aluno)`,
    java: `public class Aula {\n  private final String titulo;\n\n  public Aula(String titulo) {\n    this.titulo = titulo;\n  }\n\n  public String getTitulo() {\n    return titulo;\n  }\n}`,
    kotlin: `val usuario = mapOf("nome" to "Ana")\nval tamanho = usuario["nome"]?.length ?: 0\n\nprintln(tamanho)`,
    csharp: `public record Aula(string Titulo, int Minutos);\n\nvar aula = new Aula("Variáveis", 10);\nConsole.WriteLine(aula.Titulo);`,
    interview: `problema -> exemplos -> solução simples -> trade-off`
  };
  const sample = samples[areaId] ?? `// Exemplo prático: ${pt(concept)}`;
  const noteText = `${pt(label)} / ${pt(concept)}`;
  const note = areaId === 'css' ? `/* Conceito praticado: ${noteText} */` : areaId === 'html' ? `<!-- Conceito praticado: ${noteText} -->` : areaId === 'sql' ? `-- Conceito praticado: ${noteText}` : `// Conceito praticado: ${noteText}`;
  return `${sample}\n${note}`;
}

const compactTopics: Record<string, [string, string, string][]> = {
  css: [['cascade', 'Cascata e especificidade', 'Cascata'], ['box-model', 'Box model sem sustos', 'Box model'], ['selectors', 'Seletores legiveis', 'Seletores'], ['flexbox', 'Flexbox em uma dimensao', 'Flexbox'], ['grid', 'Grid em duas dimensoes', 'CSS Grid'], ['responsive', 'Responsividade mobile first', 'Responsividade'], ['tokens', 'Design tokens', 'Design tokens'], ['states', 'Estados hover, focus e disabled', 'Estados de UI'], ['animations', 'Animacoes performaticas', 'Animacoes'], ['architecture', 'Arquitetura CSS', 'Arquitetura CSS'], ['components', 'CSS por componente', 'Componentizacao'], ['themes', 'Temas e variaveis', 'Temas'], ['a11y', 'CSS acessivel', 'Acessibilidade visual'], ['performance', 'Performance de estilos', 'Performance'], ['review', 'Revisão de CSS', 'Revisão visual']],
  javascript: [['values', 'Valores e variaveis', 'Valores'], ['functions', 'Funcoes como blocos', 'Funcoes'], ['objects', 'Objetos e propriedades', 'Objetos'], ['arrays', 'Arrays modernos', 'Arrays'], ['map-filter', 'Map, filter e reduce', 'Transformacoes'], ['dom', 'DOM e eventos', 'DOM'], ['async', 'Promises e async await', 'Assincronia'], ['errors', 'Tratamento de erros', 'Erros'], ['modules', 'Modulos ES', 'Modulos'], ['state', 'Estado no front-end', 'Estado'], ['storage', 'Storage local', 'Persistencia'], ['testing', 'Testes basicos', 'Testes'], ['performance', 'Main thread e performance', 'Performance'], ['security', 'Seguranca no navegador', 'Seguranca'], ['debugging', 'Debugging JavaScript', 'Debug']],
  typescript: [['annotations', 'Anotacoes de tipo', 'Tipos'], ['interfaces', 'Interfaces e contratos', 'Interfaces'], ['unions', 'Union types', 'Unions'], ['narrowing', 'Narrowing e guards', 'Type guards'], ['unknown', 'Unknown na borda', 'Unknown'], ['generics', 'Generics uteis', 'Generics'], ['discriminated', 'Unions discriminadas', 'Estados tipados'], ['utility', 'Utility types', 'Utility types'], ['readonly', 'Readonly e imutabilidade', 'Imutabilidade'], ['api-types', 'Tipos para APIs', 'Contratos'], ['domain', 'Tipos de dominio', 'Modelagem'], ['errors', 'Erros tipados', 'Erros'], ['strict', 'Modo strict', 'Strict mode'], ['refactor', 'Refatoracao com tipos', 'Refatoracao'], ['review', 'Revisão TypeScript', 'Revisão']],
  react: [['components', 'Componentes reutilizaveis', 'Componentes'], ['props', 'Props claras', 'Props'], ['jsx', 'JSX e composicao', 'JSX'], ['state', 'useState', 'Estado'], ['events', 'Eventos em React', 'Eventos'], ['forms', 'Formularios controlados', 'Forms'], ['effect', 'useEffect completo', 'useEffect'], ['cleanup', 'Cleanup de efeitos', 'Cleanup'], ['lists', 'Listas e keys', 'Keys'], ['context', 'Context com criterio', 'Context'], ['hooks', 'Hooks customizados', 'Hooks'], ['architecture', 'Arquitetura de componentes', 'Arquitetura'], ['performance', 'Memoizacao real', 'Performance'], ['a11y', 'Acessibilidade React', 'Acessibilidade'], ['testing', 'Testes de UI', 'Testes']],
  reactNative: [['view-text', 'View e Text', 'Componentes nativos'], ['style', 'StyleSheet e layout', 'Estilos'], ['touch', 'Toques e botoes', 'Interacao'], ['navigation', 'Fluxos de navegacao', 'Navegacao'], ['forms', 'Inputs mobile', 'Forms mobile'], ['lists', 'FlatList e listas longas', 'FlatList'], ['storage', 'AsyncStorage', 'Persistencia local'], ['network', 'Chamadas de rede', 'Rede'], ['feedback', 'Loading e erro', 'Feedback'], ['responsive', 'Telas pequenas', 'Responsividade'], ['accessibility', 'Acessibilidade mobile', 'Acessibilidade'], ['offline', 'Local first', 'Offline'], ['performance', 'Performance mobile', 'Performance'], ['release', 'Preparacao para loja', 'Release'], ['expo', 'Expo Go e limites', 'Expo']],
  node: [['runtime', 'Runtime Node.js', 'Runtime'], ['npm', 'npm e package.json', 'npm'], ['modules', 'Modulos no Node', 'Modulos'], ['express', 'Rotas Express', 'Rotas'], ['middleware', 'Middlewares', 'Middleware'], ['validation', 'Validacao no servidor', 'Validacao'], ['async-errors', 'Erros assincronos', 'Erros async'], ['env', 'Variaveis de ambiente', 'Config'], ['security', 'Seguranca basica', 'Seguranca'], ['services', 'Services e regras', 'Services'], ['repositories', 'Camada de dados', 'Repositorios'], ['logging', 'Logs uteis', 'Logs'], ['observability', 'Observabilidade', 'Observabilidade'], ['scaling', 'Escalando APIs', 'Escala'], ['deploy', 'Deploy com criterio', 'Deploy']],
  rest: [['resources', 'Recursos REST', 'Recursos'], ['methods', 'Metodos HTTP', 'Metodos'], ['status', 'Status codes', 'Status'], ['payload', 'Payloads e contratos', 'Contratos'], ['validation', 'Validacao de entrada', 'Validacao'], ['errors', 'Erros de API', 'Erros'], ['pagination', 'Paginacao', 'Paginacao'], ['filtering', 'Filtros e ordenacao', 'Filtros'], ['auth', 'Autenticacao', 'Auth'], ['authorization', 'Autorizacao', 'Permissoes'], ['versioning', 'Versionamento', 'Versoes'], ['idempotency', 'Idempotencia', 'Idempotencia'], ['rate-limit', 'Rate limit', 'Rate limit'], ['docs', 'Documentacao de API', 'Documentacao'], ['contracts', 'Compatibilidade de contratos', 'Compatibilidade']],
  sql: [['tables', 'Tabelas, linhas e colunas', 'Tabelas'], ['select', 'SELECT completo', 'SELECT'], ['where', 'WHERE e filtros', 'WHERE'], ['join', 'JOINs na pratica', 'JOIN'], ['group', 'GROUP BY', 'Agregacao'], ['having', 'HAVING', 'Filtros agregados'], ['indexes', 'Indices', 'Indices'], ['transactions', 'Transacoes', 'Transacoes'], ['constraints', 'Constraints', 'Constraints'], ['modeling', 'Modelagem relacional', 'Modelagem'], ['normalization', 'Normalizacao', 'Normalizacao'], ['migrations', 'Migrations', 'Migrations'], ['injection', 'SQL Injection', 'Seguranca'], ['performance', 'Query performance', 'Performance'], ['backup', 'Backup e recuperacao', 'Backup']],
  git: [['init', 'Repositorios', 'Repositorio'], ['status', 'git status', 'Status'], ['commit', 'Commits atomicos', 'Commits'], ['branch', 'Branches', 'Branch'], ['merge', 'Merge', 'Merge'], ['conflicts', 'Conflitos', 'Conflitos'], ['remote', 'Remotos', 'Remotos'], ['pull-request', 'Pull requests', 'PR'], ['review', 'Revisão de código', 'Revisão'], ['rebase', 'Rebase com cuidado', 'Rebase'], ['tags', 'Tags e releases', 'Releases'], ['workflow', 'Git flow simples', 'Workflow'], ['ci', 'CI no GitHub', 'CI'], ['portfolio', 'GitHub como portfolio', 'Portfolio'], ['security', 'Segredos no Git', 'Seguranca']],
  python: [['syntax', 'Sintaxe Python', 'Sintaxe'], ['lists', 'Listas', 'Listas'], ['dicts', 'Dicionarios', 'Dicts'], ['functions', 'Funcoes', 'Funcoes'], ['modules', 'Modulos', 'Modulos'], ['files', 'Arquivos com with', 'Arquivos'], ['comprehension', 'Comprehensions', 'Comprehensions'], ['exceptions', 'Excecoes', 'Excecoes'], ['venv', 'Ambientes virtuais', 'venv'], ['oop', 'Classes em Python', 'OOP'], ['typing', 'Type hints', 'Type hints'], ['testing', 'Testes com pytest', 'Testes'], ['automation', 'Automacao', 'Automacao'], ['data', 'Dados e CSV', 'Dados'], ['quality', 'Codigo pythonico', 'Qualidade']],
  java: [['classes', 'Classes e objetos', 'OOP'], ['main', 'Metodo main', 'Main'], ['types', 'Tipos e wrappers', 'Tipos'], ['collections', 'Collections', 'Collections'], ['strings', 'String e equals', 'Strings'], ['exceptions', 'Excecoes', 'Excecoes'], ['interfaces', 'Interfaces', 'Interfaces'], ['generics', 'Generics', 'Generics'], ['streams', 'Streams', 'Streams'], ['immutability', 'Imutabilidade', 'Imutabilidade'], ['packages', 'Packages', 'Packages'], ['testing', 'JUnit', 'Testes'], ['jvm', 'JVM', 'JVM'], ['concurrency', 'Concorrencia', 'Concorrencia'], ['architecture', 'Arquitetura Java', 'Arquitetura']],
  kotlin: [['val-var', 'val e var', 'Imutabilidade'], ['null-safety', 'Null Safety completo', 'Null Safety'], ['strings', 'Strings e templates', 'Strings'], ['data-class', 'Data classes', 'Data classes'], ['collections', 'Colecoes Kotlin', 'Colecoes'], ['scope', 'let, apply, run', 'Scope functions'], ['sealed', 'Sealed classes', 'Estados fechados'], ['when', 'when expressivo', 'when'], ['extensions', 'Extension functions', 'Extensions'], ['coroutines', 'Coroutines', 'Coroutines'], ['flow', 'Flow basico', 'Flow'], ['android', 'Kotlin no Android', 'Android'], ['architecture', 'Arquitetura mobile', 'Arquitetura'], ['testing', 'Testes Kotlin', 'Testes'], ['interop', 'Interoperabilidade Java', 'Interop']],
  csharp: [['dotnet', '.NET e runtime', '.NET'], ['classes', 'Classes em C#', 'OOP'], ['properties', 'Properties', 'Properties'], ['records', 'Records', 'Records'], ['collections', 'Collections', 'Collections'], ['linq', 'LINQ', 'LINQ'], ['nullable', 'Nullable references', 'Nullability'], ['exceptions', 'Excecoes', 'Excecoes'], ['async', 'async await', 'Async'], ['interfaces', 'Interfaces', 'Interfaces'], ['dependency', 'Injecao de dependencia', 'DI'], ['webapi', 'ASP.NET Web API', 'Web API'], ['testing', 'Testes .NET', 'Testes'], ['performance', 'Performance .NET', 'Performance'], ['architecture', 'Arquitetura C#', 'Arquitetura']],
  career: [['routine', 'Rotina de estudo', 'Rotina'], ['portfolio', 'Portfolio real', 'Portfolio'], ['readme', 'README profissional', 'README'], ['linkedin', 'LinkedIn dev', 'LinkedIn'], ['networking', 'Networking sem teatro', 'Networking'], ['applications', 'Candidaturas', 'Vagas'], ['freelance', 'Freela com escopo', 'Freelance'], ['communication', 'Comunicacao', 'Comunicacao'], ['feedback', 'Feedback e evolucao', 'Feedback'], ['planning', 'Plano de 90 dias', 'Planejamento'], ['projects', 'Projetos progressivos', 'Projetos'], ['habits', 'Habitos sustentaveis', 'Habitos'], ['salary', 'Negociacao inicial', 'Negociacao'], ['teamwork', 'Trabalho em equipe', 'Equipe'], ['growth', 'Plano de carreira', 'Crescimento']],
  interview: [['thinking', 'Pensar em voz alta', 'Comunicacao'], ['examples', 'Exemplos antes do codigo', 'Exemplos'], ['bruteforce', 'Solucao simples primeiro', 'Brute force'], ['complexity', 'Complexidade Big O', 'Complexidade'], ['arrays', 'Arrays em entrevista', 'Arrays'], ['strings', 'Strings em entrevista', 'Strings'], ['hashmap', 'Hash maps', 'Hash maps'], ['debugging', 'Debugging ao vivo', 'Debug'], ['tradeoffs', 'Trade-offs', 'Trade-offs'], ['system', 'System design simples', 'System design'], ['api-design', 'Design de API em entrevista', 'API design'], ['testing', 'Testando sua resposta', 'Testes'], ['behavioral', 'Perguntas comportamentais', 'Comportamental'], ['portfolio-talk', 'Explicando portfolio', 'Portfolio'], ['closing', 'Perguntas ao entrevistador', 'Fechamento']]
};

specs.push(
  additionalPath('css-path', 'css', 'CSS', compactTopics.css),
  additionalPath('javascript-path', 'javascript', 'JavaScript', compactTopics.javascript),
  additionalPath('typescript-path', 'typescript', 'TypeScript', compactTopics.typescript),
  additionalPath('react-path', 'react', 'React', compactTopics.react),
  additionalPath('react-native-path', 'react', 'React Native', compactTopics.reactNative),
  additionalPath('node-path', 'node', 'Node.js', compactTopics.node),
  additionalPath('api-path', 'rest', 'APIs REST', compactTopics.rest),
  additionalPath('sql-path', 'sql', 'SQL', compactTopics.sql),
  additionalPath('git-path', 'git', 'Git e GitHub', compactTopics.git),
  additionalPath('python-path', 'python', 'Python', compactTopics.python),
  additionalPath('java-path', 'java', 'Java', compactTopics.java),
  additionalPath('kotlin-path', 'kotlin', 'Kotlin', compactTopics.kotlin),
  additionalPath('csharp-path', 'csharp', 'C#', compactTopics.csharp),
  additionalPath('career-path', 'git', 'Carreira Dev', compactTopics.career),
  additionalPath('interview-path', 'interview', 'Entrevista Tecnica', compactTopics.interview)
);

export const academyModules: AcademyModule[] = specs.flatMap((path) =>
  path.modules.map((item, index) => ({
    id: `${path.pathId}-${item.slug}`,
    pathId: path.pathId,
    title: pt(item.title),
    description: pt(item.description),
    order: index + 1
  }))
);

export const lessons: Lesson[] = specs.flatMap((path) =>
  path.modules.flatMap((moduleSpec, moduleIndex) =>
    moduleSpec.topics.map((topicSpec, topicIndex) => buildLesson(path, moduleSpec, topicSpec, moduleIndex, topicIndex))
  )
);

export const protectedAcademyLessonIds = lessons.map((lesson) => lesson.id);

export const modulesByPath = (pathId: string) => academyModules.filter((item) => item.pathId === pathId).sort((a, b) => a.order - b.order);
export const lessonsByPath = (pathId: string) => lessons.filter((item) => item.pathId === pathId).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
export const lessonsByModule = (moduleId: string) => lessons.filter((item) => item.moduleId === moduleId).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
export const lessonById = (lessonId: string) => lessons.find((item) => item.id === lessonId);

export const recommendedLessonFor = (areaId?: Lesson['areaId'], concept?: string) => {
  if (!areaId) return undefined;
  const normalizedConcept = concept?.toLowerCase() ?? '';
  return (
    lessons.find((item) => item.areaId === areaId && normalizedConcept.includes(item.concept.toLowerCase())) ??
    lessons.find((item) => item.areaId === areaId)
  );
};
