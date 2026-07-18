import { pool } from "./db";
import type { SearchResult } from "./search";

export type SemanticSearchFilters = {
  minPrice?: number | null;
  maxPrice?: number | null;
  brands?: string[]; // empty / undefined = all brands
};

// IVFFlat probes: how many lists the index scans. The default (1) under-recalls
// badly once a hard filter (price/brand) is applied — the index returns the
// nearest ~1% of vectors, then the filter drops most of them, so selective
// filters can return zero rows even when many products match. Setting probes
// equal to the index's `lists` (currently 100) gives exact recall; at this
// catalog size (~700 products) that is still fast. Revisit if the catalog grows
// large or the index is rebuilt with a different `lists` value.
const IVFFLAT_PROBES = 100;

// Max cosine distance for a result to count as relevant. Calibrated on real
// queries: strong matches sit ~0.35–0.45, off-topic queries ~0.6+, gibberish
// ~0.8+. 0.55 keeps genuine (incl. loosely-phrased) matches and drops products
// the catalog doesn't really carry, so an off-topic search returns nothing
// instead of unrelated products. Tune if results feel too strict/loose.
const MAX_RELEVANCE_DISTANCE = 0.55;

// Short single-word category queries (e.g. "speaker", dist 0.615) carry less
// semantic signal than descriptive queries and land beyond MAX_RELEVANCE_DISTANCE
// despite being unambiguously on-topic. Raising the global threshold isn't safe —
// off-topic queries (e.g. "koffiezetapparaat", dist 0.61-0.64) overlap the same
// range. Instead, a known category/brand keyword bypasses the cutoff entirely
// for that query (T15) — ranking still runs on cosine distance either way.
const CATEGORY_KEYWORDS = [
  "koptelefoon", "koptelefoons", "headphone", "headphones",
  "oordopje", "oordopjes", "oortjes", "earbud", "earbuds", "earphone", "earphones",
  "speaker", "speakers", "luidspreker", "luidsprekers",
  "soundbar", "soundbars",
];

// Whole-word match against CATEGORY_KEYWORDS, or a substring match against any
// catalog brand name. Case-insensitive. Used to decide whether a query is
// "terse but valid" and should skip the relevance cutoff.
export function isLikelyOnTopicQuery(query: string, brands: string[]): boolean {
  const lower = query.toLowerCase();

  const hasCategoryWord = CATEGORY_KEYWORDS.some((word) =>
    new RegExp(`\\b${word}\\b`).test(lower)
  );
  if (hasCategoryWord) return true;

  return brands.some((brand) => lower.includes(brand.toLowerCase()));
}

// Runs a pgvector cosine-similarity search. Price/brand are hard filters;
// out-of-stock products are pushed below in-stock ones (still shown, ranked
// lower); results beyond MAX_RELEVANCE_DISTANCE are dropped, unless
// bypassRelevanceCutoff is set (T15 — known on-topic short query). Vectors are
// passed as a formatted string with a ::vector cast — no pgvector npm package
// needed.
export async function semanticSearch(
  embedding: number[],
  filters: SemanticSearchFilters = {},
  limit = 10,
  bypassRelevanceCutoff = false
): Promise<SearchResult[]> {
  const { minPrice, maxPrice, brands } = filters;
  const vector = `[${embedding.join(",")}]`;
  // Empty array -> NULL so the brand filter is skipped entirely.
  const brandFilter = brands && brands.length > 0 ? brands : null;

  const client = await pool.connect();
  try {
    // SET LOCAL is transaction-scoped, so probes never leaks to other queries
    // on this pooled connection.
    await client.query("BEGIN");
    await client.query(`SET LOCAL ivfflat.probes = ${IVFFLAT_PROBES}`);
    const result = await client.query<SearchResult>(
      `
      SELECT
        p.id,
        p.name,
        p.brand,
        p.category,
        p.slug,
        p.image_url,
        p.ai_description,
        p.ai_deal_description,
        ph.price        AS current_price,
        ph.availability AS in_stock,
        CASE WHEN p30.high_30d > ph.price
             THEN p30.high_30d - ph.price
             ELSE NULL END AS price_diff,
        CASE WHEN p30.high_30d > ph.price AND p30.high_30d > 0
             THEN ROUND(((p30.high_30d - ph.price) / p30.high_30d * 100)::numeric, 1)
             ELSE NULL END AS drop_percentage
      FROM products p
      LEFT JOIN LATERAL (
        SELECT price, availability
        FROM price_history
        WHERE product_id = p.id
        ORDER BY scraped_at DESC
        LIMIT 1
      ) ph ON true
      LEFT JOIN LATERAL (
        SELECT MAX(price) AS high_30d
        FROM price_history
        WHERE product_id = p.id
          AND scraped_at >= NOW() - INTERVAL '30 days'
      ) p30 ON true
      WHERE p.active = true
        AND p.embedding IS NOT NULL
        AND ($6::boolean OR (p.embedding <=> $1::vector) < ${MAX_RELEVANCE_DISTANCE})
        AND ($2::numeric IS NULL OR ph.price >= $2)
        AND ($3::numeric IS NULL OR ph.price <= $3)
        AND ($4::text[] IS NULL OR p.brand = ANY($4))
      ORDER BY
        (ph.availability = true) DESC NULLS LAST,
        p.embedding <=> $1::vector,
        drop_percentage DESC NULLS LAST
      LIMIT $5
      `,
      [vector, minPrice ?? null, maxPrice ?? null, brandFilter, limit, bypassRelevanceCutoff]
    );
    await client.query("COMMIT");
    return result.rows;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Database error in semanticSearch:", error);
    return [];
  } finally {
    client.release();
  }
}
