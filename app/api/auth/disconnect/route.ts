import { NextResponse } from "next/server";
import { clearGmailSession } from "@/lib/gmail/session";

export async function POST() {
  await clearGmailSession();
  return NextResponse.json({ ok: true });
}
