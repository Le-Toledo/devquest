import { AreaId } from '../types/game';

export const reviewLessons: Record<AreaId, { title: string; lesson: string; code?: string }> = {
  logic: {
    title: 'Pense em passos pequenos',
    lesson: 'Quando errar logica, escreva entrada, processamento e saida. Bugs ficam menores quando o raciocinio vira uma sequencia clara.',
    code: 'se entrada for valida:\n  processe\nsenao:\n  explique o erro'
  },
  javascript: {
    title: 'JavaScript gosta de referencias claras',
    lesson: 'Confira tipos, comparadores e mutacoes. Muitos bugs nascem quando o valor parece uma coisa, mas o runtime trata como outra.',
    code: 'const isAdult = age >= 18;\nif (isAdult) console.log("ok");'
  },
  typescript: {
    title: 'Deixe o tipo contar a historia',
    lesson: 'Use tipos especificos para representar estados reais. Evite any quando voce ainda precisa validar dados externos.',
    code: 'type State = { status: "loading" } | { status: "success"; data: string[] };'
  },
  python: {
    title: 'Python premia legibilidade',
    lesson: 'Observe indentacao, nomes claros e estruturas nativas. Se o bloco esta confuso, extraia uma funcao pequena.',
    code: 'def aprovado(nota):\n    return nota >= 7'
  },
  java: {
    title: 'Contratos importam em Java',
    lesson: 'Classes, interfaces e colecoes ficam mais seguras quando cada parte tem responsabilidade clara.',
    code: 'List<String> names = new ArrayList<>();\nnames.add("Ada");'
  },
  kotlin: {
    title: 'Null safety e seu escudo',
    lesson: 'Prefira safe calls, Elvis operator e modelos claros. Use !! somente quando tiver certeza absoluta.',
    code: 'val size = user?.name?.length ?: 0'
  },
  csharp: {
    title: 'C# profissional separa responsabilidades',
    lesson: 'Use tipos, interfaces e async com cuidado. Codigo testavel costuma depender de contratos, nao de detalhes fixos.',
    code: 'public interface IUserService {\n  Task<User> GetAsync(int id);\n}'
  },
  sql: {
    title: 'Consulte com intencao',
    lesson: 'Evite SELECT * sem necessidade, filtre com WHERE e use parametros para separar comando de dados.',
    code: 'SELECT id, name FROM users WHERE active = 1;'
  },
  html: {
    title: 'Semantica e acessibilidade andam juntas',
    lesson: 'Escolha tags que explicam o conteudo. Um button real e melhor que uma div clicavel.',
    code: '<button type="button">Salvar</button>'
  },
  css: {
    title: 'Layout precisa de sistema',
    lesson: 'Use flex para uma dimensao, grid para duas, e mantenha tokens de espacamento e cores consistentes.',
    code: '.toolbar { display: flex; gap: 12px; align-items: center; }'
  },
  react: {
    title: 'Estado dirige a interface',
    lesson: 'Evite mutar estado diretamente. React entende melhor mudancas quando voce cria novos objetos e arrays.',
    code: 'setItems((items) => [...items, nextItem]);'
  },
  node: {
    title: 'Nao bloqueie o event loop',
    lesson: 'Trate erros async, valide entradas e evite tarefas CPU-bound na thread principal.',
    code: 'try {\n  const data = await service.load();\n} catch (error) {\n  next(error);\n}'
  },
  git: {
    title: 'Historico tambem e produto',
    lesson: 'Commits pequenos e mensagens claras facilitam review, rollback e colaboracao.',
    code: 'git status\ngit add src/app.ts\ngit commit -m "Add review lab"'
  },
  rest: {
    title: 'APIs precisam falar claro',
    lesson: 'Use metodos e status HTTP corretos. Clientes dependem de contratos previsiveis.',
    code: 'GET /users/42 -> 200\nPOST /users -> 201'
  },
  interview: {
    title: 'Entrevista mede raciocinio',
    lesson: 'Explique problema, alternativas, trade-offs e validacao. Uma boa resposta mostra como voce pensa sob incerteza.',
    code: 'problema -> hipoteses -> solucao -> custo -> testes'
  }
};

export const lessonForArea = (areaId: AreaId) => reviewLessons[areaId];
