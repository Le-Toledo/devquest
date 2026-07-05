import { questions } from '../data/questions';
import { CampaignMission } from '../types/campaign';
import { AreaId, QuestionKind, Stage } from '../types/game';

type MentorTone = {
  label: string;
  intro: string;
  hint: string;
  victory: string;
  defeat: string;
  mid: string;
};

const defaultTone: MentorTone = {
  label: 'Fundamentos',
  intro: 'Hoje vamos transformar uma ideia confusa em passos claros.',
  hint: 'Leia o enunciado como se fosse um mapa: objetivo, restrição e decisão.',
  victory: 'Boa. Você resolveu a missão com raciocínio de dev: observar, decidir e validar.',
  defeat: 'Ainda não fechou, mas agora o erro tem nome. Vamos revisar o conceito e tentar de novo.',
  mid: 'Respira e procura a regra central. A resposta certa costuma respeitar o objetivo da missão.'
};

const tones: Partial<Record<AreaId, MentorTone>> = {
  html: {
    label: 'HTML',
    intro: 'Hoje vamos aprender a estrutura básica de uma página.',
    hint: 'Pense em semântica: cada tag deve dizer ao navegador qual é o papel daquele conteúdo.',
    victory: 'Sua página ficou mais clara, acessível e pronta para receber estilo.',
    defeat: 'A estrutura ainda está tremendo. Revise tags semânticas, links, imagens e formulários.',
    mid: 'HTML bom não é decoração; é significado. Procure a alternativa mais semântica.'
  },
  css: {
    label: 'CSS',
    intro: 'Hoje você descobrirá como dar estilo às suas páginas.',
    hint: 'Procure a regra que organiza layout sem brigar com a cascata.',
    victory: 'O layout respirou melhor. Você usou estilo com intenção, não só cor bonita.',
    defeat: 'O visual ainda quebrou em alguns pontos. Revise cascata, flexbox, grid e responsividade.',
    mid: 'Quando a tela parece caótica, separe: espaçamento, alinhamento, hierarquia e estado.'
  },
  javascript: {
    label: 'JavaScript',
    intro: 'Prepare-se para criar lógica e comportamento.',
    hint: 'Siga o fluxo dos dados: entrada, transformação, condição e saída.',
    victory: 'Excelente. A interface agora responde como um sistema vivo.',
    defeat: 'A lógica escapou por pouco. Revise arrays, eventos, funções e assincronia.',
    mid: 'Antes de escolher, pergunte: isso transforma, filtra, compara ou espera uma resposta?'
  },
  react: {
    label: 'React',
    intro: 'Hoje vamos construir interfaces reutilizáveis.',
    hint: 'Procure a fronteira entre props, estado e efeito.',
    victory: 'Boa composição. Seus componentes ficaram mais previsíveis e reutilizáveis.',
    defeat: 'A UI ainda está misturando responsabilidades. Revise props, state, effects e keys.',
    mid: 'React melhora quando cada componente tem um trabalho claro.'
  },
  kotlin: {
    label: 'Kotlin',
    intro: 'Hoje vamos dominar Null Safety.',
    hint: 'Dados ausentes precisam aparecer no tipo. Procure safe call, Elvis e imutabilidade.',
    victory: 'Ótimo. Você blindou o app contra nulos e estados perigosos.',
    defeat: 'O Null Pointer ainda rondou a missão. Revise ?, ?., ?:, val e sealed states.',
    mid: 'Se algo pode não existir, Kotlin quer que você admita isso no código.'
  },
  sql: {
    label: 'SQL',
    intro: 'Hoje você aprenderá a consultar dados.',
    hint: 'Comece por quais colunas quer ler, depois filtre, relacione e agrupe.',
    victory: 'Consulta recuperada. Seus dados voltaram com critério e segurança.',
    defeat: 'O banco respondeu, mas não do jeito certo. Revise SELECT, WHERE, JOIN e parâmetros.',
    mid: 'Banco bom responde pergunta específica. Qual filtro ou relação o enunciado pede?'
  },
  node: {
    label: 'Node.js',
    intro: 'Hoje vamos conversar com servidores.',
    hint: 'Pense em rota, requisição, resposta, erro e contrato.',
    victory: 'Servidor estável. Sua API ficou mais clara para o cliente e para o futuro.',
    defeat: 'O servidor ainda falhou em algum contrato. Revise rotas, middleware e tratamento de erro.',
    mid: 'No backend, cada caminho precisa dizer: quem chamou, o que pediu e como falhou.'
  },
  java: {
    label: 'Java',
    intro: 'Hoje vamos fortalecer classes, objetos e contratos.',
    hint: 'Procure tipos explícitos, responsabilidade clara e comparações corretas.',
    victory: 'Boa. A JVM recebeu código mais previsível e menos frágil.',
    defeat: 'Ainda existe fragilidade no modelo. Revise classes, interfaces, equals e nulos.',
    mid: 'Em Java, clareza de tipo e contrato costuma vencer atalho esperto.'
  },
  python: {
    label: 'Python',
    intro: 'Hoje vamos escrever código direto, legível e poderoso.',
    hint: 'Procure a alternativa mais simples que respeita coleções, indentação e recursos.',
    victory: 'Elegante. Você resolveu com clareza, sem complicar o que podia ser simples.',
    defeat: 'A solução ainda não ficou pythônica. Revise listas, dicts, indentação e with.',
    mid: 'Python premia legibilidade. Se parece truque, provavelmente não é o melhor caminho.'
  },
  logic: defaultTone,
  typescript: {
    label: 'TypeScript',
    intro: 'Hoje vamos transformar incerteza em contratos de código.',
    hint: 'Procure tipos que impedem estados impossíveis antes do app rodar.',
    victory: 'Contrato fechado. O compilador agora trabalha a seu favor.',
    defeat: 'O contrato ainda permite ambiguidade. Revise unions, interfaces, guards e unknown.',
    mid: 'TypeScript não é enfeite; é uma rede de segurança para mudanças futuras.'
  },
  rest: {
    label: 'APIs REST',
    intro: 'Hoje vamos desenhar contratos HTTP claros.',
    hint: 'Pense em recurso, método, status e efeito esperado.',
    victory: 'Contrato restaurado. Cliente e servidor voltaram a falar a mesma lingua.',
    defeat: 'A API ainda está ambígua. Revise verbos, status, recursos e idempotência.',
    mid: 'Uma boa API deixa claro o que lê, cria, altera ou falha.'
  },
  git: {
    label: 'Git',
    intro: 'Hoje vamos proteger a história do projeto.',
    hint: 'Procure a ação que preserva contexto, revisão e rollback.',
    victory: 'Histórico organizado. Sua equipe futura agradece.',
    defeat: 'O fluxo ainda pode bagunçar a história. Revise commits, branches, PRs e conflitos.',
    mid: 'Git é memória do time. Escolha o passo que deixa a história mais clara.'
  }
};

