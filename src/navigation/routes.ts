import { Stage } from '../types/game';
import { AiTutorContext } from '../types/aiTutor';

export type AppRoute =
  | { name: 'home' }
  | { name: 'login' }
  | { name: 'register' }
  | { name: 'account' }
  | { name: 'premium' }
  | { name: 'dailyReward' }
  | { name: 'achievements' }
  | { name: 'academy' }
  | { name: 'lesson'; lessonId: string }
  | { name: 'codeArena' }
  | { name: 'codeChallenge'; challengeId: string; challengeIds?: string[] }
  | { name: 'codeLab'; initialConcept?: string }
  | { name: 'codeLabChallenge'; challengeId: string; returnTo?: AppRoute }
  | { name: 'map' }
  | { name: 'quiz'; stage: Stage }
  | { name: 'profile' }
  | { name: 'professorByte'; initialPrompt?: string; context?: AiTutorContext; returnTo?: AppRoute }
  | { name: 'ranking' }
  | { name: 'shop' }
  | { name: 'settings' }
  | { name: 'feedback' }
  | { name: 'career' }
  | { name: 'campaign' }
  | { name: 'reviewLab' };

export type Navigate = (route: AppRoute) => void;
