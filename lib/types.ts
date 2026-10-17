export type EmailCategory =
  | "urgent"
  | "waiting"
  | "invoice"
  | "lead"
  | "low";

export type CategoryFilter = EmailCategory | "all";

export type PriorityLevel = "high" | "medium" | "low";

export interface EmailAnalysis {
  category: EmailCategory;
  /** 1 (lowest) to 10 (highest) */
  priority: number;
  summary: string;
  suggestedAction: string;
  draft: string;
}

export interface Email {
  id: string;
  threadId?: string;
  messageIdHeader?: string;
  sender: { name: string; email: string };
  subject: string;
  preview: string;
  body: string;
  receivedAt: string;
  unread: boolean;
  analysis?: EmailAnalysis;
}

export interface StyleExample {
  id: string;
  text: string;
  createdAt: string;
}

export const CATEGORY_META: Record<
  EmailCategory,
  { label: string; badge: string; dot: string }
> = {
  // Badges are neutral; category colour is carried only by the small dot.
  urgent: { label: "Urgent", badge: "", dot: "bg-red-600" },
  waiting: { label: "Waiting on Client", badge: "", dot: "bg-amber-600" },
  invoice: { label: "Invoice / Payment", badge: "", dot: "bg-emerald-700" },
  lead: { label: "New Lead", badge: "", dot: "bg-sky-700" },
  low: { label: "Low Priority", badge: "", dot: "bg-stone-400" },
};

export function priorityLevel(score: number): PriorityLevel {
  if (score >= 8) return "high";
  if (score >= 5) return "medium";
  return "low";
}
