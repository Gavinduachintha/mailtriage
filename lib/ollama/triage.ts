import type { Email, EmailAnalysis, EmailCategory, StyleExample } from "@/lib/types";
import { ollamaChat } from "./client";

export const TRIAGE_JSON_SCHEMA = {
  type: "object",
  properties: {
    category: {
      type: "string",
      enum: ["urgent", "waiting", "invoice", "lead", "low"],
    },
    priority: { type: "integer", minimum: 1, maximum: 10 },
    summary: { type: "string" },
    suggestedAction: { type: "string" },
    draft: { type: "string" },
  },
  required: ["category", "priority", "summary", "suggestedAction", "draft"],
} as const;

const CATEGORIES = new Set<EmailCategory>(["urgent", "waiting", "invoice", "lead", "low"]);

function extractJson(raw: string): unknown {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    /* continue */
  }

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return JSON.parse(fenced[1].trim());
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return JSON.parse(trimmed.slice(start, end + 1));
  }

  throw new Error("Model response was not valid JSON");
}

function clampPriority(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 5;
  return Math.min(10, Math.max(1, Math.round(n)));
}

function normalizeCategory(value: unknown): EmailCategory {
  if (typeof value === "string" && CATEGORIES.has(value as EmailCategory)) {
    return value as EmailCategory;
  }
  const lower = String(value ?? "").toLowerCase();
  if (lower.includes("urgent") || lower.includes("asap")) return "urgent";
  if (lower.includes("wait")) return "waiting";
  if (lower.includes("invoice") || lower.includes("payment") || lower.includes("bill")) return "invoice";
  if (lower.includes("lead") || lower.includes("inquiry") || lower.includes("enquiry")) return "lead";
  return "low";
}

export function parseTriageResponse(raw: string): EmailAnalysis {
  const parsed = extractJson(raw) as Record<string, unknown>;
  return {
    category: normalizeCategory(parsed.category),
    priority: clampPriority(parsed.priority),
    summary: String(parsed.summary ?? "").trim() || "No summary generated.",
    suggestedAction: String(parsed.suggestedAction ?? "").trim() || "Review and reply when ready.",
    draft: String(parsed.draft ?? "").trim(),
  };
}

function buildSystemPrompt(styleExamples: StyleExample[]) {
  const styleBlock =
    styleExamples.length > 0
      ? `\nMatch the user's writing style using these past replies as examples:\n${styleExamples
          .slice(0, 5)
          .map((ex, i) => `--- Example ${i + 1} ---\n${ex.text}`)
          .join("\n")}\n`
      : `\nWrite drafts in a clear, professional, concise freelancer tone. Sign as the user would typically sign (first name only is fine if unknown).\n`;

  return `You are MailTriage, a local email triage assistant for freelancers.
Analyze client emails and return ONLY a JSON object (no markdown) with:
- category: one of urgent | waiting | invoice | lead | low
- priority: integer 1-10 (10 = most urgent)
- summary: one sentence
- suggestedAction: one short concrete next step
- draft: a ready-to-send reply (empty string if no reply is needed, e.g. newsletters)

Category guide:
- urgent: blockers, outages, deadlines today, angry clients
- waiting: ball is in the client's court; little/no action needed now
- invoice: payments, invoices, billing
- lead: new project inquiries / sales opportunities
- low: newsletters, FYI, noise
${styleBlock}`;
}

function buildUserPrompt(email: Email) {
  const body = email.body.slice(0, 6000);
  return `From: ${email.sender.name} <${email.sender.email}>
Subject: ${email.subject}

${body}`;
}

export async function triageEmailWithOllama(
  email: Email,
  styleExamples: StyleExample[] = [],
): Promise<EmailAnalysis> {
  const raw = await ollamaChat({
    messages: [
      { role: "system", content: buildSystemPrompt(styleExamples) },
      { role: "user", content: buildUserPrompt(email) },
    ],
    format: TRIAGE_JSON_SCHEMA as unknown as Record<string, unknown>,
    temperature: 0.2,
  });

  try {
    return parseTriageResponse(raw);
  } catch {
    // One repair pass if schema enforcement still produced messy output
    const repair = await ollamaChat({
      messages: [
        {
          role: "system",
          content:
            "Fix the following into valid JSON matching keys category, priority, summary, suggestedAction, draft. Return JSON only.",
        },
        { role: "user", content: raw },
      ],
      format: TRIAGE_JSON_SCHEMA as unknown as Record<string, unknown>,
      temperature: 0,
    });
    return parseTriageResponse(repair);
  }
}
