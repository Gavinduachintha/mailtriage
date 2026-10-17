export function getOllamaBaseUrl() {
  return (process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434").replace(/\/$/, "");
}

export function getOllamaModel() {
  return (process.env.OLLAMA_MODEL ?? "gemma3").trim();
}
