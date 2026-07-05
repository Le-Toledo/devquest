import { AreaId } from '../types/game';

export const reviewLessons: Record<AreaId, { title: string; lesson: string; code?: string }> = {
  logic: {
    title: 'Pense em passos pequenos',
    lesson: 'Quando errar lógica, escreva entrada, processamento e saída. Bugs ficam menores quando o raciocínio vira uma sequência clara.',
    code: 'se entrada for valida:\n  processe\nsenao:\n  explique o erro'
  },
  javascript: {
    title: 'JavaScript gosta de referências claras',
    lesson: 'Confira tipos, comparadores e mutações. Muitos bugs nascem quando o valor parece uma coisa, mas o runtime trata como outra.',
    code: 'const isAdult = age >= 18;\nif (isAdult) console.log("ok");'
  },
  typescript: {
    title: 'Deixe o tipo contar a história',
    lesson: 'Use tipos específicos para representar estados reais. Evite any quando você ainda precisa validar dados externos.',
    code: 'type State = { status: "loading" } | { status: "success"; data: string[] };'
  },
  python: {
    title: 'Python premia legibilidade',
    lesson: 'Observe indentação, nomes claros e estruturas nativas. Se o bloco está confuso, extraia uma função pequena.',
    code: 'def aprovado(nota):\n    return nota >= 7'
  },
  java: {
    title: 'Contratos importam em Java',
    lesson: 'Classes, interfaces e coleções ficam mais seguras quando cada parte tem responsabilidade clara.',
    code: 'List<String> names = new ArrayList<>();\nnames.add("Ada");'
  },
  kotlin: {
    title: 'Null safety e seu escudo',
    lesson: 'Prefira safe calls, Elvis operator e modelos claros. Use !! somente quando tiver certeza absoluta.',
    code: 'val size = user?.name?.length ?: 0'
  },
  csharp: {
    title: 'C# profissional separa responsabilidades',
    lesson: 'Use tipos, interfaces e async com cuidado. Código testável costuma depender de contratos, não de detalhes fixos.',
    code: 'public interface IUserService {\n  Task<User> GetAsync(int id);\n}'
  },
  sql: {
    title: 'Consulte com intenção',
    lesson: 'Evite SELECT * sem necessidade, filtre com WHERE e use parâmetros para separar comando de dados.',
    code: 'SELECT id, name FROM users WHERE active = 1;'
  },
  html: {
    title: 'Semântica e acessibilidade andam juntas',
    lesson: 'Escolha tags que explicam o conteúdo. Um button real é melhor que uma div clicável.',
    code: '<button type="button">Salvar</button>'
  },
  css: {
    title: 'Layout precisa de sistema',
    lesson: 'Use flex para uma dimensão, grid para duas, e mantenha tokens de espaçamento e cores consistentes.',
    code: '.toolbar { display: flex; gap: 12px; align-items: center; }'
  },
  react: {
    title: 'Estado dirige a interface',
    lesson: 'Evite mutar estado diretamente. React entende melhor mudanças quando você cria novos objetos e arrays.',
    code: 'setItems((items) => [...items, nextItem]);'
  },
  node: {
    title: 'Não bloqueie o event loop',
    lesson: 'Trate erros async, valide entradas e evite tarefas CPU-bound na thread principal.',
    code: 'try {\n  const data = await service.load();\n} catch (error) {\n  next(error);\n}'
  },
  git: {
    title: 'Histórico também é produto',
    lesson: 'Commits pequenos e mensagens claras facilitam review, rollback e colaboração.',
    code: 'git status\ngit add src/app.ts\ngit commit -m "Add review lab"'
  },
  rest: {
    title: 'APIs precisam falar claro',
    lesson: 'Use métodos e status HTTP corretos. Clientes dependem de contratos previsíveis.',
    code: 'GET /users/42 -> 200\nPOST /users -> 201'
  },
  interview: {
    title: 'Entrevista mede raciocínio',
    lesson: 'Explique problema, alternativas, trade-offs e validação. Uma boa resposta mostra como você pensa sob incerteza.',
    code: 'problema -> hipóteses -> solução -> custo -> testes'
  }
};

export const lessonForArea = (areaId: AreaId) => reviewLessons[areaId];
