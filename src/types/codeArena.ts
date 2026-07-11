import { AreaId, Difficulty } from './game';

export type CodeChallengeKind = 'complete-code' | 'bug-hunt' | 'order-blocks' | 'best-solution' | 'simulate-output' | 'refactor';
export type CodeChallengeStatus = 'new' | 'completed' | 'review';

export interface CodeChallenge {
  id: string;
  title: string;
  description: string;
  areaId: AreaId;
  language: 'Lógica' | 'JavaScript' | 'TypeScript' | 'Python' | 'Java' | 'Kotlin' | 'C#' | 'SQL' | 'HTML' | 'CSS' | 'React' | 'Node.js' | 'APIs REST' | 'Git' | 'Entrevista';
  concept: string;
  difficulty: Difficulty;
  kind: CodeChallengeKind;
  code: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint: string;
  xpReward: number;
  coinReward: number;
}

export interface CodeArenaProgress {
  completedChallengeIds: string[];
  reviewChallengeIds: string[];
  combo: number;
  medals: string[];
}
