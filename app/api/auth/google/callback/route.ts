import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { ensureUser } from "@/lib/db/queries";
import { exchangeCodeForSession } from "@/lib/gmail/client";
import { setGmailSession } from "@/lib/gmail/session";

const STATE_COOKIE = "google_oauth_state";

export async function GET(request: NextRequest) {
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(oauthError)}`, origin));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/?error=missing_oauth_code", origin));
  }

  const jar = await cookies();
  const expectedState = jar.get(STATE_COOKIE)?.value;
  jar.delete(STATE_COOKIE);

  if (!expectedState || expectedState !== state) {
    return NextResponse.redirect(new URL("/?error=invalid_oauth_state", origin));
  }

  try {
    const session = await exchangeCodeForSession(code);
    await ensureUser(session.email);
    await setGmailSession(session);
    return NextResponse.redirect(new URL("/?connected=1", origin));
  } catch (error) {
    const message = error instanceof Error ? error.message : "oauth_callback_failed";
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(message)}`, origin));
  }
}
