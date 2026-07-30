import { ShopItem } from '../types/game';

export const shopItems: ShopItem[] = [
  { id: 'avatar-cq', title: 'Explorer CQ', description: 'Avatar inicial da academia.', price: 0, category: 'avatar', preview: 'CQ' },
  { id: 'avatar-js', title: 'JS Spark', description: 'Visual amarelo para mestres da web.', price: 180, category: 'avatar', preview: 'JS' },
  { id: 'avatar-py', title: 'Py Sage', description: 'Avatar azul para solucionadores calmos.', price: 180, category: 'avatar', preview: 'PY' },
  { id: 'avatar-api', title: 'API Ranger', description: 'Para quem protege endpoints.', price: 260, category: 'avatar', preview: 'API' },
  { id: 'theme-default', title: 'Tema Neon Academy', description: 'Tema escuro padrão.', price: 0, category: 'theme', preview: 'Dark' },
  { id: 'theme-focus', title: 'Tema Focus Light', description: 'Tema claro para estudo diurno.', price: 220, category: 'theme', preview: 'Light' },
  { id: 'boost-xp', title: 'Boost de XP', description: 'Multiplicador temporário conquistado com moedas do jogo.', price: 350, category: 'boost', preview: '2x' }
];