const selectableKinds: QuestionKind[] = ['quiz', 'complete-code', 'bug-hunt', 'order-blocks', 'best-solution'];

const normalize = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export const mentorMissionService = {
  toneFor(mission: CampaignMission): MentorTone {
    return (mission.areaId ? tones[mission.areaId] : undefined) ?? defaultTone;
  },

  objectiveFor(mission: CampaignMission) {
    const action = mission.type === 'battle' ? 'responder à sequência de preparo' : `resolver perguntas de ${mission.concept}`;
    return `${action} até o fim para validar a missão.`;
  },

  buildStage(mission: CampaignMission, limit = mission.type === 'battle' ? 4 : 3): Stage {
    const areaId = mission.areaId ?? 'logic';
    const missionKind = selectableKinds.includes(mission.type as QuestionKind) ? (mission.type as QuestionKind) : undefined;
    const concept = normalize(`${mission.concept} ${mission.title}`);
    const areaQuestions = questions.filter((question) => question.areaId === areaId);
    const conceptMatches = areaQuestions.filter((question) => {
      const haystack = normalize(`${question.prompt} ${question.tags.join(' ')} ${question.explanation}`);
      return concept.split(/\s+/).some((term) => term.length > 3 && haystack.includes(term));
    });
    const kindMatches = areaQuestions.filter((question) => !missionKind || question.kind === missionKind);
    const candidates = [...conceptMatches, ...kindMatches, ...areaQuestions];
    const questionIds = Array.from(new Set(candidates.map((question) => question.id))).slice(0, Math.max(limit * 4, limit));

    return {
      id: `campaign-${mission.id}`,
      worldId: mission.chapterId,
      title: mission.title,
      areaId,
      requiredLevel: 1,
      questionIds
    };
  }
};
