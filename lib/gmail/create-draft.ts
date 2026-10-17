import type { Email } from "@/lib/types";
import { gmailFetch, gmailPost } from "./client";
import type { GmailSession } from "./session";
import type { GmailHeader, GmailMessage } from "./types";

function encodeRfc2047(value: string) {
  if (/^[\x20-\x7E]*$/.test(value)) return value;
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function replySubject(subject: string) {
  return /^re:/i.test(subject.trim()) ? subject.trim() : `Re: ${subject.trim()}`;
}

function buildMimeMessage(options: {
  from: string;
  to: string;
  subject: string;
  body: string;
  inReplyTo?: string;
  references?: string;
}) {
  const lines = [
    `From: ${options.from}`,
    `To: ${options.to}`,
    `Subject: ${encodeRfc2047(options.subject)}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 7bit",
  ];

  if (options.inReplyTo) lines.push(`In-Reply-To: ${options.inReplyTo}`);
  if (options.references) lines.push(`References: ${options.references}`);

  return `${lines.join("\r\n")}\r\n\r\n${options.body.replace(/\r?\n/g, "\r\n")}`;
}

function header(headers: GmailHeader[] | undefined, name: string) {
  return headers?.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? "";
}

export async function createReplyDraft(
  session: GmailSession,
  email: Email,
  draftBody: string,
): Promise<{ draftId: string; messageId: string; threadId?: string; draftsUrl: string }> {
  const text = draftBody.trim();
  if (!text) throw new Error("Draft is empty");

  let threadId = email.threadId;
  let messageIdHeader = email.messageIdHeader;

  if (!threadId || !messageIdHeader) {
    const original = await gmailFetch<GmailMessage>(
      session,
      `/users/me/messages/${encodeURIComponent(email.id)}?format=metadata&metadataHeaders=Message-ID`,
    );
    threadId = threadId ?? original.threadId;
    messageIdHeader =
      messageIdHeader ?? (header(original.payload?.headers, "Message-ID") || undefined);
  }

  const mime = buildMimeMessage({
    from: session.email,
    to: `${email.sender.name} <${email.sender.email}>`,
    subject: replySubject(email.subject),
    body: text,
    inReplyTo: messageIdHeader,
    references: messageIdHeader,
  });

  const created = await gmailPost<{
    id?: string;
    message?: { id?: string; threadId?: string };
  }>(session, "/users/me/drafts", {
    message: {
      raw: toBase64Url(mime),
      threadId,
    },
  });

  if (!created.id || !created.message?.id) {
    throw new Error("Gmail did not return a draft id");
  }

  const thread = created.message.threadId ?? threadId;
  const draftsUrl = thread
    ? `https://mail.google.com/mail/u/0/#drafts/${thread}`
    : "https://mail.google.com/mail/u/0/#drafts";

  return {
    draftId: created.id,
    messageId: created.message.id,
    threadId: thread,
    draftsUrl,
  };
}
