import { CareerTip } from '../types/game';

export const careerTips: CareerTip[] = [
  { id: 'git-flow', tag: 'GitHub', title: 'Trabalhe em branches pequenas', body: 'Uma feature por branch facilita review, rollback e entendimento do histórico.' },
  { id: 'api-contract', tag: 'APIs', title: 'Contratos vencem improviso', body: 'Documente status, payloads e erros esperados. Um cliente previsível vende confiança.' },
  { id: 'database-index', tag: 'Banco', title: 'Índice não é decoração', body: 'Crie índices para consultas reais e monitore custo de escrita antes de sair indexando tudo.' },
  { id: 'frontend-a11y', tag: 'Front-end', title: 'Acessibilidade e qualidade', body: 'Labels, contraste, foco e semântica melhoram o produto para todos os usuários.' },
  { id: 'backend-logs', tag: 'Back-end', title: 'Logs contam a história da produção', body: 'Registre eventos importantes com contexto, sem vazar dados sensíveis.' },
  { id: 'interview', tag: 'Entrevistas', title: 'Explique trade-offs', body: 'Em entrevistas técnicas, pensar alto e comparar alternativas vale tanto quanto chegar rápido.' },
  { id: 'portfolio', tag: 'Portfólio', title: 'Mostre produtos completos', body: 'Um app pequeno, bonito, testado e publicado comunica mais que dez listas de tarefas genéricas.' },
  { id: 'study', tag: 'Estudo', title: 'Estude em ciclos jogáveis', body: 'Aprenda conceito, pratique em desafio curto, revise erro e publique um miniprojeto.' }
];
