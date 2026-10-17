import { NextRequest, NextResponse } from "next/server";
import { createReplyDraft } from "@/lib/gmail/create-draft";
import { getGmailSession, setGmailSession } from "@/lib/gmail/session";
import type { Email } from "@/lib/types";

export async function POST(request: NextRequest) {
  const session = await getGmailSession();
  if (!session) {
    return NextResponse.json({ error: "Not connected to Gmail" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { email?: Email; draft?: string };
    if (!body.email?.id || !body.email.sender?.email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }
    if (!body.draft?.trim()) {
      return NextResponse.json({ error: "draft text is required" }, { status: 400 });
    }

    const result = await createReplyDraft(session, body.email, body.draft);
    await setGmailSession(session);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create Gmail draft";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
