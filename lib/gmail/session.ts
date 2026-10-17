import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const GMAIL_SESSION_COOKIE = "inboxguard_gmail_session";

export interface GmailSession {
  accessToken: string;
  refreshToken: string;
  expiryDate: number;
  email: string;
}

function sessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set");
  }
  return secret;
}

function sign(value: string) {
  return createHmac("sha256", sessionSecret()).update(value).digest("base64url");
}

export async function setGmailSession(session: GmailSession) {
  const payload = Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
  const signature = sign(payload);
  const jar = await cookies();
  jar.set(GMAIL_SESSION_COOKIE, `${payload}.${signature}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getGmailSession(): Promise<GmailSession | null> {
  const jar = await cookies();
  const raw = jar.get(GMAIL_SESSION_COOKIE)?.value;
  if (!raw) return null;

  const [payload, signature] = raw.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as GmailSession;
  } catch {
    return null;
  }
}

export async function clearGmailSession() {
  const jar = await cookies();
  jar.delete(GMAIL_SESSION_COOKIE);
}
