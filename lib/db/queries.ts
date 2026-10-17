import type { EmailAnalysis, StyleExample } from "@/lib/types";
import { getPool } from "@/lib/db/pool";

const db = () => getPool();

export async function ensureUser(email: string) {
  await db().query("INSERT INTO mailtriage_users (email) VALUES ($1) ON CONFLICT DO NOTHING", [email]);
}

export async function listStyleExamples(userEmail: string): Promise<StyleExample[]> {
  const { rows } = await db().query(
    "SELECT id, text, created_at FROM mailtriage_style_examples WHERE user_email = $1 ORDER BY created_at DESC",
    [userEmail],
  );
  return rows.map((row) => ({
    id: row.id,
    text: row.text,
    createdAt: row.created_at.toISOString(),
  }));
}

export async function insertStyleExample(userEmail: string, text: string): Promise<StyleExample> {
  const { rows } = await db().query(
    "INSERT INTO mailtriage_style_examples (user_email, text) VALUES ($1, $2) RETURNING id, text, created_at",
    [userEmail, text],
  );
  return {
    id: rows[0].id,
    text: rows[0].text,
    createdAt: rows[0].created_at.toISOString(),
  };
}

export async function deleteStyleExample(userEmail: string, id: string) {
  const result = await db().query("DELETE FROM mailtriage_style_examples WHERE id = $1 AND user_email = $2", [
    id,
    userEmail,
  ]);
  return (result.rowCount ?? 0) > 0;
}

export async function listAnalyses(userEmail: string) {
  const { rows } = await db().query(
    "SELECT message_id, category, priority, summary, suggested_action, draft FROM mailtriage_analyses WHERE user_email = $1",
    [userEmail],
  );

  const byId = new Map<string, EmailAnalysis>();
  for (const row of rows) {
    byId.set(row.message_id, {
      category: row.category,
      priority: row.priority,
      summary: row.summary,
      suggestedAction: row.suggested_action,
      draft: row.draft,
    });
  }
  return byId;
}

export async function saveAnalysis(userEmail: string, messageId: string, analysis: EmailAnalysis) {
  const updated = await db().query(
    `UPDATE mailtriage_analyses
     SET category = $3, priority = $4, summary = $5, suggested_action = $6, draft = $7, updated_at = now()
     WHERE user_email = $1 AND message_id = $2`,
    [userEmail, messageId, analysis.category, analysis.priority, analysis.summary, analysis.suggestedAction, analysis.draft],
  );

  if ((updated.rowCount ?? 0) > 0) return;

  await db().query(
    `INSERT INTO mailtriage_analyses (user_email, message_id, category, priority, summary, suggested_action, draft)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [userEmail, messageId, analysis.category, analysis.priority, analysis.summary, analysis.suggestedAction, analysis.draft],
  );
}
