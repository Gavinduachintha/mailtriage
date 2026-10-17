import { getOllamaBaseUrl, getOllamaModel } from "./config";

export interface OllamaChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OllamaChatResponse {
  model?: string;
  message?: { role?: string; content?: string };
  error?: string;
}

export async function ollamaChat(options: {
  messages: OllamaChatMessage[];
  format?: "json" | Record<string, unknown>;
  temperature?: number;
  model?: string;
}): Promise<string> {
  const base = getOllamaBaseUrl();
  const model = options.model ?? getOllamaModel();

  let res: Response;
  try {
    res = await fetch(`${base}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: options.messages,
        stream: false,
        format: options.format ?? "json",
        options: {
          temperature: options.temperature ?? 0.2,
        },
      }),
      cache: "no-store",
    });
  } catch {
    throw new Error(
      `Cannot reach Ollama at ${base}. Is it running? Try: ollama serve && ollama pull ${model}`,
    );
  }

  const data = (await res.json()) as OllamaChatResponse;
  if (!res.ok) {
    throw new Error(data.error ?? `Ollama chat failed (${res.status})`);
  }

  const content = data.message?.content?.trim();
  if (!content) {
    throw new Error("Ollama returned an empty response");
  }
  return content;
}

export async function getOllamaStatus() {
  const base = getOllamaBaseUrl();
  const model = getOllamaModel();

  try {
    const res = await fetch(`${base}/api/tags`, { cache: "no-store" });
    if (!res.ok) {
      return { online: false, model, baseUrl: base, hasModel: false };
    }
    const data = (await res.json()) as { models?: { name?: string }[] };
    const names = data.models?.map((m) => m.name ?? "") ?? [];
    const hasModel = names.some(
      (name) => name === model || name.startsWith(`${model}:`) || name.startsWith(`${model}-`),
    );
    return { online: true, model, baseUrl: base, hasModel, models: names };
  } catch {
    return { online: false, model, baseUrl: base, hasModel: false };
  }
}
