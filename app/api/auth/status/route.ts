import { NextResponse } from "next/server";
import { getGmailSession } from "@/lib/gmail/session";

export async function GET() {
  const session = await getGmailSession();
  if (!session) {
    return NextResponse.json({ connected: false, email: null });
  }
  return NextResponse.json({ connected: true, email: session.email });
}
