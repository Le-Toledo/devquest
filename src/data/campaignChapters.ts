import { CampaignChapter } from '../types/campaign';

export const campaignChapters: CampaignChapter[] = [
  { id: 'chapter-1', order: 1, title: 'O Primeiro Código', description: 'Lógica, variáveis, condicionais e loops.', icon: 'sparkles', visualTheme: '#49E3B3', bossId: 'boss-syntax' },
  { id: 'chapter-2', order: 2, title: 'Cidade do Front-end', description: 'HTML, CSS, JavaScript e React.', icon: 'color-palette', visualTheme: '#ff8fab', requiredChapterId: 'chapter-1', bossId: 'boss-layout' },
  { id: 'chapter-3', order: 3, title: 'Fortaleza Back-end', description: 'Node.js, APIs REST, SQL e banco de dados.', icon: 'server', visualTheme: '#34d399', requiredChapterId: 'chapter-2', bossId: 'boss-api' },
  { id: 'chapter-4', order: 4, title: 'Academia Mobile', description: 'Java, Kotlin, Android e React Native.', icon: 'phone-portrait', visualTheme: '#8EA7FF', requiredChapterId: 'chapter-3', bossId: 'boss-null' },
  { id: 'chapter-5', order: 5, title: 'Empresa dos Devs', description: 'Git, clean code, testes e arquitetura.', icon: 'business', visualTheme: '#a78bfa', requiredChapterId: 'chapter-4', bossId: 'boss-legacy' },
  { id: 'chapter-6', order: 6, title: 'Entrevista Final', description: 'Carreira, portfólio e desafios mistos.', icon: 'trophy', visualTheme: '#ffd166', requiredChapterId: 'chapter-5', bossId: 'boss-master' }
];
