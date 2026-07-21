import { AppRoute } from '../navigation/routes';
import { AcademyProgress } from './academy';
import { CodeArenaProgress } from './codeArena';
import { CodeLabChallenge, CodeLabProgress } from './codeLab';
import { AdaptiveLearningState } from './adaptiveLearning';
import { PlayerProfile, Stage } from './game';
import { ReviewError, ReviewStats } from './review';

export type JourneyRecommendationKind = 'review' | 'academy' | 'arena' | 'codeLab' | 'campaign' | 'fallback';

export interface JourneyRecommendation {
  id: string;
  kind: JourneyRecommendationKind;
  title: string;
  subtitle: string;
  motivation: string;
  route: AppRoute;
  priority: number;
  reason: string;
  concept?: string;
  sourceId?: string;
}

export interface JourneyRecommendationInput {
  player: PlayerProfile;
  academyProgress?: Partial<AcademyProgress> | null;
  codeArenaProgress?: Partial<CodeArenaProgress> | null;
  codeLabProgress?: Partial<CodeLabProgress> | null;
  reviewErrors?: ReviewError[];
  reviewStats?: ReviewStats;
  adaptiveLearning?: Partial<AdaptiveLearningState> | null;
}

export interface JourneyRecommendationResult {
  primary: JourneyRecommendation;
  pendingReview?: JourneyRecommendation;
  nextLesson?: JourneyRecommendation;
  relatedArena?: JourneyRecommendation;
  relatedCodeLab?: JourneyRecommendation & { challenge?: CodeLabChallenge };
  campaign?: JourneyRecommendation & { stage?: Stage };
  fallback: JourneyRecommendation;
}

export type JourneyNavigationInput = Partial<Omit<JourneyRecommendation, 'kind'>> & {
  kind?: string;
};
