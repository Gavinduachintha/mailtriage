import type { Email } from "@/lib/types";
import { gmailFetch } from "./client";
import { gmailMessageToEmail } from "./parse-message";
import type { GmailSession } from "./session";
import type { GmailListResponse, GmailMessage } from "./types";

export async function fetchRecentEmails(session: GmailSession, maxResults = 25): Promise<Email[]> {
  const list = await gmailFetch<GmailListResponse>(
    session,
    `/users/me/messages?labelIds=INBOX&maxResults=${maxResults}`,
  );

  const ids = list.messages?.map((m) => m.id).filter(Boolean) as string[] | undefined;
  if (!ids?.length) return [];

  const details = await Promise.all(
    ids.map((id) => gmailFetch<GmailMessage>(session, `/users/me/messages/${id}?format=full`)),
  );

  return details
    .map((message) => gmailMessageToEmail(message))
    .filter((email): email is Email => email !== null)
    .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
}
