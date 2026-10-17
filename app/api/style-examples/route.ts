import { NextRequest, NextResponse } from "next/server";
import { deleteStyleExample, ensureUser, insertStyleExample, listStyleExamples } from "@/lib/db/queries";
import { getGmailSession } from "@/lib/gmail/session";

async function requireEmail() {
  const session = await getGmailSession();
  if (!session) return { error: NextResponse.json({ error: "Not connected to Gmail" }, { status: 401 }) };
  await ensureUser(session.email);
  return { email: session.email };
}

export async function GET() {
  const auth = await requireEmail();
  if ("error" in auth) return auth.error;
  return NextResponse.json({ examples: await listStyleExamples(auth.email) });
}

export async function POST(request: NextRequest) {
  const auth = await requireEmail();
  if ("error" in auth) return auth.error;

  const body = (await request.json()) as { text?: string };
  const text = body.text?.trim();
  if (!text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const example = await insertStyleExample(auth.email, text);
  return NextResponse.json({ example }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireEmail();
  if ("error" in auth) return auth.error;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const removed = await deleteStyleExample(auth.email, id);
  if (!removed) {
    return NextResponse.json({ error: "Example not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
