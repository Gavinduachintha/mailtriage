import type { Email } from "@/lib/types";
import type { GmailHeader, GmailMessage, GmailMessagePart } from "./types";

function decodeBase64Url(data: string) {
  const normalized = data.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64").toString("utf8");
}

function header(headers: GmailHeader[] | undefined, name: string) {
  const found = headers?.find((h) => h.name?.toLowerCase() === name.toLowerCase());
  return found?.value ?? "";
}

function parseFrom(raw: string): { name: string; email: string } {
  const match = raw.match(/^(?:"?([^"]*)"?\s)?<?([^>]+@[^>]+)>?$/);
  if (!match) return { name: raw.trim() || "Unknown", email: raw.trim() || "unknown@email.com" };
  const email = match[2]?.trim() ?? raw;
  const name = (match[1]?.trim() || email.split("@")[0] || "Unknown").replace(/^"|"$/g, "");
  return { name, email };
}

function collectPlainText(part?: GmailMessagePart): string {
  if (!part) return "";

  const mime = part.mimeType ?? "";
  if ((mime === "text/plain" || mime === "text/html") && part.body?.data) {
    const text = decodeBase64Url(part.body.data);
    if (mime === "text/html") {
      return text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    }
    return text;
  }

  if (part.parts?.length) {
    const plain = part.parts.map(collectPlainText).filter(Boolean);
    const textPlain = plain.find((t) => !t.includes("<html"));
    return textPlain ?? plain[0] ?? "";
  }

  return "";
}

export function gmailMessageToEmail(message: GmailMessage): Email | null {
  if (!message.id || !message.payload) return null;

  const fromRaw = header(message.payload.headers, "From");
  const subject = header(message.payload.headers, "Subject") || "(No subject)";
  const body = collectPlainText(message.payload) || message.snippet || "";
  const preview = (message.snippet ?? body).slice(0, 160);
  const internalDate = message.internalDate ? Number(message.internalDate) : Date.now();

  return {
    id: message.id,
    threadId: message.threadId,
    messageIdHeader: header(message.payload.headers, "Message-ID") || undefined,
    sender: parseFrom(fromRaw),
    subject,
    preview,
    body: body.trim() || preview,
    receivedAt: new Date(internalDate).toISOString(),
    unread: message.labelIds?.includes("UNREAD") ?? false,
  };
}
