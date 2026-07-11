import { AreaId, Difficulty } from '../types/game';
import { CodeChallenge } from '../types/codeArena';

type ChallengeTemplate = Pick<CodeChallenge, 'language' | 'areaId' | 'concept' | 'kind' | 'title' | 'description' | 'code' | 'explanation' | 'hint'> & {
  idSlug: string;
  correctAnswer: string;
  distractors: [string, string, string];
  tags?: string[];
};

type ChallengeGroup = {
  prefix: string;
  count: number;
  templates: ChallengeTemplate[];
};

const pad = (value: number) => String(value).padStart(3, '0');

const rewardFor = (difficulty: Difficulty) => ({
  xpReward: difficulty === 'avancado' ? 180 : difficulty === 'intermediario' ? 130 : 90,
  coinReward: difficulty === 'avancado' ? 70 : difficulty === 'intermediario' ? 50 : 35
});

const optionsFor = (template: ChallengeTemplate, index: number) => {
  const options = [template.correctAnswer, ...template.distractors];
  const shift = index % options.length;
  const rotated = [...options.slice(shift), ...options.slice(0, shift)];
  return { options: rotated, correctIndex: rotated.indexOf(template.correctAnswer) };
};

const template = (input: ChallengeTemplate): ChallengeTemplate => input;

