"use server";

import { generateEmbedding } from "../../lib/embeddings";
import { semanticSearch, type SemanticSearchFilters } from "../../lib/semantic-search";
import type { SearchResult } from "../../lib/search";

const MIN_QUERY_LENGTH = 3;
const MAX_QUERY_LENGTH = 500;

// Server Action: embeds the user query and runs the pgvector search.
// NOTE: not yet rate-limited — see T12. Do not deploy publicly before then.
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

  const cleanFilters = sanitizeFilters(filters);

  try {
    const embedding = await generateEmbedding(trimmed);
    const results = await semanticSearch(embedding, cleanFilters, 10);
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
