import { NextRequest } from "next/server";
import { generateSearchSummary } from "@/lib/search-summary";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import type { SearchResult } from "@/lib/search";

// Only results[0] is ever used, but cap the accepted payload size defensively
// — searchSemantic itself never returns more than 10 rows.
const MAX_RESULTS = 10;
// Mirrors app/actions/semantic-search.ts's MAX_QUERY_LENGTH — bounds prompt
// size / OpenAI cost per request, independent of the per-IP rate limit above.
const MAX_QUERY_LENGTH = 500;

type RequestBody = {
  query?: string;
  results?: SearchResult[];
};

// Route Handler (not a Server Action) because T20 will make this stream.
// Takes the query + results the client already got back from searchSemantic
// — does not re-run the embedding/pgvector search.
export async function POST(request: NextRequest) {
  const ip = await getClientIp();
  if (ip) {
    const allowed = await checkRateLimit(ip);
    if (!allowed) {
      return Response.json(
        { error: "Te veel zoekopdrachten. Probeer het over een paar minuten opnieuw." },
        { status: 429 }
      );
    }
  }

  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Ongeldig verzoek." }, { status: 400 });
  }

  const query = body.query?.trim();
  const results = body.results;

  if (!query) {
    return Response.json({ error: "Ongeldig verzoek." }, { status: 400 });
  }
  if (query.length > MAX_QUERY_LENGTH) {
    return Response.json({ error: "Zoekopdracht is te lang." }, { status: 400 });
  }
  if (!Array.isArray(results) || results.length === 0) {
    return Response.json({ error: "Geen resultaten om samen te vatten." }, { status: 400 });
  }
  if (results.length > MAX_RESULTS) {
    return Response.json({ error: "Ongeldig verzoek." }, { status: 400 });
  }

  try {
    const summary = await generateSearchSummary(query, results[0]);
    return Response.json({ summary });
  } catch (error) {
    console.error("Error in /api/search-summary:", error);
    return Response.json({ error: "Er is iets misgegaan, probeer het opnieuw." }, { status: 500 });
  }
}
