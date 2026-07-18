"use server";

import { headers } from "next/headers";
import { generateEmbedding } from "../../lib/embeddings";
import { semanticSearch, isLikelyOnTopicQuery, type SemanticSearchFilters } from "../../lib/semantic-search";
import { checkRateLimit } from "../../lib/rate-limit";
import { getSearchBrands, type SearchResult } from "../../lib/search";

const MIN_QUERY_LENGTH = 3;
const MAX_QUERY_LENGTH = 500;

async function getClientIp(): Promise<string | null> {
  const h = await headers();
  const forwardedFor = h.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return h.get("x-real-ip");
}

// Server Action: embeds the user query and runs the pgvector search.
export async function searchSemantic(
  query: string,
  filters?: SemanticSearchFilters
): Promise<{ results: SearchResult[]; error?: string }> {
  const trimmed = query.trim();

  if (trimmed.length < MIN_QUERY_LENGTH) {
    return { results: [], error: "Typ minimaal 3 tekens om te zoeken." };
  }
  if (trimmed.length > MAX_QUERY_LENGTH) {
    return { results: [], error: "Zoekopdracht is te lang." };
  }

  const ip = await getClientIp();
  if (ip) {
    const allowed = await checkRateLimit(ip);
    if (!allowed) {
      return { results: [], error: "Te veel zoekopdrachten. Probeer het over een paar minuten opnieuw." };
    }
  }

  const cleanFilters = sanitizeFilters(filters);

  try {
    const catalogBrands = await getSearchBrands();
    const bypassRelevanceCutoff = isLikelyOnTopicQuery(trimmed, catalogBrands);
    const embedding = await generateEmbedding(trimmed);
    const results = await semanticSearch(embedding, cleanFilters, 10, bypassRelevanceCutoff);
    return { results };
  } catch (error) {
    console.error("Error in searchSemantic:", error);
    return { results: [], error: "Er is iets misgegaan, probeer het opnieuw." };
  }
}

function sanitizeFilters(filters?: SemanticSearchFilters): SemanticSearchFilters {
  if (!filters) return {};

  const toPositive = (v: number | null | undefined): number | null =>
    typeof v === "number" && isFinite(v) && v >= 0 ? v : null;

  let minPrice = toPositive(filters.minPrice);
  let maxPrice = toPositive(filters.maxPrice);
  // Swap if the user entered them the wrong way round.
  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    [minPrice, maxPrice] = [maxPrice, minPrice];
  }

  const brands = Array.isArray(filters.brands)
    ? filters.brands.filter((b): b is string => typeof b === "string" && b.length > 0)
    : [];

  return { minPrice, maxPrice, brands };
}
