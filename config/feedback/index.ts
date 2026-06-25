export type FeedbackCategory =
  | "general"
  | "source_request"
  | "feature_request"
  | "bug_report"
  | "praise"
  | "commercial_suggestion";

export type FeedbackStatus = "new" | "reviewed" | "actioned" | "archived";

export type Feedback = {
  id: string;
  verticalId: string;
  category: FeedbackCategory;
  rating: number | null;
  message: string;
  email?: string;
  status: FeedbackStatus;
  createdAt: string;
};

export const feedbackCategoryLabels: Record<FeedbackCategory, string> = {
  general: "General",
  source_request: "Source request",
  feature_request: "Feature request",
  bug_report: "Bug report",
  praise: "Praise",
  commercial_suggestion: "Commercial suggestion",
};

export const feedbackStatusLabels: Record<FeedbackStatus, string> = {
  new: "New",
  reviewed: "Reviewed",
  actioned: "Actioned",
  archived: "Archived",
};

export const feedback: Feedback[] = [
  {
    id: "fb-my3d-001",
    verticalId: "my3dprintnews",
    category: "source_request",
    rating: 4,
    message: "Please add more resin printing sources and creator videos.",
    email: "reader@example.com",
    status: "new",
    createdAt: "2026-06-24T09:15:00.000Z",
  },
  {
    id: "fb-my3d-002",
    verticalId: "my3dprintnews",
    category: "praise",
    rating: 5,
    message: "Focus Mode is really useful for checking Prusa stories quickly.",
    status: "reviewed",
    createdAt: "2026-06-23T14:20:00.000Z",
  },
  {
    id: "fb-my3d-003",
    verticalId: "my3dprintnews",
    category: "feature_request",
    rating: 4,
    message: "A saved search for materials news would be helpful.",
    email: "maker@example.com",
    status: "actioned",
    createdAt: "2026-06-22T16:45:00.000Z",
  },
  {
    id: "fb-bmx-001",
    verticalId: "mybmxnews",
    category: "general",
    rating: 4,
    message: "Would like regional event coverage when the BMX vertical launches.",
    status: "new",
    createdAt: "2026-06-24T11:30:00.000Z",
  },
  {
    id: "fb-bmx-002",
    verticalId: "mybmxnews",
    category: "commercial_suggestion",
    rating: 3,
    message: "Local retailers may want weekly product placement options.",
    email: "partner@example.com",
    status: "reviewed",
    createdAt: "2026-06-21T10:05:00.000Z",
  },
  {
    id: "fb-bmx-003",
    verticalId: "mybmxnews",
    category: "bug_report",
    rating: 2,
    message: "Prototype source cards should explain coming soon status more clearly.",
    status: "new",
    createdAt: "2026-06-20T13:55:00.000Z",
  },
];

export function feedbackForVertical(verticalId: string): Feedback[] {
  return feedback.filter((item) => item.verticalId === verticalId);
}

export function feedbackCountByCategory(
  items: Feedback[],
  category: FeedbackCategory,
): number {
  return items.filter((item) => item.category === category).length;
}

export function averageFeedbackRating(items: Feedback[]): string {
  const ratedItems = items.filter((item) => typeof item.rating === "number");

  if (!ratedItems.length) {
    return "No score";
  }

  const total = ratedItems.reduce((sum, item) => sum + (item.rating ?? 0), 0);

  return `${(total / ratedItems.length).toFixed(1)}/5`;
}
