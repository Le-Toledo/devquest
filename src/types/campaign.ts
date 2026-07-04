import { AreaId, QuestionKind } from './game';
import { IconName } from './ui';

export type CampaignTrack = 'frontend' | 'backend' | 'mobile-kotlin' | 'mobile-react-native' | 'fullstack';
export type CampaignMissionType = QuestionKind | 'battle' | 'boss';
export type CampaignStatus = 'locked' | 'unlocked' | 'completed';

export interface Character {
  id: string;
  name: string;
  avatar: string;
  role: 'mentor' | 'boss' | 'rival' | 'bug' | 'master';
  color: string;
  personality?: string;
  description?: string;
  catchphrase?: string;
}

export interface Dialogue {
  id: string;
  characterId: string;
  text: string;
  mood?: 'calm' | 'happy' | 'warning' | 'victory';
}

export interface DialogueSequence {
  id: string;
  dialogues: Dialogue[];
}

export interface CampaignBoss {
  id: string;
  chapterId: string;
  name: string;
  description: string;
  characterId: string;
  health: number;
  attack: number;
  weakness: string;
  introDialogueId: string;
  winDialogueId: string;
  loseDialogueId: string;
  rewardXp: number;
  rewardCoins: number;
}

export interface CampaignMission {
  id: string;
  chapterId: string;
  title: string;
  description: string;
  concept: string;
  areaId?: AreaId;
  type: CampaignMissionType;
  beforeDialogueId: string;
  afterDialogueId: string;
  rewardXp: number;
  rewardCoins: number;
  requiredMissionId?: string;
  highlightedTracks?: CampaignTrack[];
}

export interface CampaignChapter {
  id: string;
  order: number;
  title: string;
  description: string;
  icon: IconName;
  visualTheme: string;
  requiredChapterId?: string;
  bossId: string;
}

export interface WrongCampaignQuestion {
  missionId: string;
  prompt: string;
  hint: string;
  savedAt: string;
}

export interface CampaignProgress {
  introSeen: boolean;
  selectedTrack?: CampaignTrack;
  unlockedChapterIds: string[];
  completedMissionIds: string[];
  defeatedBossIds: string[];
  seenDialogueIds: string[];
  collectedRewardIds: string[];
  wrongQuestions: WrongCampaignQuestion[];
}
