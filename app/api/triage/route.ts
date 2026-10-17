import { NextRequest, NextResponse } from "next/server";
import { ensureUser, listStyleExamples, saveAnalysis } from "@/lib/db/queries";
import { getGmailSession } from "@/lib/gmail/session";
import { triageEmailWithOllama } from "@/lib/ollama/triage";
import type { Email } from "@/lib/types";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const session = await getGmailSession();
    if (!session) {
      return NextResponse.json({ error: "Not connected to Gmail" }, { status: 401 });
    }

    const body = (await request.json()) as { email?: Email };

    if (!body.email?.id || !body.email.subject || !body.email.body) {
      return NextResponse.json({ error: "email with id, subject, and body is required" }, { status: 400 });
    }

    await ensureUser(session.email);
    const styleExamples = await listStyleExamples(session.email);
    const analysis = await triageEmailWithOllama(body.email, styleExamples);
    await saveAnalysis(session.email, body.email.id, analysis);
    return NextResponse.json({ analysis });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Triage failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
