import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import type {
  MemeGenerationRequest,
  MemeGenerationResponse,
} from "@/types/api";

const apiBaseUrl = process.env.API_BASE_URL;

export async function POST(request: Request) {
  if (!apiBaseUrl) {
    return NextResponse.json(
      {
        error: "configuration_error",
        message: "API_BASE_URL is not configured.",
      },
      { status: 500 },
    );
  }

  let payload: MemeGenerationRequest;
  try {
    payload = (await request.json()) as MemeGenerationRequest;
  } catch (error) {
    return NextResponse.json(
      {
        error: "invalid_json",
        message: "Request body must be valid JSON.",
        details: String(error),
      },
      { status: 400 },
    );
  }

  const session = await auth();
  const userID = session?.user?.id;
  const userEmail = session?.user?.email;
  const userName = session?.user?.name;
  const userAvatar = session?.user?.image;

  const upstreamPayload: MemeGenerationRequest = {
    context_type: payload.context_type ?? "text",
    text_snippet: payload.text_snippet,
    image_base64: payload.image_base64,
    tags_hint: payload.tags_hint ?? [],
    user_id: payload.user_id ?? userID ?? undefined,
    user_email: payload.user_email ?? userEmail ?? undefined,
    user_name: payload.user_name ?? userName ?? undefined,
    user_avatar_url: payload.user_avatar_url ?? userAvatar ?? undefined,
  };

  const upstreamResponse = await fetch(
    `${apiBaseUrl}/api/memes/generate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(upstreamPayload),
      cache: "no-store",
    },
  );

  if (!upstreamResponse.ok) {
    const fallback = await upstreamResponse.text();
    return NextResponse.json(
      {
        error: "upstream_error",
        message: "Meme generation service failed.",
        details: fallback,
      },
      { status: upstreamResponse.status },
    );
  }

  const data =
    (await upstreamResponse.json()) as MemeGenerationResponse;

  return NextResponse.json(data);
}
