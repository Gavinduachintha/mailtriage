import { NextResponse } from "next/server";
import { getOllamaStatus } from "@/lib/ollama/client";

export async function GET() {
  const status = await getOllamaStatus();
  return NextResponse.json(status);
}
