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
  urgent: {
    label: "Urgent",
    badge: "bg-red-500/10 text-red-600 ring-red-500/20 dark:text-red-400",
    dot: "bg-red-500",
  },
  waiting: {
    label: "Waiting on Client",
    badge: "bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  invoice: {
    label: "Invoice / Payment",
    badge: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  lead: {
    label: "New Lead",
    badge: "bg-blue-500/10 text-blue-700 ring-blue-500/20 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  low: {
    label: "Low Priority",
    badge: "bg-zinc-500/10 text-zinc-600 ring-zinc-500/20 dark:text-zinc-400",
    dot: "bg-zinc-400",
  },
};

export function priorityLevel(score: number): PriorityLevel {
  if (score >= 8) return "high";
  if (score >= 5) return "medium";
  return "low";
}
