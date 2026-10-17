import { NextResponse } from "next/server";
import { getOAuthPublicConfig } from "@/lib/gmail/client";

export async function GET() {
  const { redirectUri, clientIdSuffix } = getOAuthPublicConfig();
  return NextResponse.json({
    redirectUri,
    clientIdSuffix,
    hint: "Add redirectUri under Google Cloud → Credentials → your Web OAuth client → Authorized redirect URIs (must match character-for-character).",
  });
}
