import { CodeLabChallenge, CodeLabChallengeKind, CodeLabValidationRule } from '../types/codeLab';
import { AreaId, Difficulty } from '../types/game';

type ChallengeSeed = {
  id: string;
  title: string;
  language: string;
  areaId: AreaId;
  concept: string;
  difficulty: Difficulty;
  kind: CodeLabChallengeKind;
  objective: string;
  context: string;
  starterCode: string;
  solution: string;
  rules: CodeLabValidationRule[];
  tags: string[];
};

const required = (id: string, value: string, message: string): CodeLabValidationRule => ({ id, type: 'required-fragment', value, message });
const forbidden = (id: string, value: string, message: string): CodeLabValidationRule => ({ id, type: 'forbidden-fragment', value, message });
const ordered = (id: string, values: string[], message: string): CodeLabValidationRule => ({ id, type: 'ordered-fragments', values, message });
const regex = (id: string, value: string, message: string): CodeLabValidationRule => ({ id, type: 'regex', value, message });

const makeChallenge = (seed: ChallengeSeed): CodeLabChallenge => ({
  ...seed,
  description: `${seed.language}: pratique ${seed.concept} validando estrutura e intenção, sem execução arbitrária de código.`,
  instructions: [
    'Leia o contexto antes de alterar o código inicial.',
    'Complete a solução com nomes claros e mantendo o objetivo do exercício.',
    'Use “Validar solução” para receber feedback determinístico.'
  ],
  validationRules: seed.rules,
  testCases: [
    { id: `${seed.id}-visible`, description: 'Critério visível', expected: seed.objective },
    { id: `${seed.id}-hidden`, description: 'Critério interno de consistência', expected: 'Estrutura segura e legível', hidden: true }
  ],
  hints: [
    `Conceito: ${seed.concept} resolve uma parte específica do problema, não o fluxo inteiro.`,
    'Estrutura: comece pelo menor trecho que deixa a intenção clara.',
    'Próximo da solução: confira se os nomes e a ordem dos comandos combinam com o critério de aceite.'
  ],
  solutionExplanation: `A solução usa ${seed.concept} para atender ao objetivo sem executar código no app. A validação confere trechos, ordem e estrutura mínima.`,
  acceptanceCriteria: [
    'A solução não fica vazia.',
    'Os trechos obrigatórios aparecem com contexto coerente.',
    'Nenhum trecho proibido é usado para contornar a validação.'
  ],
  estimatedMinutes: seed.difficulty === 'iniciante' ? 8 : 12,
  xpReward: seed.difficulty === 'iniciante' ? 70 : 95,
  coinReward: seed.difficulty === 'iniciante' ? 25 : 35
});

