// Legacy filename retained to avoid a broad persistence/type migration.
// No payment, plan, subscription or IAP types are exposed in this release.
export type OnboardingGoal = 'zero' | 'practice' | 'interview' | 'career';
export type InitialTrack = 'frontend' | 'backend' | 'mobile' | 'fullstack' | 'career';

export interface OnboardingState {
  completed: boolean;
  goal?: OnboardingGoal;
  initialTrack?: InitialTrack;
  avatar?: string;
  completedAt?: string;
}