const groups: ChallengeGroup[] = [
  {
    prefix: 'arena-logic',
    count: 40,
    templates: [
      template({ idSlug: 'variaveis', language: 'Lógica', areaId: 'logic', concept: 'Variáveis', kind: 'complete-code', title: 'Lógica: variável com nome claro', description: 'Complete a ideia de armazenamento com um nome que comunique intenção.', code: 'Guardar idade do cliente -> ____', correctAnswer: 'idadeCliente', distractors: ['x', 'dado', 'temp'], explanation: 'idadeCliente descreve exatamente o valor armazenado. x, dado e temp escondem a intenção e tornam a regra mais difícil de revisar.', hint: 'Escolha um nome que explique o dado sem precisar de comentário.', tags: ['logic', 'variaveis'] }),
      template({ idSlug: 'condicionais', language: 'Lógica', areaId: 'logic', concept: 'Condicionais', kind: 'complete-code', title: 'Lógica: decisão booleana', description: 'Complete a estrutura que escolhe um caminho a partir de uma condição.', code: 'Se pagamentoAprovado então liberar acesso, senão mostrar aviso -> ____', correctAnswer: 'if/else', distractors: ['for', 'array', 'função'], explanation: 'if/else representa uma decisão entre dois caminhos. for repete, array armazena vários valores e função apenas agrupa uma rotina.', hint: 'Procure a estrutura usada para verdadeiro ou falso.' }),
      template({ idSlug: 'loops', language: 'Lógica', areaId: 'logic', concept: 'Loops', kind: 'complete-code', title: 'Lógica: repetir para cada item', description: 'Identifique a estrutura usada para percorrer uma coleção.', code: 'Para cada pedido da lista, calcular total -> ____', correctAnswer: 'for', distractors: ['if', 'return', 'constante'], explanation: 'for comunica repetição sobre itens. if decide um caminho, return encerra uma rotina e constante apenas guarda um valor.', hint: 'A frase "para cada" costuma indicar repetição.' }),
      template({ idSlug: 'funcoes', language: 'Lógica', areaId: 'logic', concept: 'Funções', kind: 'best-solution', title: 'Lógica: extrair uma função', description: 'Escolha a melhor forma de reaproveitar uma regra usada em vários pontos.', code: 'A mesma regra de frete aparece em três telas. Melhor solução: ____', correctAnswer: 'criar função calcularFrete', distractors: ['copiar o bloco', 'apagar a regra', 'trocar nomes aleatórios'], explanation: 'Criar calcularFrete centraliza a regra e reduz divergências. Copiar duplica manutenção, apagar muda comportamento e trocar nomes não resolve repetição.', hint: 'Pense em reutilização com um contrato claro.' }),
      template({ idSlug: 'casos-de-borda', language: 'Lógica', areaId: 'logic', concept: 'Casos de borda', kind: 'bug-hunt', title: 'Lógica: lista vazia', description: 'Encontre a correção para uma rotina que falha quando não há itens.', code: 'media = soma / quantidade\n# quando quantidade é 0, ocorre erro\nCorreção: ____', correctAnswer: 'validar quantidade antes da divisão', distractors: ['ignorar o erro', 'somar mais um item sempre', 'trocar soma por texto'], explanation: 'Validar quantidade antes da divisão evita divisão por zero e permite retornar uma mensagem ou valor seguro. As outras opções mascaram ou criam outro erro.', hint: 'Antes de calcular, valide o menor cenário possível.' })
    ]
  },
  {
    prefix: 'arena-js',
    count: 50,
    templates: [
      template({ idSlug: 'arrays', language: 'JavaScript', areaId: 'javascript', concept: 'Arrays e filter', kind: 'complete-code', title: 'JavaScript: filtrar ativos', description: 'Complete a chamada que cria uma nova lista apenas com usuários ativos.', code: 'const active = users.____((user) => user.active);', correctAnswer: 'filter', distractors: ['map', 'find', 'forEach'], explanation: 'filter retorna um novo array com todos os itens que passam no predicado. map transforma itens, find retorna apenas o primeiro e forEach não retorna uma nova lista útil.', hint: 'Você precisa manter vários itens, não transformar cada um.' }),
      template({ idSlug: 'async', language: 'JavaScript', areaId: 'javascript', concept: 'Promises e async await', kind: 'complete-code', title: 'JavaScript: aguardar fetch', description: 'Complete a chamada assíncrona para esperar a resposta da API.', code: 'const response = ____ fetch(url);', correctAnswer: 'await', distractors: ['async', 'then', 'return'], explanation: 'await pausa a função async até a Promise resolver. async marca a função, then encadearia callback e return apenas devolve um valor.', hint: 'A lacuna vem antes da Promise que precisa ser aguardada.' }),
      template({ idSlug: 'dom', language: 'JavaScript', areaId: 'javascript', concept: 'Eventos do DOM', kind: 'complete-code', title: 'JavaScript: evento de clique', description: 'Complete o método usado para assinar um evento no botão.', code: 'button.____("click", save);', correctAnswer: 'addEventListener', distractors: ['querySelector', 'preventDefault', 'appendChild'], explanation: 'addEventListener registra uma função para o evento click. querySelector busca elementos, preventDefault cancela comportamento padrão e appendChild insere nós.', hint: 'Procure o método que recebe nome do evento e callback.' }),
      template({ idSlug: 'closures', language: 'JavaScript', areaId: 'javascript', concept: 'Closures', kind: 'simulate-output', title: 'JavaScript: closure mantém estado', description: 'Preveja a saída após duas chamadas da função retornada.', code: 'function contador() {\n  let valor = 0;\n  return () => ++valor;\n}\nconst proximo = contador();\nproximo();\nconsole.log(proximo());', correctAnswer: '2', distractors: ['1', '0', 'undefined'], explanation: 'A função interna mantém acesso a valor pelo closure. A primeira chamada incrementa para 1 e a segunda imprime 2. undefined não ocorre porque a arrow retorna ++valor.', hint: 'A variável não é recriada entre chamadas da função retornada.' }),
      template({ idSlug: 'eventos', language: 'JavaScript', areaId: 'javascript', concept: 'Eventos', kind: 'bug-hunt', title: 'JavaScript: evitar envio padrão', description: 'Escolha a correção para impedir que um formulário recarregue a página.', code: 'form.addEventListener("submit", (event) => {\n  salvar();\n});\nCorreção: ____', correctAnswer: 'event.preventDefault()', distractors: ['event.stopName()', 'form.reload()', 'document.clear()'], explanation: 'event.preventDefault() cancela o comportamento padrão do submit antes de salvar. As outras opções não são APIs adequadas para esse problema.', hint: 'A correção atua no objeto do evento recebido pelo callback.' }),
      template({ idSlug: 'performance', language: 'JavaScript', areaId: 'javascript', concept: 'Performance com Promise.all', kind: 'best-solution', title: 'JavaScript: requisições paralelas', description: 'Escolha a melhor solução para aguardar duas chamadas independentes.', code: 'perfilPromise e pedidosPromise não dependem uma da outra. Melhor solução: ____', correctAnswer: 'Promise.all([perfilPromise, pedidosPromise])', distractors: ['await perfil; await pedidos em cascata', 'setTimeout para esperar', 'while até responder'], explanation: 'Promise.all aguarda Promises independentes em paralelo. Aguardar em cascata aumenta o tempo total, setTimeout é frágil e while bloquearia a execução.', hint: 'Quando tarefas independem entre si, pense em paralelismo controlado.' })
    ]
  },
  {
    prefix: 'arena-ts',
    count: 40,
    templates: [
      template({ idSlug: 'interfaces', language: 'TypeScript', areaId: 'typescript', concept: 'Interfaces', kind: 'complete-code', title: 'TypeScript: contrato de usuário', description: 'Complete a declaração de contrato para um objeto User.', code: '____ User {\n  id: string;\n}', correctAnswer: 'interface', distractors: ['implements', 'extends', 'typeof'], explanation: 'interface declara o formato do objeto. implements é usado por classes, extends herda contratos e typeof consulta tipo de um valor existente.', hint: 'A lacuna vem antes do nome do contrato.' }),
      template({ idSlug: 'unions', language: 'TypeScript', areaId: 'typescript', concept: 'Union types', kind: 'complete-code', title: 'TypeScript: resultado com sucesso ou erro', description: 'Complete o operador que separa dois formatos possíveis.', code: 'type Result = { ok: true; data: string } ____ { ok: false; error: string };', correctAnswer: '|', distractors: ['&', 'extends', 'implements'], explanation: '| cria uma union, permitindo sucesso ou erro. & exigiria os dois formatos ao mesmo tempo, e extends/implements não se aplicam nessa posição.', hint: 'A resposta representa "um ou outro".' }),
      template({ idSlug: 'unknown', language: 'TypeScript', areaId: 'typescript', concept: 'Unknown', kind: 'complete-code', title: 'TypeScript: entrada desconhecida', description: 'Complete o tipo mais seguro para dado externo ainda não validado.', code: 'function parse(value: ____) {\n  return value;\n}', correctAnswer: 'unknown', distractors: ['any', 'never', 'string'], explanation: 'unknown obriga validação antes de uso. any desliga a segurança, never representa algo que não acontece e string seria uma promessa sem validação.', hint: 'Prefira o tipo que força checagem antes do acesso.' }),
      template({ idSlug: 'generics', language: 'TypeScript', areaId: 'typescript', concept: 'Generics', kind: 'complete-code', title: 'TypeScript: resposta genérica', description: 'Complete o parâmetro de tipo reutilizado pelo contrato.', code: 'type ApiResponse<____> = {\n  data: ____;\n};', correctAnswer: 'T', distractors: ['any', 'void', 'static'], explanation: 'T é o parâmetro genérico usado para transportar o tipo de data. any perde informação, void indica ausência de valor e static não é parâmetro de tipo.', hint: 'Use o mesmo marcador de tipo nos dois pontos.' }),
      template({ idSlug: 'guards', language: 'TypeScript', areaId: 'typescript', concept: 'Type guards', kind: 'best-solution', title: 'TypeScript: validar User', description: 'Escolha a melhor assinatura para uma função que estreita o tipo.', code: 'function isUser(value: unknown): ____ {\n  return typeof value === "object" && value !== null && "id" in value;\n}', correctAnswer: 'value is User', distractors: ['boolean is User', 'value as User', 'User'], explanation: 'value is User é um type predicate e permite narrowing após a chamada. value as User apenas força cast e User não é retorno booleano.', hint: 'A assinatura deve mencionar o parâmetro validado.' })
    ]
  },
  {
    prefix: 'arena-python',
    count: 50,
    templates: [
      template({ idSlug: 'listas', language: 'Python', areaId: 'python', concept: 'Listas e sum', kind: 'complete-code', title: 'Python: somar lista', description: 'Complete a função nativa usada para somar valores de uma lista.', code: 'total = ____(itens)', correctAnswer: 'sum', distractors: ['len', 'sorted', 'append'], explanation: 'sum(itens) soma os valores numéricos. len conta itens, sorted ordena e append adiciona um item à lista.', hint: 'A resposta é uma função nativa de agregação numérica.' }),
      template({ idSlug: 'dicts', language: 'Python', areaId: 'python', concept: 'Dicionários e método get', kind: 'complete-code', title: 'Python: acesso seguro a dicionários', description: 'Complete o método que busca uma chave com valor padrão sem gerar KeyError.', code: 'usuario = {"nome": "Ana"}\nnome = usuario.____("nome", "Sem nome")\nprint(nome)', correctAnswer: 'get', distractors: ['keys', 'values', 'update'], explanation: 'dict.get(chave, valorPadrao) busca uma chave sem gerar KeyError. Se a chave não existir, retorna o valor padrão informado. keys e values retornam visões do dicionário, update altera dados.', hint: 'Procure um método de dicionário que recebe uma chave e um valor padrão.' }),
      template({ idSlug: 'with', language: 'Python', areaId: 'python', concept: 'Gerenciamento de arquivos com with', kind: 'complete-code', title: 'Python: abrir arquivo com contexto', description: 'Complete a palavra-chave que fecha o arquivo automaticamente ao fim do bloco.', code: '____ open(path) as arquivo:\n    conteudo = arquivo.read()', correctAnswer: 'with', distractors: ['for', 'try', 'lambda'], explanation: 'with cria um gerenciador de contexto e garante o fechamento do arquivo. for itera, try trata exceções e lambda cria função anônima.', hint: 'A palavra-chave aparece antes de open e cria um bloco indentado.' }),
      template({ idSlug: 'generators', language: 'Python', areaId: 'python', concept: 'Generators', kind: 'complete-code', title: 'Python: produzir valores sob demanda', description: 'Complete a palavra-chave que transforma a função em generator.', code: 'def pares(numeros):\n    for numero in numeros:\n        if numero % 2 == 0:\n            ____ numero', correctAnswer: 'yield', distractors: ['return', 'print', 'break'], explanation: 'yield emite um valor e mantém o estado da função para a próxima iteração. return encerra, print apenas exibe e break sai do loop.', hint: 'Generator entrega valores um por vez.' }),
      template({ idSlug: 'comprehension', language: 'Python', areaId: 'python', concept: 'Compreensão de listas', kind: 'simulate-output', title: 'Python: comprehension com filtro', description: 'Preveja a lista criada pela compreensão.', code: 'numeros = [1, 2, 3, 4]\ndobros = [numero * 2 for numero in numeros if numero % 2 == 0]\nprint(dobros)', correctAnswer: '[4, 8]', distractors: ['[2, 4, 6, 8]', '[1, 2, 3, 4]', '[2, 4]'], explanation: 'A comprehension filtra apenas números pares, 2 e 4, e depois multiplica cada um por 2, gerando [4, 8]. As outras opções ignoram o filtro ou a transformação.', hint: 'A parte depois do if filtra antes de multiplicar.' })
    ]
  },
  {
    prefix: 'arena-java',
    count: 50,
    templates: [
      template({ idSlug: 'oop', language: 'Java', areaId: 'java', concept: 'Orientação a objetos', kind: 'complete-code', title: 'Java: campo textual', description: 'Complete o tipo adequado para armazenar texto.', code: 'private ____ nome;', correctAnswer: 'String', distractors: ['int', 'boolean', 'void'], explanation: 'String armazena texto em Java. int é numérico, boolean é verdadeiro/falso e void não declara campo.', hint: 'Nomes de pessoas são texto.' }),
      template({ idSlug: 'collections', language: 'Java', areaId: 'java', concept: 'Collections', kind: 'complete-code', title: 'Java: lista mutável', description: 'Complete a implementação comum para uma lista.', code: 'List<User> users = new ____<>();', correctAnswer: 'ArrayList', distractors: ['HashMap', 'Optional', 'StringBuilder'], explanation: 'ArrayList implementa List. HashMap armazena pares chave/valor, Optional representa presença opcional e StringBuilder monta texto.', hint: 'A variável é do tipo List.' }),
      template({ idSlug: 'equals', language: 'Java', areaId: 'java', concept: 'Comparação com equals', kind: 'bug-hunt', title: 'Java: comparar strings', description: 'Escolha a correção para comparar conteúdo de String.', code: 'if (nome == outroNome) {\n  liberar();\n}\nCorreção: ____', correctAnswer: 'nome.equals(outroNome)', distractors: ['nome = outroNome', 'nome.compareTo = outroNome', 'nome.toString(outroNome)'], explanation: 'equals compara o conteúdo de objetos String. == compara referências, atribuição não compara e toString não recebe esse argumento.', hint: 'Para objetos, compare conteúdo explicitamente.' }),
      template({ idSlug: 'generics', language: 'Java', areaId: 'java', concept: 'Generics', kind: 'complete-code', title: 'Java: lista tipada', description: 'Complete o tipo genérico da lista de nomes.', code: 'List<____> nomes = new ArrayList<>();', correctAnswer: 'String', distractors: ['Integer', 'Text', 'var'], explanation: 'String é o tipo textual em Java e pode ser usado como parâmetro genérico. Integer seria numérico, Text não é padrão e var não entra dentro de <>.', hint: 'Use o nome da classe textual do Java.' }),
      template({ idSlug: 'streams', language: 'Java', areaId: 'java', concept: 'Streams', kind: 'complete-code', title: 'Java: iniciar pipeline stream', description: 'Complete a chamada que permite filtrar uma coleção em pipeline.', code: 'List<User> ativos = users.____()\n  .filter(User::isActive)\n  .toList();', correctAnswer: 'stream', distractors: ['map', 'list', 'filter'], explanation: 'stream() inicia o pipeline antes de filter. map e filter são operações do stream, e list não é o método da coleção.', hint: 'A primeira chamada transforma a coleção em fluxo.' })
    ]
  },
  {
    prefix: 'arena-kotlin',
    count: 50,
    templates: [
      template({ idSlug: 'null-safety', language: 'Kotlin', areaId: 'kotlin', concept: 'Null safety', kind: 'complete-code', title: 'Kotlin: valor padrão', description: 'Complete o operador Elvis para fallback quando o nome é nulo.', code: 'val nome = usuario?.nome ____ "Anônimo"', correctAnswer: '?:', distractors: ['!!', '?.', 'as'], explanation: '?: retorna o valor à direita quando a expressão à esquerda é nula. !! força erro se nulo, ?. acessa com segurança e as faz cast.', hint: 'O operador lembra uma decisão compacta entre valor e fallback.' }),
      template({ idSlug: 'data-class', language: 'Kotlin', areaId: 'kotlin', concept: 'Data class', kind: 'complete-code', title: 'Kotlin: modelo imutável', description: 'Complete a declaração de classe de dados.', code: '____ User(val id: String)', correctAnswer: 'data class', distractors: ['sealed fun', 'object val', 'interface class'], explanation: 'data class gera equals, hashCode e copy para modelos de dados. As outras combinações não declaram esse modelo corretamente.', hint: 'A declaração tem duas palavras antes do nome.' }),
      template({ idSlug: 'sealed', language: 'Kotlin', areaId: 'kotlin', concept: 'Sealed interfaces', kind: 'complete-code', title: 'Kotlin: estados fechados', description: 'Complete o contrato para representar estados conhecidos.', code: '____ UiState\nobject Loading : UiState', correctAnswer: 'sealed interface', distractors: ['open data', 'enum fun', 'lateinit class'], explanation: 'sealed interface limita implementações ao escopo esperado e ajuda no when exaustivo. As outras opções não modelam uma hierarquia fechada.', hint: 'A palavra indica que o conjunto de subtipos é controlado.' }),
      template({ idSlug: 'coroutines', language: 'Kotlin', areaId: 'kotlin', concept: 'Coroutines', kind: 'complete-code', title: 'Kotlin: função suspend', description: 'Complete a palavra que permite chamar APIs suspensas.', code: '____ fun carregarUsuario(): User {\n  return api.buscar()\n}', correctAnswer: 'suspend', distractors: ['async', 'await', 'thread'], explanation: 'suspend marca uma função que pode suspender dentro de coroutines. async cria uma coroutine, await aguarda Deferred e thread não é modificador de função.', hint: 'O modificador vem antes de fun.' }),
      template({ idSlug: 'collections', language: 'Kotlin', areaId: 'kotlin', concept: 'Collections', kind: 'complete-code', title: 'Kotlin: transformar lista', description: 'Complete a operação que transforma cada usuário em nome.', code: 'val nomes = usuarios.____ { usuario -> usuario.nome }', correctAnswer: 'map', distractors: ['filter', 'forEach', 'first'], explanation: 'map cria uma nova lista transformando cada item. filter seleciona itens, forEach retorna Unit e first pega só o primeiro.', hint: 'Você quer uma lista de mesmo tamanho com outro formato.' })
    ]
  },
  {
    prefix: 'arena-csharp',
    count: 40,
    templates: [
      template({ idSlug: 'records', language: 'C#', areaId: 'csharp', concept: 'Records', kind: 'complete-code', title: 'C#: modelo record', description: 'Complete a palavra-chave para um modelo imutável por valor.', code: 'public ____ Aula(string Titulo);', correctAnswer: 'record', distractors: ['class void', 'enum', 'delegate'], explanation: 'record cria um tipo com igualdade por valor e sintaxe compacta. class void é inválido, enum lista constantes e delegate representa assinatura.', hint: 'A palavra-chave aparece antes do nome do tipo.' }),
      template({ idSlug: 'linq', language: 'C#', areaId: 'csharp', concept: 'LINQ Where', kind: 'complete-code', title: 'C#: filtrar com LINQ', description: 'Complete a operação que filtra aulas ativas.', code: 'var ativas = aulas.____(aula => aula.Ativa);', correctAnswer: 'Where', distractors: ['Select', 'First', 'OrderBy'], explanation: 'Where filtra itens pelo predicado. Select transforma, First pega um item e OrderBy ordena.', hint: 'É o equivalente LINQ de manter apenas itens que passam no teste.' }),
      template({ idSlug: 'async', language: 'C#', areaId: 'csharp', concept: 'Async await', kind: 'complete-code', title: 'C#: aguardar tarefa', description: 'Complete a chamada assíncrona para obter dados antes de usar.', code: 'var dados = ____ repositorio.BuscarAsync();', correctAnswer: 'await', distractors: ['async', 'Task', 'yield'], explanation: 'await aguarda a Task retornada por BuscarAsync. async marca o método, Task é o tipo e yield pertence a iteradores.', hint: 'A lacuna vem antes da chamada que retorna Task.' }),
      template({ idSlug: 'interfaces', language: 'C#', areaId: 'csharp', concept: 'Interfaces', kind: 'complete-code', title: 'C#: contrato de serviço', description: 'Complete a palavra-chave usada para declarar contrato.', code: 'public ____ IRepositorio {\n  Task SalvarAsync();\n}', correctAnswer: 'interface', distractors: ['record', 'namespace', 'using'], explanation: 'interface declara um contrato implementável. record cria tipo de dados, namespace agrupa nomes e using importa dependências.', hint: 'Contratos em C# costumam começar com I.' }),
      template({ idSlug: 'nullable', language: 'C#', areaId: 'csharp', concept: 'Nullable', kind: 'complete-code', title: 'C#: string opcional', description: 'Complete o tipo quando o valor pode ser nulo.', code: 'string____ apelido = null;', correctAnswer: '?', distractors: ['!', '*', '??'], explanation: '? marca o tipo como anulável. ! suprime aviso, * não é usado em string gerenciada e ?? é operador de fallback.', hint: 'O símbolo fica colado ao tipo.' })
    ]
  },
  {
    prefix: 'arena-sql',
    count: 50,
    templates: [
      template({ idSlug: 'select', language: 'SQL', areaId: 'sql', concept: 'Filtro WHERE', kind: 'complete-code', title: 'SQL: filtrar linhas', description: 'Complete a cláusula que filtra usuários ativos.', code: 'SELECT * FROM users ____ active = 1;', correctAnswer: 'WHERE', distractors: ['HAVING', 'ORDER BY', 'GROUP BY'], explanation: 'WHERE filtra linhas antes de agrupamento. HAVING filtra grupos, ORDER BY ordena e GROUP BY agrupa.', hint: 'A cláusula vem antes da condição de linha.' }),
      template({ idSlug: 'join', language: 'SQL', areaId: 'sql', concept: 'JOIN', kind: 'complete-code', title: 'SQL: juntar pedidos e usuários', description: 'Complete a cláusula que combina duas tabelas por chave.', code: 'SELECT * FROM orders ____ users ON users.id = orders.user_id;', correctAnswer: 'JOIN', distractors: ['WHERE', 'ORDER BY', 'LIMIT'], explanation: 'JOIN combina linhas de tabelas relacionadas usando ON. WHERE filtra, ORDER BY ordena e LIMIT restringe quantidade.', hint: 'A lacuna vem antes do nome da segunda tabela.' }),
      template({ idSlug: 'group-by', language: 'SQL', areaId: 'sql', concept: 'GROUP BY', kind: 'complete-code', title: 'SQL: contar por status', description: 'Complete a cláusula necessária para agregar por status.', code: 'SELECT status, COUNT(*) FROM orders ____ status;', correctAnswer: 'GROUP BY', distractors: ['ORDER BY', 'WHERE', 'JOIN'], explanation: 'GROUP BY agrupa pedidos por status para COUNT. ORDER BY só ordena, WHERE filtra linhas e JOIN combina tabelas.', hint: 'COUNT com coluna não agregada pede agrupamento.' }),
      template({ idSlug: 'indices', language: 'SQL', areaId: 'sql', concept: 'Índices', kind: 'best-solution', title: 'SQL: acelerar busca por e-mail', description: 'Escolha a melhor estrutura para consultas frequentes por email.', code: 'Consulta frequente: SELECT * FROM users WHERE email = ?\nMelhor apoio: ____', correctAnswer: 'INDEX em users(email)', distractors: ['ORDER BY email em toda consulta', 'DROP TABLE users', 'COUNT(*) antes da busca'], explanation: 'Um índice em users(email) ajuda o banco a localizar linhas por email. Ordenar não reduz busca, DROP remove dados e COUNT adiciona trabalho.', hint: 'Pense em estrutura persistente de acesso.' }),
      template({ idSlug: 'transacoes', language: 'SQL', areaId: 'sql', concept: 'Transações', kind: 'complete-code', title: 'SQL: confirmar transação', description: 'Complete o comando que confirma alterações feitas na transação.', code: 'BEGIN;\nUPDATE accounts SET balance = balance - 100 WHERE id = 1;\nUPDATE accounts SET balance = balance + 100 WHERE id = 2;\n____;', correctAnswer: 'COMMIT', distractors: ['ROLLBACK', 'SELECT', 'WHERE'], explanation: 'COMMIT confirma as alterações da transação. ROLLBACK desfaz, SELECT consulta e WHERE não confirma nada sozinho.', hint: 'Depois que tudo deu certo, confirme a transação.' })
    ]
  },
  {
    prefix: 'arena-html',
    count: 30,
    templates: [
      template({ idSlug: 'semantica', language: 'HTML', areaId: 'html', concept: 'Semântica', kind: 'complete-code', title: 'HTML: conteúdo principal', description: 'Complete a tag semântica para o conteúdo principal da página.', code: '<____>\n  Conteúdo principal\n</____>', correctAnswer: 'main', distractors: ['div', 'span', 'br'], explanation: 'main identifica o conteúdo principal para navegadores e tecnologias assistivas. div e span são genéricos, br apenas quebra linha.', hint: 'Use a tag semântica reservada para o conteúdo central.' }),
      template({ idSlug: 'links', language: 'HTML', areaId: 'html', concept: 'Links', kind: 'complete-code', title: 'HTML: link de perfil', description: 'Complete a tag correta para navegação.', code: '<____ href="/perfil">Perfil</____>', correctAnswer: 'a', distractors: ['button', 'label', 'section'], explanation: 'a com href cria link navegável. button aciona ação, label nomeia campos e section agrupa conteúdo.', hint: 'Links usam href.' }),
      template({ idSlug: 'formularios', language: 'HTML', areaId: 'html', concept: 'Formulários', kind: 'complete-code', title: 'HTML: rótulo de campo', description: 'Complete a tag que associa texto ao input.', code: '<____ for="email">Email</____>\n<input id="email" />', correctAnswer: 'label', distractors: ['legend', 'form', 'placeholder'], explanation: 'label com for aponta para o id do input e melhora acessibilidade. legend nomeia fieldset, form agrupa campos e placeholder não substitui rótulo.', hint: 'A tag usa o atributo for.' }),
      template({ idSlug: 'a11y', language: 'HTML', areaId: 'html', concept: 'Acessibilidade com alt', kind: 'complete-code', title: 'HTML: texto alternativo', description: 'Complete o atributo que descreve imagem relevante.', code: '<img src="grafico.png" ____="Gráfico de progresso" />', correctAnswer: 'alt', distractors: ['href', 'target', 'rel'], explanation: 'alt descreve a imagem para leitores de tela e fallback. href, target e rel são atributos típicos de links.', hint: 'O atributo tem três letras e descreve imagem.' }),
      template({ idSlug: 'metadata', language: 'HTML', areaId: 'html', concept: 'Metadados', kind: 'complete-code', title: 'HTML: título da página', description: 'Complete a tag usada no head para nome da aba.', code: '<head>\n  <____>Code Quest</____>\n</head>', correctAnswer: 'title', distractors: ['h1', 'meta', 'body'], explanation: 'title define o texto da aba e metadado do documento. h1 é conteúdo visível, meta recebe atributos e body guarda a página visível.', hint: 'Não é o título visual da tela, é o da aba.' })
    ]
  },
  {
    prefix: 'arena-css',
    count: 30,
    templates: [
      template({ idSlug: 'flexbox', language: 'CSS', areaId: 'css', concept: 'Flexbox', kind: 'complete-code', title: 'CSS: linha flexível', description: 'Complete o valor de display para alinhar itens em linha flexível.', code: '.row {\n  display: ____;\n}', correctAnswer: 'flex', distractors: ['grid', 'block', 'contents'], explanation: 'display: flex ativa flexbox para alinhar os filhos. grid cria grade, block empilha e contents remove a caixa do elemento.', hint: 'É o modelo usado com justify-content e align-items.' }),
      template({ idSlug: 'grid', language: 'CSS', areaId: 'css', concept: 'CSS Grid', kind: 'complete-code', title: 'CSS: layout em grade', description: 'Complete o valor de display para usar colunas e linhas.', code: '.layout {\n  display: ____;\n  grid-template-columns: 1fr 1fr;\n}', correctAnswer: 'grid', distractors: ['flex', 'inline', 'absolute'], explanation: 'display: grid ativa linhas e colunas controladas por grid-template-columns. flex é unidimensional, inline não cria grade e absolute não é display.', hint: 'A próxima propriedade começa com grid.' }),
      template({ idSlug: 'responsividade', language: 'CSS', areaId: 'css', concept: 'Responsividade', kind: 'complete-code', title: 'CSS: media query', description: 'Complete a regra que aplica estilo em telas pequenas.', code: '____ (max-width: 600px) {\n  .card { padding: 12px; }\n}', correctAnswer: '@media', distractors: ['@font-face', ':hover', '#media'], explanation: '@media declara condições de viewport. @font-face registra fontes, :hover é pseudo-classe e #media seria seletor por id.', hint: 'A regra começa com arroba.' }),
      template({ idSlug: 'tokens', language: 'CSS', areaId: 'css', concept: 'Design tokens', kind: 'complete-code', title: 'CSS: variável de espaçamento', description: 'Complete a leitura de uma custom property.', code: '.card {\n  padding: ____;\n}', correctAnswer: 'var(--space-md)', distractors: ['token(space-md)', '$space-md', 'space.md'], explanation: 'var(--space-md) lê uma custom property CSS. As outras formas pertencem a preprocessadores ou não são CSS válido padrão.', hint: 'Custom properties CSS são lidas com uma função nativa.' }),
      template({ idSlug: 'foco', language: 'CSS', areaId: 'css', concept: 'Foco visível', kind: 'complete-code', title: 'CSS: foco acessível', description: 'Complete a pseudo-classe indicada para teclado.', code: 'button____ {\n  outline: 2px solid blue;\n}', correctAnswer: ':focus-visible', distractors: [':hover', ':disabled', ':first-child'], explanation: ':focus-visible mostra foco quando apropriado, especialmente navegação por teclado. :hover é mouse, :disabled é estado inativo e :first-child é posição.', hint: 'A pseudo-classe menciona foco e visibilidade.' })
    ]
  },
  {
    prefix: 'arena-react',
    count: 40,
    templates: [
      template({ idSlug: 'state', language: 'React', areaId: 'react', concept: 'Estado com useState', kind: 'complete-code', title: 'React: contador com estado', description: 'Complete o hook usado para estado local.', code: 'const [count, setCount] = ____(0);', correctAnswer: 'useState', distractors: ['useEffect', 'useMemo', 'memo'], explanation: 'useState cria estado local e função de atualização. useEffect lida com efeitos, useMemo memoriza cálculo e memo memoriza componente.', hint: 'O hook retorna um par com valor e setter.' }),
      template({ idSlug: 'props', language: 'React', areaId: 'react', concept: 'Props', kind: 'complete-code', title: 'React: receber propriedades', description: 'Complete o parâmetro do componente para ler dados externos.', code: 'function Card(____) {\n  return <Text>{props.title}</Text>;\n}', correctAnswer: 'props', distractors: ['state', 'effect', 'context()'], explanation: 'props é o objeto recebido pelo componente com dados do pai. state é interno, effect não é parâmetro e context() não aparece assim.', hint: 'O nome precisa combinar com props.title no corpo.' }),
      template({ idSlug: 'effects', language: 'React', areaId: 'react', concept: 'Effects', kind: 'complete-code', title: 'React: carregar ao montar', description: 'Complete o hook usado para disparar carregamento após renderização.', code: '____(() => {\n  load();\n}, []);', correctAnswer: 'useEffect', distractors: ['useState', 'useRef', 'useCallback'], explanation: 'useEffect executa efeitos após renderização. useState guarda estado, useRef guarda referência e useCallback memoriza função.', hint: 'O segundo argumento é uma lista de dependências.' }),
      template({ idSlug: 'keys', language: 'React', areaId: 'react', concept: 'Keys em listas', kind: 'bug-hunt', title: 'React: key estável', description: 'Escolha a correção para uma lista renderizada sem key.', code: '{items.map((item) => (\n  <Row value={item.name} />\n))}\nCorreção: ____', correctAnswer: '<Row key={item.id} value={item.name} />', distractors: ['<Row key={Math.random()} />', '<Row id={index} />', '<Row value={item.name} key={Date.now()} />'], explanation: 'key={item.id} dá identidade estável a cada item. Math.random e Date.now mudam a cada render, e id sem key não atende o reconciler.', hint: 'A key deve ser única e estável entre renders.' }),
      template({ idSlug: 'memo', language: 'React', areaId: 'react', concept: 'Memoização', kind: 'best-solution', title: 'React: cálculo derivado caro', description: 'Escolha o hook para memorizar um cálculo derivado de filtros.', code: 'const filtrados = ____(() => aplicarFiltros(items, filtros), [items, filtros]);', correctAnswer: 'useMemo', distractors: ['useEffect', 'useState', 'useRef'], explanation: 'useMemo memoriza o valor calculado enquanto dependências não mudam. useEffect não retorna valor para render, useState exigiria sincronização manual e useRef não recalcula por dependência.', hint: 'Você quer memorizar um valor, não uma função.' })
    ]
  },
  {
    prefix: 'arena-node',
    count: 40,
    templates: [
      template({ idSlug: 'rotas', language: 'Node.js', areaId: 'node', concept: 'Rotas Express', kind: 'complete-code', title: 'Node.js: rota de saúde', description: 'Complete o método HTTP para registrar uma rota GET.', code: 'app.____("/health", handler);', correctAnswer: 'get', distractors: ['use', 'post', 'listen'], explanation: 'app.get registra handler para GET /health. use registra middleware genérico, post recebe POST e listen inicia o servidor.', hint: 'A rota deve responder leitura simples.' }),
      template({ idSlug: 'middleware', language: 'Node.js', areaId: 'node', concept: 'Middleware', kind: 'complete-code', title: 'Node.js: seguir para próximo middleware', description: 'Complete o parâmetro chamado ao finalizar validação.', code: 'function auth(req, res, ____) {\n  // valida token\n  next();\n}', correctAnswer: 'next', distractors: ['done', 'return', 'handler'], explanation: 'next é o callback padrão do Express para continuar a cadeia. done e handler não são o parâmetro esperado, return não é nome de função.', hint: 'O corpo já chama esse identificador.' }),
      template({ idSlug: 'env', language: 'Node.js', areaId: 'node', concept: 'Variáveis de ambiente', kind: 'complete-code', title: 'Node.js: ler chave do ambiente', description: 'Complete a origem segura para configuração pública do processo.', code: 'const key = ____.API_KEY;', correctAnswer: 'process.env', distractors: ['window.env', 'document.env', 'localStorage'], explanation: 'process.env expõe variáveis de ambiente no Node.js. window/document são do navegador e localStorage não é configuração de servidor.', hint: 'No Node, o objeto global de processo guarda env.' }),
      template({ idSlug: 'event-loop', language: 'Node.js', areaId: 'node', concept: 'Event loop', kind: 'best-solution', title: 'Node.js: evitar bloqueio', description: 'Escolha a melhor opção para CPU pesada em servidor Node.', code: 'Uma rotina de imagem bloqueia requisições por segundos. Melhor solução: ____', correctAnswer: 'mover para worker_threads', distractors: ['usar while aguardando', 'salvar em variável global', 'chamar setTimeout sem mudar a rotina'], explanation: 'worker_threads isola CPU pesada sem travar o event loop. while piora bloqueio, global não reduz custo e setTimeout apenas adia o problema.', hint: 'CPU pesada precisa sair da thread principal.' }),
      template({ idSlug: 'erros', language: 'Node.js', areaId: 'node', concept: 'Tratamento de erros', kind: 'bug-hunt', title: 'Node.js: capturar falha async', description: 'Escolha a correção para uma rota assíncrona que pode rejeitar.', code: 'app.get("/user", async (req, res) => {\n  const user = await repo.find(req.query.id);\n  res.json(user);\n});\nCorreção: ____', correctAnswer: 'envolver em try/catch e enviar erro ao middleware', distractors: ['ignorar a Promise', 'responder 200 para qualquer falha', 'remover await'], explanation: 'try/catch permite tratar rejeição e delegar erro ao middleware. Ignorar, responder sucesso falso ou remover await deixa falhas sem resposta controlada.', hint: 'A correção precisa lidar com rejeição da chamada async.' })
    ]
  },
  {
    prefix: 'arena-rest',
    count: 40,
    templates: [
      template({ idSlug: 'get', language: 'APIs REST', areaId: 'rest', concept: 'GET', kind: 'complete-code', title: 'APIs REST: buscar usuários', description: 'Complete o método para leitura sem criar recurso.', code: '____ /api/users', correctAnswer: 'GET', distractors: ['POST', 'PATCH', 'DELETE'], explanation: 'GET lê recursos sem criar alteração. POST cria, PATCH altera parcialmente e DELETE remove.', hint: 'Leitura de lista usa método seguro.' }),
      template({ idSlug: 'post', language: 'APIs REST', areaId: 'rest', concept: 'POST', kind: 'complete-code', title: 'APIs REST: criar usuário', description: 'Complete o método usado para criar novo recurso.', code: '____ /api/users\n{ "name": "Ana" }', correctAnswer: 'POST', distractors: ['GET', 'HEAD', 'OPTIONS'], explanation: 'POST envia representação para criação. GET lê, HEAD retorna cabeçalhos e OPTIONS descreve capacidades.', hint: 'Criação envia corpo para a coleção.' }),
      template({ idSlug: 'status', language: 'APIs REST', areaId: 'rest', concept: 'Status HTTP', kind: 'complete-code', title: 'APIs REST: recurso não encontrado', description: 'Complete o status adequado para recurso inexistente.', code: 'Usuário inexistente -> ____', correctAnswer: '404', distractors: ['200', '201', '500'], explanation: '404 indica recurso não encontrado. 200 é sucesso, 201 criação e 500 erro interno inesperado.', hint: 'O cliente pediu algo que não existe.' }),
      template({ idSlug: 'auth', language: 'APIs REST', areaId: 'rest', concept: 'Autenticação Bearer', kind: 'complete-code', title: 'APIs REST: cabeçalho de autenticação', description: 'Complete o cabeçalho usado para enviar token Bearer.', code: '____: Bearer <token>', correctAnswer: 'Authorization', distractors: ['Content-Type', 'Accept', 'Cache-Control'], explanation: 'Authorization carrega credenciais como Bearer token. Content-Type descreve corpo, Accept negocia resposta e Cache-Control trata cache.', hint: 'O nome do cabeçalho fala de autorização.' }),
      template({ idSlug: 'paginacao', language: 'APIs REST', areaId: 'rest', concept: 'Paginação', kind: 'complete-code', title: 'APIs REST: limitar página', description: 'Complete o parâmetro que limita quantidade de itens.', code: 'GET /api/users?page=2&____=20', correctAnswer: 'limit', distractors: ['sort', 'token', 'status'], explanation: 'limit define quantos itens retornar por página. sort ordena, token autentica e status filtraria por estado.', hint: 'O parâmetro controla tamanho da página.' })
    ]
  },
  {
    prefix: 'arena-git',
    count: 40,
    templates: [
      template({ idSlug: 'commit', language: 'Git', areaId: 'git', concept: 'Commit', kind: 'complete-code', title: 'Git: registrar alteração', description: 'Complete o comando que cria um commit com mensagem.', code: 'git ____ -m "fix"', correctAnswer: 'commit', distractors: ['status', 'merge', 'branch'], explanation: 'git commit registra alterações staged. status mostra estado, merge combina branches e branch lista ou cria referências.', hint: 'A mensagem -m acompanha o registro da mudança.' }),
      template({ idSlug: 'branch', language: 'Git', areaId: 'git', concept: 'Branch', kind: 'complete-code', title: 'Git: criar e trocar de branch', description: 'Complete o comando moderno para criar e entrar na branch.', code: 'git ____ feature/login', correctAnswer: 'switch -c', distractors: ['merge', 'status', 'commit'], explanation: 'git switch -c cria e troca para a nova branch. merge combina histórico, status inspeciona e commit registra alterações.', hint: 'O comando combina troca de branch com criação.' }),
      template({ idSlug: 'merge', language: 'Git', areaId: 'git', concept: 'Merge', kind: 'complete-code', title: 'Git: combinar main', description: 'Complete o comando que incorpora a branch main na atual.', code: 'git ____ main', correctAnswer: 'merge', distractors: ['status', 'commit', 'log'], explanation: 'git merge main incorpora commits da main na branch atual. status e log só inspecionam, commit cria novo registro local.', hint: 'A operação junta históricos.' }),
      template({ idSlug: 'rebase', language: 'Git', areaId: 'git', concept: 'Rebase', kind: 'best-solution', title: 'Git: atualizar branch linear', description: 'Escolha o comando que reaplica commits da branch sobre main.', code: 'Na branch feature, para reaplicar commits sobre main: ____', correctAnswer: 'git rebase main', distractors: ['git status main', 'git commit main', 'git stash drop main'], explanation: 'git rebase main reaplica a branch atual sobre main. status não altera histórico, commit não atualiza base e stash drop remove stash.', hint: 'A palavra do comando é o próprio conceito.' }),
      template({ idSlug: 'ci', language: 'Git', areaId: 'git', concept: 'Pull request e CI', kind: 'order-blocks', title: 'Git: fluxo com revisão', description: 'Escolha a ordem coerente para abrir uma mudança revisável.', code: 'Ordene o fluxo: ____', correctAnswer: 'branch -> commit -> push -> pull request', distractors: ['commit -> pull request -> branch -> push', 'push -> branch -> commit -> pull request', 'pull request -> commit -> branch -> push'], explanation: 'O fluxo revisável nasce em branch, registra commits, envia ao remoto e então abre pull request para CI e revisão.', hint: 'A revisão só acontece depois que a branch existe no remoto.' })
    ]
  },
  {
    prefix: 'arena-interview',
    count: 60,
    templates: [
      template({ idSlug: 'trade-offs', language: 'Entrevista', areaId: 'interview', concept: 'Trade-offs', kind: 'best-solution', title: 'Entrevista: explicar trade-offs', description: 'Escolha a resposta mais forte ao comparar duas soluções.', code: 'Pergunta: qual solução você escolheria?\nResposta forte: ____', correctAnswer: 'comparar custo, risco e contexto antes de decidir', distractors: ['dizer que uma é sempre melhor', 'ignorar limitações', 'escolher a mais nova sem motivo'], explanation: 'Comparar custo, risco e contexto mostra maturidade. Respostas absolutas ou baseadas em moda escondem critérios importantes.', hint: 'Boa decisão técnica explicita critérios.' }),
      template({ idSlug: 'debug', language: 'Entrevista', areaId: 'interview', concept: 'Debug sistemático', kind: 'order-blocks', title: 'Entrevista: investigar bug', description: 'Escolha a ordem mais confiável de investigação.', code: 'Bug reportado em produção. Ordem: ____', correctAnswer: 'reproduzir -> isolar causa -> corrigir -> validar', distractors: ['corrigir -> reproduzir -> validar -> isolar', 'validar -> corrigir -> reproduzir -> isolar', 'isolar -> validar -> corrigir -> reproduzir'], explanation: 'Reproduzir confirma o problema, isolar evita chute, corrigir muda o menor ponto necessário e validar prova o resultado.', hint: 'Antes de corrigir, prove que entende o erro.' }),
      template({ idSlug: 'complexidade', language: 'Entrevista', areaId: 'interview', concept: 'Complexidade', kind: 'complete-code', title: 'Entrevista: custo de algoritmo', description: 'Complete os dois eixos de análise de complexidade.', code: 'Ao analisar algoritmo, considere tempo e ____', correctAnswer: 'memória', distractors: ['cor da UI', 'nome da branch', 'tamanho do commit'], explanation: 'Complexidade costuma avaliar tempo e memória. Os outros itens podem importar em revisão, mas não são o eixo clássico de algoritmo.', hint: 'Além de quanto demora, pense em quanto ocupa.' }),
      template({ idSlug: 'testes', language: 'Entrevista', areaId: 'interview', concept: 'Casos de teste', kind: 'best-solution', title: 'Entrevista: testar solução', description: 'Escolha o conjunto de testes mais convincente.', code: 'Depois de resolver, bons testes incluem: ____', correctAnswer: 'caso normal, borda e erro', distractors: ['apenas o exemplo feliz', 'nenhum teste para ganhar tempo', 'só entradas enormes'], explanation: 'Caso normal, borda e erro mostram cobertura de comportamento. Só exemplo feliz ou só entradas enormes deixam riscos sem verificação.', hint: 'Mostre que você pensa além do caminho feliz.' }),
      template({ idSlug: 'comunicacao', language: 'Entrevista', areaId: 'interview', concept: 'Comunicação técnica', kind: 'best-solution', title: 'Entrevista: pensar em voz alta', description: 'Escolha a postura mais profissional durante uma questão difícil.', code: 'Ao travar em uma questão, melhor atitude: ____', correctAnswer: 'explicar hipóteses e pedir confirmação de premissas', distractors: ['ficar em silêncio total', 'inventar certeza', 'trocar de assunto'], explanation: 'Explicar hipóteses e confirmar premissas torna o raciocínio avaliável. Silêncio, certeza inventada ou fuga reduzem confiança.', hint: 'Entrevista avalia processo, não só resposta final.' })
    ]
  }
];

