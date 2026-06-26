import { NextResponse } from "next/server";
import { fetchArticlesForVertical } from "@/lib/articles";

type FetchPayload = {
  verticalSlug?: unknown;
};

export async function POST(request: Request) {
  let body: FetchPayload;

  try {
    body = (await request.json()) as FetchPayload;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Please send a valid article fetch request." },
      { status: 400 },
    );
  }

  const verticalSlug =
    typeof body.verticalSlug === "string" ? body.verticalSlug.trim() : "";

  if (!verticalSlug) {
    return NextResponse.json(
      { ok: false, message: "Vertical is required." },
      { status: 400 },
    );
  }

  const result = await fetchArticlesForVertical(verticalSlug);

  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
