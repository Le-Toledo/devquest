import { PremiumPlan } from '../types/monetization';

export const premiumPlans: PremiumPlan[] = [
  {
    id: 'free',
    title: 'Plano Free',
    priceLabel: 'R$ 0',
    description: 'Ideal para comecar a aprender programacao jogando.',
    benefits: ['Campanha inicial', 'Quizzes essenciais', 'Academia Dev base', 'Laboratorio de Revisao', 'Loja com itens gratuitos']
  },
  {
    id: 'premium',
    title: 'CodeQuest Premium',
    priceLabel: 'Futuro',
    description: 'Estrutura visual pronta para monetizacao real sem ativar pagamentos agora.',
    highlighted: true,
    benefits: ['Mais campanhas', 'Mais desafios', 'Mais aulas', 'Avatares exclusivos', 'Temas exclusivos', 'Revisao avancada', 'Sem anuncios futuramente']
  }
];

export const premiumCatalog = [
  { title: 'Skins premium', description: 'Avatares raros para campanhas e ranking.' },
  { title: 'Temas premium', description: 'Paletas visuais para personalizar a academia.' },
  { title: 'Pacotes de desafios', description: 'Arenas extras de Java, Kotlin, SQL e entrevistas.' },
  { title: 'Revisao avancada', description: 'Mais filtros, metas e plano de estudo personalizado.' }
];
