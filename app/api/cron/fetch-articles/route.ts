import { NextResponse } from "next/server";
import { fetchArticlesForAllEnabledSources } from "@/lib/articles";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization");

  return Boolean(secret && header === `Bearer ${secret}`);
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized." },
      { status: 401 },
    );
  }

  const result = await fetchArticlesForAllEnabledSources();

  return NextResponse.json({
    ok: result.ok,
    message: result.message,
    sourcesChecked: result.sourcesChecked,
    articlesFound: result.fetched,
    articlesInserted: result.inserted,
    duplicatesSkipped: result.skipped,
    failedSources: result.failedSources,
    errors: result.errorMessages,
  });
}
