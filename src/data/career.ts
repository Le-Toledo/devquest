import { CareerTip } from '../types/game';

export const careerTips: CareerTip[] = [
  { id: 'git-flow', tag: 'GitHub', title: 'Trabalhe em branches pequenas', body: 'Uma feature por branch facilita review, rollback e entendimento do historico.' },
  { id: 'api-contract', tag: 'APIs', title: 'Contratos vencem improviso', body: 'Documente status, payloads e erros esperados. Um cliente previsivel vende confianca.' },
  { id: 'database-index', tag: 'Banco', title: 'Indice nao e decoracao', body: 'Crie indices para consultas reais e monitore custo de escrita antes de sair indexando tudo.' },
  { id: 'frontend-a11y', tag: 'Front-end', title: 'Acessibilidade e qualidade', body: 'Labels, contraste, foco e semantica melhoram o produto para todos os usuarios.' },
  { id: 'backend-logs', tag: 'Back-end', title: 'Logs contam a historia da producao', body: 'Registre eventos importantes com contexto, sem vazar dados sensiveis.' },
  { id: 'interview', tag: 'Entrevistas', title: 'Explique trade-offs', body: 'Em entrevistas tecnicas, pensar alto e comparar alternativas vale tanto quanto chegar rapido.' },
  { id: 'portfolio', tag: 'Portfolio', title: 'Mostre produtos completos', body: 'Um app pequeno, bonito, testado e publicado comunica mais que dez TODO lists iguais.' },
  { id: 'study', tag: 'Estudo', title: 'Estude em ciclos jogaveis', body: 'Aprenda conceito, pratique em desafio curto, revise erro e publique um mini projeto.' }
];