const seeds: ChallengeSeed[] = [
  {
    id: 'lab-js-filter-active-users',
    title: 'Filtrar usuários ativos',
    language: 'JavaScript',
    areaId: 'javascript',
    concept: 'filter',
    difficulty: 'iniciante',
    kind: 'complete-code',
    objective: 'Criar uma lista apenas com usuários ativos.',
    context: 'Um painel precisa mostrar somente contas que podem receber notificação.',
    starterCode: 'const usuariosAtivos = usuarios.____((usuario) => usuario.ativo);',
    solution: 'const usuariosAtivos = usuarios.filter((usuario) => usuario.ativo);',
    rules: [required('uses-filter', '.filter', 'Use filter para criar uma nova lista.'), required('checks-active', 'usuario.ativo', 'Verifique a propriedade ativo.'), forbidden('no-push', '.push', 'Não modifique a lista original com push.')],
    tags: ['javascript', 'array', 'filter']
  },
  {
    id: 'lab-js-async-loading',
    title: 'Carregar dados com async',
    language: 'JavaScript',
    areaId: 'javascript',
    concept: 'async await',
    difficulty: 'intermediario',
    kind: 'fix-bug',
    objective: 'Aguardar a resposta antes de retornar os dados.',
    context: 'Uma tela renderiza antes da API responder e mostra estado vazio indevido.',
    starterCode: 'async function buscarPerfil() {\n  const resposta = fetch(url);\n  return resposta.json();\n}',
    solution: 'async function buscarPerfil() {\n  const resposta = await fetch(url);\n  return await resposta.json();\n}',
    rules: [required('await-fetch', 'await fetch', 'A chamada fetch precisa ser aguardada.'), required('json-call', '.json()', 'Converta a resposta para JSON.'), ordered('order', ['await fetch', '.json()'], 'Busque os dados antes de converter a resposta.')],
    tags: ['javascript', 'async']
  },
  {
    id: 'lab-js-error-message',
    title: 'Mensagem de erro previsível',
    language: 'JavaScript',
    areaId: 'javascript',
    concept: 'tratamento de erro',
    difficulty: 'intermediario',
    kind: 'implement-function',
    objective: 'Retornar uma mensagem segura quando uma operação falhar.',
    context: 'Um formulário precisa mostrar erro sem expor detalhes técnicos.',
    starterCode: 'function mensagemErro(erro) {\n  ____\n}',
    solution: 'function mensagemErro(erro) {\n  return erro?.message || "Não foi possível concluir a ação.";\n}',
    rules: [required('return', 'return', 'A função precisa retornar uma mensagem.'), required('fallback', 'Não foi possível', 'Inclua uma mensagem padrão em português.'), forbidden('console-only', 'console.log', 'Não basta escrever no console.')],
    tags: ['javascript', 'erros']
  },
  {
    id: 'lab-js-map-labels',
    title: 'Gerar rótulos de produtos',
    language: 'JavaScript',
    areaId: 'javascript',
    concept: 'map',
    difficulty: 'iniciante',
    kind: 'complete-code',
    objective: 'Transformar produtos em textos de exibição.',
    context: 'Uma lista compacta precisa mostrar nome e preço em cada linha.',
    starterCode: 'const rotulos = produtos.____((produto) => `${produto.nome} - R$ ${produto.preco}`);',
    solution: 'const rotulos = produtos.map((produto) => `${produto.nome} - R$ ${produto.preco}`);',
    rules: [required('map', '.map', 'Use map para transformar cada produto.'), required('name', 'produto.nome', 'Inclua o nome do produto.'), required('price', 'produto.preco', 'Inclua o preço do produto.')],
    tags: ['javascript', 'array', 'map']
  },
  {
    id: 'lab-js-guard-empty-cart',
    title: 'Proteger carrinho vazio',
    language: 'JavaScript',
    areaId: 'javascript',
    concept: 'caso de borda',
    difficulty: 'iniciante',
    kind: 'fix-bug',
    objective: 'Evitar cálculo quando o carrinho não tem itens.',
    context: 'Uma tela de checkout deve orientar o usuário antes de calcular total.',
    starterCode: 'function totalCarrinho(itens) {\n  ____\n  return itens.reduce((total, item) => total + item.preco, 0);\n}',
    solution: 'function totalCarrinho(itens) {\n  if (!itens.length) return 0;\n  return itens.reduce((total, item) => total + item.preco, 0);\n}',
    rules: [required('empty-check', '!itens.length', 'Verifique carrinho vazio antes do reduce.'), required('reduce', '.reduce', 'Mantenha o cálculo com reduce.'), ordered('guard-first', ['!itens.length', '.reduce'], 'O caso vazio deve vir antes do cálculo.')],
    tags: ['javascript', 'bordas']
  },
  {
    id: 'lab-js-refactor-discount',
    title: 'Refatorar desconto nomeado',
    language: 'JavaScript',
    areaId: 'javascript',
    concept: 'refatoração',
    difficulty: 'avancado',
    kind: 'refactor',
    objective: 'Dar nome claro para a regra de desconto.',
    context: 'Uma regra de campanha ficou escondida em uma expressão longa.',
    starterCode: 'const final = preco - preco * 0.1;',
    solution: 'const percentualDesconto = 0.1;\nconst valorDesconto = preco * percentualDesconto;\nconst precoFinal = preco - valorDesconto;',
    rules: [required('named-percent', 'percentualDesconto', 'Nomeie o percentual do desconto.'), required('named-value', 'valorDesconto', 'Separe o valor calculado.'), forbidden('magic-expression', 'preco - preco * 0.1', 'Evite manter a expressão sem nomes intermediários.')],
    tags: ['javascript', 'refatoracao']
  },
  {
    id: 'lab-js-predict-reduce',
    title: 'Prever soma com reduce',
    language: 'JavaScript',
    areaId: 'javascript',
    concept: 'saída',
    difficulty: 'iniciante',
    kind: 'predict-output',
    objective: 'Informar o resultado da soma acumulada.',
    context: 'Uma revisão de PR pede que você explique a saída antes de aprovar.',
    starterCode: 'const pontos = [2, 3, 5];\nconst total = pontos.reduce((soma, ponto) => soma + ponto, 0);\n// resposta: ____',
    solution: 'const pontos = [2, 3, 5];\nconst total = pontos.reduce((soma, ponto) => soma + ponto, 0);\n// resposta: 10',
    rules: [required('answer', '10', 'A resposta deve indicar o total correto.'), required('reduce', 'reduce', 'Mantenha o contexto do reduce.'), regex('answer-comment', 'resposta\\s*:\\s*10', 'Escreva o resultado no comentário de resposta.')],
    tags: ['javascript', 'saida']
  },
  {
    id: 'lab-js-project-validation',
    title: 'Mini-validação de cadastro',
    language: 'JavaScript',
    areaId: 'javascript',
    concept: 'mini-projeto',
    difficulty: 'avancado',
    kind: 'mini-project',
    objective: 'Validar nome e e-mail antes de salvar.',
    context: 'Um cadastro local não deve aceitar dados vazios.',
    starterCode: 'function validarCadastro(dados) {\n  ____\n}',
    solution: 'function validarCadastro(dados) {\n  if (!dados.nome?.trim()) return "Informe o nome.";\n  if (!dados.email?.includes("@")) return "Informe um e-mail válido.";\n  return "ok";\n}',
    rules: [required('name', 'dados.nome', 'Valide o nome.'), required('email', 'dados.email', 'Valide o e-mail.'), required('ok', 'return "ok"', 'Retorne sucesso quando tudo estiver válido.')],
    tags: ['javascript', 'validacao']
  },
  {
    id: 'lab-ts-result-union',
    title: 'Resultado tipado',
    language: 'TypeScript',
    areaId: 'typescript',
    concept: 'union type',
    difficulty: 'avancado',
    kind: 'implement-function',
    objective: 'Modelar sucesso e erro em um contrato explícito.',
    context: 'Uma consulta pode retornar dados ou uma mensagem de falha.',
    starterCode: 'type Resultado = ____',
    solution: 'type Resultado = { ok: true; dados: string } | { ok: false; erro: string };',
    rules: [required('ok-true', 'ok: true', 'Inclua o estado de sucesso.'), required('ok-false', 'ok: false', 'Inclua o estado de erro.'), required('union', '} | {', 'Use union para separar os formatos.')],
    tags: ['typescript', 'union']
  },
  {
    id: 'lab-ts-narrowing',
    title: 'Narrowing por estado',
    language: 'TypeScript',
    areaId: 'typescript',
    concept: 'narrowing',
    difficulty: 'avancado',
    kind: 'complete-code',
    objective: 'Ler dados somente quando o resultado está ok.',
    context: 'O app deve evitar acessar dados quando a API falha.',
    starterCode: 'function texto(resultado: Resultado) {\n  if (____) return resultado.dados;\n  return resultado.erro;\n}',
    solution: 'function texto(resultado: Resultado) {\n  if (resultado.ok) return resultado.dados;\n  return resultado.erro;\n}',
    rules: [required('check-ok', 'resultado.ok', 'Use a propriedade discriminante.'), ordered('safe-order', ['resultado.ok', 'resultado.dados'], 'Confira ok antes de ler dados.')],
    tags: ['typescript', 'narrowing']
  },
  {
    id: 'lab-ts-interface-props',
    title: 'Props de cartão',
    language: 'TypeScript',
    areaId: 'typescript',
    concept: 'interface',
    difficulty: 'iniciante',
    kind: 'complete-code',
    objective: 'Criar contrato para props de um componente.',
    context: 'Um componente recebe título e estado de conclusão.',
    starterCode: '____ CardProps {\n  titulo: string;\n  concluido: boolean;\n}',
    solution: 'interface CardProps {\n  titulo: string;\n  concluido: boolean;\n}',
    rules: [required('interface', 'interface', 'Use interface para o contrato.'), required('title', 'titulo: string', 'Tipar título como string.'), required('done', 'concluido: boolean', 'Tipar conclusão como boolean.')],
    tags: ['typescript', 'interfaces']
  },
  {
    id: 'lab-ts-readonly-array',
    title: 'Lista somente leitura',
    language: 'TypeScript',
    areaId: 'typescript',
    concept: 'imutabilidade',
    difficulty: 'avancado',
    kind: 'refactor',
    objective: 'Evitar alteração acidental de uma lista recebida.',
    context: 'Um helper de ranking não deve modificar a lista original.',
    starterCode: 'function nomes(usuarios: Usuario[]) {\n  return usuarios.map((usuario) => usuario.nome);\n}',
    solution: 'function nomes(usuarios: readonly Usuario[]) {\n  return usuarios.map((usuario) => usuario.nome);\n}',
    rules: [required('readonly', 'readonly Usuario[]', 'Use readonly no parâmetro.'), required('map', '.map', 'Transforme sem modificar a lista.'), forbidden('sort', '.sort', 'Não ordene a lista original aqui.')],
    tags: ['typescript', 'readonly']
  },
  {
    id: 'lab-ts-unknown-border',
    title: 'Unknown na borda',
    language: 'TypeScript',
    areaId: 'typescript',
    concept: 'unknown',
    difficulty: 'intermediario',
    kind: 'fix-bug',
    objective: 'Validar valor desconhecido antes de usar.',
    context: 'Dados externos chegam sem garantia de formato.',
    starterCode: 'function lerNome(valor: unknown) {\n  return valor.nome;\n}',
    solution: 'function lerNome(valor: unknown) {\n  if (typeof valor === "object" && valor !== null && "nome" in valor) return String(valor.nome);\n  return "";\n}',
    rules: [required('unknown', 'unknown', 'Mantenha unknown na entrada.'), required('typeof', 'typeof valor === "object"', 'Verifique o tipo antes de acessar.'), required('in', '"nome" in valor', 'Confira se a propriedade existe.')],
    tags: ['typescript', 'unknown']
  },
  {
    id: 'lab-python-normalize-name',
    title: 'Normalizar nome',
    language: 'Python',
    areaId: 'python',
    concept: 'função',
    difficulty: 'iniciante',
    kind: 'implement-function',
    objective: 'Remover espaços e padronizar capitalização.',
    context: 'Uma importação de CSV chega com nomes inconsistentes.',
    starterCode: 'def normalizar_nome(nome):\n    ____',
    solution: 'def normalizar_nome(nome):\n    return nome.strip().title()',
    rules: [required('strip', '.strip()', 'Remova espaços extras.'), required('title', '.title()', 'Padronize a capitalização.'), required('return', 'return', 'Retorne o valor tratado.')],
    tags: ['python', 'funcao']
  },
  {
    id: 'lab-python-list-comprehension',
    title: 'Filtrar notas aprovadas',
    language: 'Python',
    areaId: 'python',
    concept: 'list comprehension',
    difficulty: 'intermediario',
    kind: 'complete-code',
    objective: 'Criar lista com notas aprovadas.',
    context: 'Um relatório precisa separar notas suficientes para certificado.',
    starterCode: 'aprovadas = [____ for nota in notas if ____]',
    solution: 'aprovadas = [nota for nota in notas if nota >= 7]',
    rules: [required('for', 'for nota in notas', 'Percorra as notas.'), required('condition', 'nota >= 7', 'Use o critério de aprovação.'), forbidden('append', '.append', 'Prefira comprehension neste exercício.')],
    tags: ['python', 'listas']
  },
  {
    id: 'lab-python-dict-get',
    title: 'Ler dicionário com fallback',
    language: 'Python',
    areaId: 'python',
    concept: 'dict',
    difficulty: 'iniciante',
    kind: 'fix-bug',
    objective: 'Evitar erro quando a chave não existe.',
    context: 'Um perfil opcional pode não ter cidade informada.',
    starterCode: 'cidade = usuario["cidade"]',
    solution: 'cidade = usuario.get("cidade", "Não informada")',
    rules: [required('get', '.get(', 'Use get para fallback.'), required('fallback', 'Não informada', 'Defina texto padrão.'), forbidden('brackets', '["cidade"]', 'Evite acesso direto neste caso.')],
    tags: ['python', 'dict']
  },
  {
    id: 'lab-python-with-file',
    title: 'Abrir arquivo com segurança',
    language: 'Python',
    areaId: 'python',
    concept: 'with',
    difficulty: 'intermediario',
    kind: 'refactor',
    objective: 'Usar context manager para abrir arquivo.',
    context: 'Uma rotina lê configuração local e deve fechar o arquivo corretamente.',
    starterCode: 'arquivo = open(caminho)\nconteudo = arquivo.read()\narquivo.close()',
    solution: 'with open(caminho) as arquivo:\n    conteudo = arquivo.read()',
    rules: [required('with', 'with open', 'Use with open.'), required('read', '.read()', 'Mantenha a leitura.'), forbidden('close', '.close()', 'O context manager fecha o arquivo.')],
    tags: ['python', 'arquivos']
  },
  {
    id: 'lab-python-exception-message',
    title: 'Mensagem para exceção',
    language: 'Python',
    areaId: 'python',
    concept: 'exceções',
    difficulty: 'intermediario',
    kind: 'fix-bug',
    objective: 'Tratar conversão inválida com mensagem clara.',
    context: 'Um campo de formulário chega como texto.',
    starterCode: 'def ler_id(valor):\n    return int(valor)',
    solution: 'def ler_id(valor):\n    try:\n        return int(valor)\n    except ValueError:\n        return None',
    rules: [required('try', 'try:', 'Use try para proteger a conversão.'), required('except', 'except ValueError', 'Trate ValueError.'), required('none', 'return None', 'Retorne None quando não for possível converter.')],
    tags: ['python', 'excecoes']
  },
  {
    id: 'lab-sql-active-users',
    title: 'Selecionar usuários ativos',
    language: 'SQL',
    areaId: 'sql',
    concept: 'WHERE',
    difficulty: 'iniciante',
    kind: 'sql-query',
    objective: 'Buscar apenas usuários ativos.',
    context: 'Um painel administrativo deve listar contas habilitadas.',
    starterCode: 'SELECT id, nome FROM usuarios ____;',
    solution: 'SELECT id, nome FROM usuarios WHERE ativo = true;',
    rules: [required('select', 'SELECT id, nome', 'Selecione apenas as colunas necessárias.'), required('where', 'WHERE', 'Use WHERE para filtrar.'), required('active', 'ativo = true', 'Filtre usuários ativos.')],
    tags: ['sql', 'where']
  },
  {
    id: 'lab-sql-count-orders',
    title: 'Contar pedidos por status',
    language: 'SQL',
    areaId: 'sql',
    concept: 'GROUP BY',
    difficulty: 'intermediario',
    kind: 'sql-query',
    objective: 'Agrupar pedidos por status.',
    context: 'Um relatório precisa mostrar quantos pedidos existem em cada situação.',
    starterCode: 'SELECT status, ____ FROM pedidos ____;',
    solution: 'SELECT status, COUNT(*) FROM pedidos GROUP BY status;',
    rules: [required('count', 'COUNT(*)', 'Use COUNT para contar pedidos.'), required('group', 'GROUP BY status', 'Agrupe por status.'), ordered('order', ['COUNT(*)', 'GROUP BY status'], 'Conte e agrupe na consulta.')],
    tags: ['sql', 'group']
  },
  {
    id: 'lab-sql-join-customers',
    title: 'Juntar pedidos e clientes',
    language: 'SQL',
    areaId: 'sql',
    concept: 'JOIN',
    difficulty: 'intermediario',
    kind: 'sql-query',
    objective: 'Trazer nome do cliente junto do pedido.',
    context: 'Atendimento precisa ver pedido com identificação do cliente.',
    starterCode: 'SELECT pedidos.id, clientes.nome\nFROM pedidos\n____ clientes ON ____;',
    solution: 'SELECT pedidos.id, clientes.nome\nFROM pedidos\nJOIN clientes ON clientes.id = pedidos.cliente_id;',
    rules: [required('join', 'JOIN clientes', 'Use JOIN com clientes.'), required('on', 'ON clientes.id = pedidos.cliente_id', 'Relacione as chaves corretamente.'), required('columns', 'clientes.nome', 'Inclua o nome do cliente.')],
    tags: ['sql', 'join']
  },
  {
    id: 'lab-sql-safe-limit',
    title: 'Consulta paginada',
    language: 'SQL',
    areaId: 'sql',
    concept: 'paginação',
    difficulty: 'iniciante',
    kind: 'sql-query',
    objective: 'Limitar quantidade de resultados.',
    context: 'Uma tela mobile não deve carregar todos os registros de uma vez.',
    starterCode: 'SELECT id, titulo FROM aulas ORDER BY criado_em DESC ____;',
    solution: 'SELECT id, titulo FROM aulas ORDER BY criado_em DESC LIMIT 20;',
    rules: [required('order', 'ORDER BY criado_em DESC', 'Ordene antes de limitar.'), required('limit', 'LIMIT', 'Use LIMIT para reduzir a carga.'), forbidden('select-all', 'SELECT *', 'Evite selecionar todas as colunas.')],
    tags: ['sql', 'paginacao']
  },
  {
    id: 'lab-sql-update-transaction',
    title: 'Transação de saldo',
    language: 'SQL',
    areaId: 'sql',
    concept: 'transação',
    difficulty: 'intermediario',
    kind: 'sql-query',
    objective: 'Proteger atualização de saldo com transação.',
    context: 'Uma compra deve debitar moedas de forma consistente.',
    starterCode: '____;\nUPDATE carteiras SET moedas = moedas - valor WHERE usuario_id = usuario;\n____;',
    solution: 'BEGIN;\nUPDATE carteiras SET moedas = moedas - valor WHERE usuario_id = usuario;\nCOMMIT;',
    rules: [required('begin', 'BEGIN', 'Abra uma transação.'), required('update', 'UPDATE carteiras', 'Mantenha a atualização de saldo.'), required('commit', 'COMMIT', 'Finalize a transação.')],
    tags: ['sql', 'transacao']
  },
  {
    id: 'lab-html-card-structure',
    title: 'Card semântico de aula',
    language: 'HTML',
    areaId: 'html',
    concept: 'semântica',
    difficulty: 'iniciante',
    kind: 'html-structure',
    objective: 'Montar estrutura semântica para um card.',
    context: 'A Academia precisa exibir uma aula com título e ação.',
    starterCode: '<____>\n  <h2>Variáveis</h2>\n  <p>Base da programação.</p>\n</____>',
    solution: '<article>\n  <h2>Variáveis</h2>\n  <p>Base da programação.</p>\n</article>',
    rules: [required('article', '<article', 'Use article para conteúdo independente.'), required('h2', '<h2>', 'Mantenha um título semântico.'), forbidden('div-only', '<div>', 'Evite usar div sem necessidade neste exercício.')],
    tags: ['html', 'semantica']
  },
  {
    id: 'lab-html-form-label',
    title: 'Campo com label',
    language: 'HTML',
    areaId: 'html',
    concept: 'formulários',
    difficulty: 'iniciante',
    kind: 'html-structure',
    objective: 'Associar label ao input de e-mail.',
    context: 'Um login precisa funcionar bem com teclado e leitor de tela.',
    starterCode: '<label ____>Email</label>\n<input ____ type="email" />',
    solution: '<label for="email">Email</label>\n<input id="email" name="email" type="email" />',
    rules: [required('for', 'for="email"', 'Conecte label ao input.'), required('id', 'id="email"', 'Use id correspondente.'), required('type', 'type="email"', 'Use tipo de e-mail.')],
    tags: ['html', 'forms']
  },
  {
    id: 'lab-html-image-alt',
    title: 'Imagem com alternativa',
    language: 'HTML',
    areaId: 'html',
    concept: 'acessibilidade',
    difficulty: 'iniciante',
    kind: 'html-structure',
    objective: 'Descrever imagem informativa.',
    context: 'Uma medalha de conquista precisa ter significado sem depender da imagem.',
    starterCode: '<img src="medalha.png" ____ />',
    solution: '<img src="medalha.png" alt="Medalha de aula concluída" />',
    rules: [required('alt', 'alt=', 'Inclua texto alternativo.'), required('meaning', 'Medalha', 'Descreva o significado.'), forbidden('empty-alt', 'alt=""', 'Imagem informativa não deve ter alt vazio.')],
    tags: ['html', 'a11y']
  },
  {
    id: 'lab-css-flex-row',
    title: 'Linha flexível',
    language: 'CSS',
    areaId: 'css',
    concept: 'flexbox',
    difficulty: 'iniciante',
    kind: 'css-layout',
    objective: 'Alinhar itens em linha com espaçamento.',
    context: 'Um cabeçalho precisa distribuir avatar e texto.',
    starterCode: '.cabecalho {\n  ____\n}',
    solution: '.cabecalho {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}',
    rules: [required('display', 'display: flex', 'Use flexbox.'), required('align', 'align-items: center', 'Alinhe verticalmente.'), required('gap', 'gap:', 'Use gap para espaçamento.')],
    tags: ['css', 'flexbox']
  },
  {
    id: 'lab-css-focus-visible',
    title: 'Foco visível',
    language: 'CSS',
    areaId: 'css',
    concept: 'acessibilidade visual',
    difficulty: 'intermediario',
    kind: 'css-layout',
    objective: 'Criar estilo de foco para teclado.',
    context: 'Botões precisam indicar foco sem depender do mouse.',
    starterCode: '.botao____ {\n  outline: ____;\n}',
    solution: '.botao:focus-visible {\n  outline: 2px solid #49E3B3;\n}',
    rules: [required('focus', ':focus-visible', 'Use focus-visible.'), required('outline', 'outline:', 'Defina outline.'), forbidden('none', 'outline: none', 'Não remova foco sem alternativa.')],
    tags: ['css', 'a11y']
  },
  {
    id: 'lab-react-props-card',
    title: 'Componente com props',
    language: 'React',
    areaId: 'react',
    concept: 'props',
    difficulty: 'iniciante',
    kind: 'implement-function',
    objective: 'Receber título por props.',
    context: 'Um card reutilizável deve exibir nomes de aulas diferentes.',
    starterCode: 'function AulaCard(____) {\n  return <Text>{____}</Text>;\n}',
    solution: 'function AulaCard({ titulo }) {\n  return <Text>{titulo}</Text>;\n}',
    rules: [required('props', '{ titulo }', 'Receba titulo por props.'), required('render', '<Text>{titulo}</Text>', 'Renderize o título.'), forbidden('fixed', 'Variáveis', 'Não deixe texto fixo no componente.')],
    tags: ['react', 'props']
  },
  {
    id: 'lab-react-state-feedback',
    title: 'Estado de feedback',
    language: 'React',
    areaId: 'react',
    concept: 'estado',
    difficulty: 'intermediario',
    kind: 'complete-code',
    objective: 'Controlar mensagem exibida na tela.',
    context: 'Um botão deve mostrar feedback depois da validação.',
    starterCode: 'const [mensagem, setMensagem] = ____;\n____("Solução validada");',
    solution: 'const [mensagem, setMensagem] = useState("");\nsetMensagem("Solução validada");',
    rules: [required('state', 'useState', 'Use useState.'), required('setter', 'setMensagem', 'Atualize pelo setter.'), required('message', 'Solução validada', 'Mostre mensagem clara.')],
    tags: ['react', 'state']
  }
];

export const codeLabChallenges: CodeLabChallenge[] = seeds.map(makeChallenge);

export const codeLabChallengeById = (id: string) => codeLabChallenges.find((challenge) => challenge.id === id);

export const codeLabChallengesForConcept = (areaId?: AreaId, concept?: string) => {
  const normalized = concept?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') ?? '';
  const candidates = areaId ? codeLabChallenges.filter((challenge) => challenge.areaId === areaId) : codeLabChallenges;
  return candidates.filter((challenge) => {
    const challengeConcept = challenge.concept.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return normalized ? normalized.includes(challengeConcept) || challengeConcept.includes(normalized) || challenge.tags.some((tag) => normalized.includes(tag)) : true;
  });
};
