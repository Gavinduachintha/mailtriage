import type { GmailSession } from "./session";
import type { GoogleTokenResponse, GoogleUserInfo } from "./types";

const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.compose",
];
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";
const GMAIL_BASE = "https://gmail.googleapis.com/gmail/v1";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

function oauthConfig() {
  const redirectUri = (
    process.env.GOOGLE_REDIRECT_URI ?? "http://localhost:3000/api/auth/google/callback"
  ).trim();

  return {
    clientId: requireEnv("GOOGLE_CLIENT_ID").trim(),
    clientSecret: requireEnv("GOOGLE_CLIENT_SECRET").trim(),
    redirectUri,
  };
}

/** Shown in /api/auth/config so you can match Google Cloud redirect URIs exactly. */
export function getOAuthPublicConfig() {
  const { redirectUri } = oauthConfig();
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim() ?? "";
  return {
    redirectUri,
    clientIdSuffix: clientId ? clientId.slice(-20) : null,
  };
}

export function getGmailApiKey() {
  return process.env.GMAIL_API_KEY ?? process.env.GOOGLE_API_KEY;
}

export function getAuthUrl(state: string) {
  const { clientId, redirectUri } = oauthConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope: [...GMAIL_SCOPES, "openid", "email", "profile"].join(" "),
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

async function parseTokenResponse(res: Response): Promise<GoogleTokenResponse> {
  const data = (await res.json()) as GoogleTokenResponse;
  if (!res.ok) {
    throw new Error(data.error_description ?? data.error ?? "Token request failed");
  }
  return data;
}

export async function exchangeCodeForSession(code: string): Promise<GmailSession> {
  const { clientId, clientSecret, redirectUri } = oauthConfig();
  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const tokenRes = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const tokens = await parseTokenResponse(tokenRes);

  if (!tokens.access_token || !tokens.refresh_token) {
    throw new Error("Google did not return access and refresh tokens. Try disconnecting and connecting again.");
  }

  const profileRes = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!profileRes.ok) throw new Error("Failed to load Google profile");
  const profile = (await profileRes.json()) as GoogleUserInfo;

  const expiresInMs = (tokens.expires_in ?? 3600) * 1000;

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiryDate: Date.now() + expiresInMs,
    email: profile.email ?? "unknown@gmail.com",
  };
}

export async function ensureFreshAccessToken(session: GmailSession): Promise<void> {
  if (Date.now() < session.expiryDate - 60_000) return;

  const { clientId, clientSecret } = oauthConfig();
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: session.refreshToken,
    grant_type: "refresh_token",
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const tokens = await parseTokenResponse(res);
  if (!tokens.access_token) throw new Error("Failed to refresh access token");

  session.accessToken = tokens.access_token;
  session.expiryDate = Date.now() + (tokens.expires_in ?? 3600) * 1000;
}

function apiKeyQuery() {
  const key = getGmailApiKey();
  return key ? `&key=${encodeURIComponent(key)}` : "";
}

async function gmailRequest<T>(
  session: GmailSession,
  path: string,
  init?: { method?: string; body?: unknown },
): Promise<T> {
  await ensureFreshAccessToken(session);

  const url = `${GMAIL_BASE}${path}${path.includes("?") ? "&" : "?"}alt=json${apiKeyQuery()}`;
  const res = await fetch(url, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
    body: init?.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    let message = `Gmail API error (${res.status})`;
    try {
      const err = (await res.json()) as { error?: { message?: string } };
      if (err.error?.message) message = err.error.message;
    } catch {
      /* ignore */
    }
    if (res.status === 403 && message.toLowerCase().includes("insufficient")) {
      message =
        "Gmail permission missing. Disconnect Gmail and connect again to grant draft access.";
    }
    throw new Error(message);
  }

  return (await res.json()) as T;
}

export async function gmailFetch<T>(session: GmailSession, path: string): Promise<T> {
  return gmailRequest<T>(session, path);
}

export async function gmailPost<T>(session: GmailSession, path: string, body: unknown): Promise<T> {
  return gmailRequest<T>(session, path, { method: "POST", body });
}
