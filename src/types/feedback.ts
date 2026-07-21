export type FeedbackPersistedCategory = 'bug' | 'idea' | 'content' | 'ux' | 'other';

export type FeedbackVisualCategory =
  | 'bug_report'
  | 'confusing_content'
  | 'bad_professor_byte_response'
  | 'visual_issue'
  | 'suggestion'
  | 'other';

export type FeedbackSubcategory = 'professor_byte';

export type LocalFeedbackStatus = 'pending';

export type LocalFeedbackMetadata = {
  source: 'feedback_center';
  visualCategory: FeedbackVisualCategory;
};

export interface LocalFeedbackReport {
  id: string;
  category: FeedbackPersistedCategory;
  subcategory?: FeedbackSubcategory;
  message: string;
  screen?: string;
  appVersion?: string;
  platform: string;
  createdAt: string;
  status: LocalFeedbackStatus;
  metadata: LocalFeedbackMetadata;
  schemaVersion: 1;
}

export type SaveLocalFeedbackInput = {
  visualCategory: FeedbackVisualCategory;
  message: string;
  screen?: string;
  appVersion?: string;
  platform: string;
};

export type FeedbackCategoryMapping = {
  category: FeedbackPersistedCategory;
  subcategory?: FeedbackSubcategory;
};
