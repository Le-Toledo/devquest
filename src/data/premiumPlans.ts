import { PremiumPlan } from '../types/monetization';

export const premiumPlans: PremiumPlan[] = [
  {
    id: 'free',
    title: 'Plano Free',
    priceLabel: 'R$ 0',
    description: 'Ideal para começar a aprender programação jogando.',
    benefits: ['Campanha inicial', 'Quizzes essenciais', 'Academia Dev base', 'Laboratório de Revisão', 'Loja com itens gratuitos']
  },
  {
    id: 'premium',
    title: 'CodeQuest Premium',
    priceLabel: 'Futuro',
    description: 'Estrutura visual pronta para monetização real sem ativar pagamentos agora.',
    highlighted: true,
    benefits: ['Mais campanhas', 'Mais desafios', 'Mais aulas', 'Avatares exclusivos', 'Temas exclusivos', 'Revisão avançada', 'Sem anúncios futuramente']
  }
];

export const premiumCatalog = [
  { title: 'Skins premium', description: 'Avatares raros para campanhas e ranking.' },
  { title: 'Temas premium', description: 'Paletas visuais para personalizar a academia.' },
  { title: 'Pacotes de desafios', description: 'Arenas extras de Java, Kotlin, SQL e entrevistas.' },
  { title: 'Revisão avançada', description: 'Mais filtros, metas e plano de estudo personalizado.' }
];
