import { NextResponse } from "next/server";
import { ensureUser, listAnalyses } from "@/lib/db/queries";
import { fetchRecentEmails } from "@/lib/gmail/fetch-emails";
import { getGmailSession, setGmailSession } from "@/lib/gmail/session";

export async function GET() {
  const session = await getGmailSession();
  if (!session) {
    return NextResponse.json({ error: "Not connected to Gmail" }, { status: 401 });
  }

  try {
    const emails = await fetchRecentEmails(session);
    await setGmailSession(session);
    await ensureUser(session.email);
    const analyses = await listAnalyses(session.email);
    return NextResponse.json({
      emails: emails.map((email) => ({
        ...email,
        analysis: analyses.get(email.id) ?? email.analysis,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch Gmail messages";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
