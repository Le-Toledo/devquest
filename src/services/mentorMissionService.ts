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
  hint: 'Leia o enunciado como se fosse um mapa: objetivo, restricao e decisao.',
  victory: 'Boa. Voce resolveu a missao com raciocinio de dev: observar, decidir e validar.',
  defeat: 'Ainda nao fechou, mas agora o erro tem nome. Vamos revisar o conceito e tentar de novo.',
  mid: 'Respira e procura a regra central. A resposta certa costuma respeitar o objetivo da missao.'
};

const tones: Partial<Record<AreaId, MentorTone>> = {
  html: {
    label: 'HTML',
    intro: 'Hoje vamos aprender a estrutura basica de uma pagina.',
    hint: 'Pense em semantica: cada tag deve dizer ao navegador qual e o papel daquele conteudo.',
    victory: 'Sua pagina ficou mais clara, acessivel e pronta para receber estilo.',
    defeat: 'A estrutura ainda esta tremendo. Revise tags semanticas, links, imagens e formularios.',
    mid: 'HTML bom nao e decoracao; e significado. Procure a alternativa mais semantica.'
  },
  css: {
    label: 'CSS',
    intro: 'Hoje voce descobrira como dar estilo as suas paginas.',
    hint: 'Procure a regra que organiza layout sem brigar com a cascata.',
    victory: 'O layout respirou melhor. Voce usou estilo com intencao, nao so cor bonita.',
    defeat: 'O visual ainda quebrou em alguns pontos. Revise cascata, flexbox, grid e responsividade.',
    mid: 'Quando a tela parece caotica, separe: espacamento, alinhamento, hierarquia e estado.'
  },
  javascript: {
    label: 'JavaScript',
    intro: 'Prepare-se para criar logica e comportamento.',
    hint: 'Siga o fluxo dos dados: entrada, transformacao, condicao e saida.',
    victory: 'Excelente. A interface agora responde como um sistema vivo.',
    defeat: 'A logica escapou por pouco. Revise arrays, eventos, funcoes e assincronia.',
    mid: 'Antes de escolher, pergunte: isso transforma, filtra, compara ou espera uma resposta?'
  },
  react: {
    label: 'React',
    intro: 'Hoje vamos construir interfaces reutilizaveis.',
    hint: 'Procure a fronteira entre props, estado e efeito.',
    victory: 'Boa composicao. Seus componentes ficaram mais previsiveis e reutilizaveis.',
    defeat: 'A UI ainda esta misturando responsabilidades. Revise props, state, effects e keys.',
    mid: 'React melhora quando cada componente tem um trabalho claro.'
  },
  kotlin: {
    label: 'Kotlin',
    intro: 'Hoje vamos dominar Null Safety.',
    hint: 'Dados ausentes precisam aparecer no tipo. Procure safe call, Elvis e imutabilidade.',
    victory: 'Otimo. Voce blindou o app contra nulos e estados perigosos.',
    defeat: 'O Null Pointer ainda rondou a missao. Revise ?, ?., ?:, val e sealed states.',
    mid: 'Se algo pode nao existir, Kotlin quer que voce admita isso no codigo.'
  },
  sql: {
    label: 'SQL',
    intro: 'Hoje voce aprendera a consultar dados.',
    hint: 'Comece por quais colunas quer ler, depois filtre, relacione e agrupe.',
    victory: 'Consulta recuperada. Seus dados voltaram com criterio e seguranca.',
    defeat: 'O banco respondeu, mas nao do jeito certo. Revise SELECT, WHERE, JOIN e parametros.',
    mid: 'Banco bom responde pergunta especifica. Qual filtro ou relacao o enunciado pede?'
  },
  node: {
    label: 'Node.js',
    intro: 'Hoje vamos conversar com servidores.',
    hint: 'Pense em rota, requisicao, resposta, erro e contrato.',
    victory: 'Servidor estavel. Sua API ficou mais clara para o cliente e para o futuro.',
    defeat: 'O servidor ainda falhou em algum contrato. Revise rotas, middleware e tratamento de erro.',
    mid: 'No backend, cada caminho precisa dizer: quem chamou, o que pediu e como falhou.'
  },
  java: {
    label: 'Java',
    intro: 'Hoje vamos fortalecer classes, objetos e contratos.',
    hint: 'Procure tipos explicitos, responsabilidade clara e comparacoes corretas.',
    victory: 'Boa. A JVM recebeu codigo mais previsivel e menos fragil.',
    defeat: 'Ainda existe fragilidade no modelo. Revise classes, interfaces, equals e nulos.',
    mid: 'Em Java, clareza de tipo e contrato costuma vencer atalho esperto.'
  },
  python: {
    label: 'Python',
    intro: 'Hoje vamos escrever codigo direto, legivel e poderoso.',
    hint: 'Procure a alternativa mais simples que respeita colecoes, indentacao e recursos.',
    victory: 'Elegante. Voce resolveu com clareza, sem complicar o que podia ser simples.',
    defeat: 'A solucao ainda nao ficou pythonica. Revise listas, dicts, indentacao e with.',
    mid: 'Python premia legibilidade. Se parece truque, provavelmente nao e o melhor caminho.'
  },
  logic: defaultTone,
  typescript: {
    label: 'TypeScript',
    intro: 'Hoje vamos transformar incerteza em contratos de codigo.',
    hint: 'Procure tipos que impedem estados impossiveis antes do app rodar.',
    victory: 'Contrato fechado. O compilador agora trabalha a seu favor.',
    defeat: 'O contrato ainda permite ambiguidade. Revise unions, interfaces, guards e unknown.',
    mid: 'TypeScript nao e enfeite; e uma rede de seguranca para mudancas futuras.'
  },
  rest: {
    label: 'APIs REST',
    intro: 'Hoje vamos desenhar contratos HTTP claros.',
    hint: 'Pense em recurso, metodo, status e efeito esperado.',
    victory: 'Contrato restaurado. Cliente e servidor voltaram a falar a mesma lingua.',
    defeat: 'A API ainda esta ambigua. Revise verbos, status, recursos e idempotencia.',
    mid: 'Uma boa API deixa claro o que le, cria, altera ou falha.'
  },
  git: {
    label: 'Git',
    intro: 'Hoje vamos proteger a historia do projeto.',
    hint: 'Procure a acao que preserva contexto, revisao e rollback.',
    victory: 'Historico organizado. Sua equipe futura agradece.',
    defeat: 'O fluxo ainda pode baguncar a historia. Revise commits, branches, PRs e conflitos.',
    mid: 'Git e memoria do time. Escolha o passo que deixa a historia mais clara.'
  }
};

const selectableKinds: QuestionKind[] = ['quiz', 'complete-code', 'bug-hunt', 'order-blocks', 'best-solution'];

const normalize = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export const mentorMissionService = {
  toneFor(mission: CampaignMission): MentorTone {
    return (mission.areaId ? tones[mission.areaId] : undefined) ?? defaultTone;
  },

  objectiveFor(mission: CampaignMission) {
    const action = mission.type === 'battle' ? 'responder a sequencia de preparo' : `resolver perguntas de ${mission.concept}`;
    return `${action} ate o fim para validar a missao.`;
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
