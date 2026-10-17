import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/gmail/client";

const STATE_COOKIE = "google_oauth_state";

export async function GET() {
  try {
    const state = randomBytes(16).toString("hex");
    const jar = await cookies();
    jar.set(STATE_COOKIE, state, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 600,
    });

    const url = getAuthUrl(state);
    return NextResponse.redirect(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : "OAuth setup failed";
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(message)}`, process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
  }
}