const difficulties: Difficulty[] = ['iniciante', 'intermediario', 'avancado'];

export const codeChallengeTemplates: ChallengeTemplate[] = groups.flatMap((group) => group.templates);

export const codeChallenges: CodeChallenge[] = groups.flatMap((group) =>
  Array.from({ length: group.count }, (_, itemIndex) => {
    const index = itemIndex + 1;
    const base = group.templates[itemIndex % group.templates.length];
    const difficulty = difficulties[Math.floor((itemIndex / group.count) * difficulties.length)] ?? 'iniciante';
    const { options, correctIndex } = optionsFor(base, itemIndex);
    const reward = rewardFor(difficulty);

    return {
      id: `${group.prefix}-${base.idSlug}-${pad(index)}`,
      title: base.title,
      description: base.description,
      areaId: base.areaId,
      language: base.language,
      concept: base.concept,
      difficulty,
      kind: base.kind,
      code: base.code,
      options,
      correctIndex,
      explanation: `${base.explanation} Conceito avaliado: ${base.concept}.`,
      hint: base.hint,
      ...reward
    };
  })
);

export const codeChallengeById = (id: string) => codeChallenges.find((challenge) => challenge.id === id);

const normalizeConcept = (value?: string) =>
  value
    ?.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim() ?? '';

export const recommendedCodeChallengeFor = (areaId?: AreaId, concept?: string) => {
  const candidates = codeChallenges.filter((challenge) => challenge.areaId === areaId);
  const normalizedConcept = normalizeConcept(concept);
  return (
    (normalizedConcept
      ? candidates.find((challenge) => {
          const challengeConcept = normalizeConcept(challenge.concept);
          return normalizedConcept.includes(challengeConcept) || challengeConcept.includes(normalizedConcept);
        })
      : undefined) ??
    candidates[0] ??
    codeChallenges[0]
  );
};
