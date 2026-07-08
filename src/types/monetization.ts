export type PremiumPlanId = 'free' | 'premium';
export type OnboardingGoal = 'zero' | 'practice' | 'interview' | 'career';
export type InitialTrack = 'frontend' | 'backend' | 'mobile' | 'fullstack' | 'career';

export interface PremiumPlan {
  id: PremiumPlanId;
  title: string;
  priceLabel: string;
  description: string;
  benefits: string[];
  highlighted?: boolean;
}

export interface OnboardingState {
  completed: boolean;
  version?: number;
  goal?: OnboardingGoal;
  initialTrack?: InitialTrack;
  avatar?: string;
  completedAt?: string;
}
