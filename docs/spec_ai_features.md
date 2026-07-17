# SPEC: AI Features

**Status:** Approved (pending scraper spec)
**Features:** F1 — AI product descriptions · F2 — Semantic search
**Phase 2 / next-phase work is documented at the bottom of this file** (§ Phase 2).

---

## Task overview

| Done | Task | Feature | Description |
|---|---|---|---|
| ✅ | T1 | F1 | Extend `getProductBySlug` query and `Product` type with `ai_description` and `ai_deal_description` |
| ✅ | T2 | F1 | Display `ai_deal_description` inside price block (between badges and CTA button) |
| ✅ | T3 | F1 | Display `ai_description` in new section between price block and price history chart |
| ✅ | T4 | F2 | Manual DB setup: enable pgvector, add `embedding` column, add IVFFlat index (Railway console) — verified already done by scraper; extension + `vector(1536)` column + index `idx_products_embedding` exist, 719/719 active products embedded |
| ✅ | T5 | F2 | Add `openai` npm package and `OPENAI_API_KEY` to `.env.local` |
| ✅ | T6 | F2 | Create `lib/embeddings.ts` — `generateEmbedding()` using OpenAI `text-embedding-3-small` |
| ✅ | T7 | F2 | Create `lib/semantic-search.ts` — pgvector cosine similarity query returning `SearchResult[]` |
| ⬜ | T8 | F2 | Create `app/actions/semantic-search.ts` — Server Action wrapping T6 + T7 |
| ⬜ | T9 | F2 | Create `components/SemanticSearch.tsx` — textarea + price/brand filters, loading state, result cards (OOS indicator; top match shows existing AI text) |
| ⬜ | T10 | F2 | Wire `SemanticSearch` into `app/page.tsx` below hero, above top deals |
| ✅ | T11 | F2 | Add `getSearchBrands()` — distinct active-product brands for the brand filter dropdown |
| ⬜ | T12 | F2 | Add per-IP rate limiting to the `searchSemantic` Server Action (T8) — short-circuit before the OpenAI call |

---

## Decisions log

| # | Decision | Rationale |
|---|---|---|
| Embedding provider | OpenAI `text-embedding-3-small` (1536 dims) | Cheap (<€0.01 for 800 products), reliable, good multilingual quality |
| Embedding generation | Scraper repo (Python) | Scraper already generates ai_description/ai_deal_description; embeddings belong in the same pipeline |
| Query-time embedding | This repo (`lib/embeddings.ts`) | Web app must embed user queries at search time |
| What to embed | name + brand + category + ai_description + specs as key/value text | Price deliberately excluded — see product_scraper/docs/spec_embeddings.md §5 "Why price is excluded" (embeddings are never regenerated, so baked-in price/tier would drift permanently as prices change) |
| Price/deal-aware ranking in semantic search | Hybrid: hard UI filters + ranking, no price in the score | Price/brand enter as hard SQL `WHERE` predicates from explicit UI controls (not the vector, not the query text). Ranking stays vector cosine distance, with in-stock + deals as secondary `ORDER BY` tiebreakers. Price is never blended into the similarity score. |
| Semantic search filter controls | Price min/max + brand (multi-select, default all brands) | Two visible controls beside the textarea. Price is the one constraint the vector can't express; brand is for hard narrowing. Category deliberately excluded — the embedding already distinguishes product type. Reuses the T30 price-filter UI. |
| Brand control behaviour | Absent = no filter; selected = `p.brand = ANY($brands)` | Default shows all brands; only narrows when the user picks specific ones. Multi-select so users can compare a few brands. |
| Brand option list source | `SELECT DISTINCT brand FROM products WHERE active = true` (in-stock-aware), cached | Populate the dropdown from real catalog brands; avoid offering brands with nothing to show. |
| In-stock handling in semantic search | OOS sinks below ALL in-stock results (still shown + badged), not hidden | `(availability = true) DESC` is the **primary** `ORDER BY` key, above cosine distance — so every in-stock result ranks above every OOS one, and relevance orders within each group. Diverges from FTS (where in-stock is only a tiebreaker after rank): an OOS product ranking #1 was judged undesirable. No hard `WHERE` on availability. |
| Relevance cutoff | Drop results with cosine distance ≥ 0.55 (`MAX_RELEVANCE_DISTANCE`) | Calibrated on real queries: strong matches ~0.35–0.45, off-topic ~0.6+, gibberish ~0.8+. Prevents off-topic queries (products the catalog doesn't carry) from returning unrelated products — they return nothing instead, feeding T9's empty state. Tunable constant. |
| IVFFlat recall / probes | `SET LOCAL ivfflat.probes = 100` (= index `lists`) per query | The IVFFlat index is approximate and **not filter-aware**: with the default `probes=1` it scans ~1% of vectors then applies the price/brand `WHERE`, so selective filters returned 0 rows even when many products matched (verified: `maxPrice=100` → 0 of 170). Probes = `lists` gives exact recall; still <20ms at ~700 products. Equivalent to a filter-first exact scan at this scale. **Revisit if the catalog grows large or the index is rebuilt with a different `lists`** — the constant is tied to the current `lists=100`. |
| Query-time filter extraction (Option B) | Deferred; when added, pre-fills the UI controls | A lower-friction text-only path (LLM parses budget/brand from the query). Kept out of v1 for reliability. When built, it populates the same hard filters (which stay the source of truth), so nothing here is thrown away. |
| Results presentation | v1: product cards + AI text on the top match only (A+B) | Ranked cards are the core recommendation. The #1 result additionally surfaces the product's *existing* scraper-written `ai_description` (+ `ai_deal_description` when in-stock) — an "AI recommendation" feel with zero query-time LLM cost and no hallucination risk (text is pre-vetted per product). AI text on top match only, to keep the grid clean. Cross-product LLM synthesis is Phase 2 (see below). |
| Semantic search abuse protection | OpenAI monthly usage cap (backstop) + per-IP rate limit + existing input caps | Public unauthenticated endpoint calling a paid API. Embedding cost is tiny (~$0.80 / 100k searches) but a scripted flood needs a hard stop. Monthly cap set in OpenAI dashboard (spend guarantee); per-IP rate limit (T12) short-circuits before the OpenAI call; T8's 3–500 char input caps bound per-call tokens. Optional query caching to skip duplicate embeds. |
| FTS header search | Kept as-is | Semantic search is a separate homepage experience |
| ai_description null handling | Silent hide | |
| ai_deal_description null handling | Show whenever non-null, regardless of deal badge threshold | Scraper writes it on every price change, not only at deal thresholds |
| ai_deal_description stock handling | Only render when product is in stock (in_stock = true) | Scraper keeps generating/updating ai_deal_description while OOS too, so it's ready when the product comes back in stock — the web app must gate display on availability itself |
| ai_deal_description placement | Inside price block, below the in-stock line, above the CTA button | 1–2+ sentence deal context supports buy decision at the right moment |
| ai_deal_description styling | Blue "Prijs inzicht" insight card with Lightbulb + "AI" badge (lucide-react) | Amber read as ugly/cluttered; blue reads as neutral insight, AI badge makes generated origin explicit |
| ai_description placement | Card section between price block and price history chart | Static product info, not time-sensitive |
| Semantic search scope | Homepage only (for now) | |
| Semantic search trigger | Submit button (not live/debounced) | Avoids OpenAI API call per keystroke |
| Homepage placement | Below hero, above top deals | |

---

## Feature 1 — AI Product Descriptions

### What the scraper writes

| Column | Type | Content | Lifecycle |
|---|---|---|---|
| `ai_description` | `text` | Static product description | Written once on first discovery, never overwritten |
| `ai_deal_description` | `text` | Deal context copy (length TBD — may be more than 1–2 sentences) | Rewritten every time the price changes |

### DB changes

None. Both columns already exist in the `products` table.

### New dependency

`lucide-react` — icons on the product page (`Lightbulb`, `Sparkles` in the deal insight card).

---

### T1 — Extend `getProductBySlug` and `Product` type

**File:** `lib/products.ts`

- Add `ai_description` and `ai_deal_description` to the `SELECT` in `getProductBySlug()`
- Add both fields to the `Product` type:
  ```ts
  ai_description: string | null;
  ai_deal_description: string | null;
  ```

---

### T2 — Display `ai_deal_description` in price block

**File:** `app/[category]/[slug]/page.tsx`

- Render `ai_deal_description` inside the price block, below the in-stock line and above the "Bekijk bij Coolblue" CTA button
- Condition: only render if non-empty (trimmed) AND `in_stock` is true
- Styling: blue insight card — `rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-3`; header row with a `Lightbulb` icon + "Prijs inzicht" (`text-blue-800`) and a right-aligned "AI" pill (`Sparkles` icon, `bg-blue-100 text-blue-800`, `whitespace-nowrap`); body `text-sm leading-relaxed text-blue-900`
- Icons from `lucide-react` (`Lightbulb`, `Sparkles`), marked `aria-hidden`

---

### T3 — Display `ai_description` below price block

**File:** `app/[category]/[slug]/page.tsx`

- Add a new section between the price block and the price history chart
- Condition: only render if non-empty (trimmed)
- Layout: wrapped in a subtle card — `rounded-xl border border-gray-200 bg-gray-50 p-5`
  ```
  Over dit product          ← text-base font-semibold text-gray-900 mb-1.5
  {ai_description}           ← text-sm text-gray-600 leading-relaxed (no quotes)
  ```

---

## Feature 2 — Semantic Search

### Architecture

```
User submits query (SemanticSearch client component)
  → Server Action: app/actions/semantic-search.ts  ("use server")
    → lib/embeddings.ts  →  OpenAI text-embedding-3-small  →  1536-dim vector
    → lib/semantic-search.ts  →  pgvector cosine similarity SQL
  → Returns SearchResult[]
  → SemanticSearch renders product cards
```

### New environment variables

| Variable | Purpose |
|---|---|
| `OPENAI_API_KEY` | Query-time only — embeds the user's search query at search time |

### New dependencies

| Package | Why |
|---|---|
| `openai` | Official SDK — used in `lib/embeddings.ts` to embed user queries |

No pgvector npm package needed. Vectors are passed to `pg` as formatted strings (`[n1,n2,…]`) with a `::vector` cast in SQL.

### Prerequisite: scraper must populate `products.embedding`

F2 cannot be tested end-to-end until the scraper repo has generated embeddings. See the separate scraper spec. The DB steps below (T4) can be done independently.

---

### T4 — DB setup (manual, Railway console)

Run these SQL statements on the Railway Postgres instance (dashboard → your database → Query tab). Must be done in order.

**Step 1 — Enable pgvector** (one-time):
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

**Step 2 — Add embedding column:**
```sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS embedding vector(1536);
```

**Step 3 — Add index** (run *after* embeddings are populated by the scraper):
```sql
CREATE INDEX IF NOT EXISTS products_embedding_idx
  ON products
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 30);
```

---

### T5 — Add `openai` package and env var

- Run `npm install openai`
- Add `OPENAI_API_KEY=sk-…` to `.env.local`

---

### T6 — `lib/embeddings.ts`

New file. Initialises OpenAI client and exposes one function:

```ts
// Calls text-embedding-3-small, returns 1536-dim array
export async function generateEmbedding(text: string): Promise<number[]>
```

---

### T7 — `lib/semantic-search.ts`

New file. Runs pgvector cosine similarity query and returns results.

```ts
export type SemanticSearchFilters = {
  minPrice?: number | null;
  maxPrice?: number | null;
  brands?: string[]; // empty / undefined = all brands
};

export async function semanticSearch(
  embedding: number[],
  filters: SemanticSearchFilters = {},
  limit = 10
): Promise<SearchResult[]>
```

SQL pattern — same LATERAL join structure as `getProductsByCategory`. Price/brand are **hard filters**; in-stock is a **ranking** signal (not a filter). Because `price_history` is joined via LATERAL, filter `ph.price` in the outer `WHERE` (the LATERAL alias is in scope there):

The `SearchResult` type (in `lib/search.ts`) gains two **optional** fields so the top-match card can show existing AI copy (see T9 / decisions log). Optional so the FTS query, which doesn't select them, stays valid:

```ts
ai_description?: string | null;
ai_deal_description?: string | null;
```

```sql
SELECT
  p.id, p.name, p.brand, p.category, p.slug, p.image_url,
  p.ai_description, p.ai_deal_description,
  ph.price        AS current_price,
  ph.availability AS in_stock,
  p30.high_30d,
  CASE WHEN p30.high_30d > ph.price
       THEN p30.high_30d - ph.price ELSE NULL END AS price_diff,
  CASE WHEN p30.high_30d > ph.price AND p30.high_30d > 0
       THEN ROUND(((p30.high_30d - ph.price) / p30.high_30d * 100)::numeric, 1)
       ELSE NULL END AS drop_percentage
FROM products p
LEFT JOIN LATERAL (
  SELECT price, availability FROM price_history
  WHERE product_id = p.id ORDER BY scraped_at DESC LIMIT 1
) ph ON true
LEFT JOIN LATERAL (
  SELECT MAX(price) AS high_30d FROM price_history
  WHERE product_id = p.id AND scraped_at >= NOW() - INTERVAL '30 days'
) p30 ON true
WHERE p.active = true
  AND p.embedding IS NOT NULL
  AND (p.embedding <=> $1::vector) < 0.55               -- relevance cutoff (MAX_RELEVANCE_DISTANCE)
  AND ($2::numeric IS NULL OR ph.price >= $2)          -- min price
  AND ($3::numeric IS NULL OR ph.price <= $3)          -- max price
  AND ($4::text[] IS NULL OR p.brand = ANY($4))        -- brands (NULL = all)
ORDER BY
  (ph.availability = true) DESC NULLS LAST,            -- in-stock ALWAYS above OOS
  p.embedding <=> $1::vector,                          -- then semantic relevance
  drop_percentage DESC NULLS LAST                      -- deals as tiebreak
LIMIT $5
```

Embedding passed as `[${embedding.join(',')}]` with `::vector` cast. Empty brand array → pass `NULL` (not `{}`) so the filter is skipped. Returns `SearchResult[]` (0–10 rows — the cutoff can trim below `limit`) — same type already used by FTS search.

**IVFFlat / probes:** the ANN index is approximate and applies `WHERE` *after* scanning nearest lists, so the default `probes=1` under-recalled badly once a filter was applied (verified: `maxPrice=100` → 0 of 170 matching products). Fix: run inside a transaction with `SET LOCAL ivfflat.probes = 100` (= index `lists`) → exact recall, still fast at ~700 products. The constant is tied to the current `lists=100` and must be revisited if the index changes.

**Relevance cutoff & OOS ranking:** results with cosine distance ≥ `MAX_RELEVANCE_DISTANCE` (0.55) are dropped, so off-topic queries return nothing. In-stock is the **primary** sort key, so OOS products sink below all in-stock results (still returned + badged in T9).

Also needs a `getSearchBrands()` helper (in `lib/search.ts` or `lib/products.ts`) for the brand dropdown options — see T11.

---

### T8 — `app/actions/semantic-search.ts`

New file. Server Action wrapping T6 + T7.

```ts
"use server";

export async function searchSemantic(
  query: string,
  filters?: SemanticSearchFilters
): Promise<{ results: SearchResult[]; error?: string }>
```

- Validates input: min 3 chars, max 500 chars
- Validates filters: `minPrice`/`maxPrice` are non-negative numbers when present; ignore `minPrice > maxPrice` (or swap); `brands` are strings
- Calls `generateEmbedding(query)` → `semanticSearch(embedding, filters, 10)`
- Returns results or error string

---

### T9 — `components/SemanticSearch.tsx`

New client component (`"use client"`).

**Input:**
- `<textarea>` (not `<input>`) — allows multi-line natural language queries
- Placeholder: `"Beschrijf wat voor product je zoekt en welke functies belangrijk zijn. Bijv: 'draadloze koptelefoon voor sport met goede pasvorm'"` — no price/brand phrasing in the example, since those are now explicit controls, not parsed from the text
- Filter controls (below or beside the textarea):
  - **Price** — min/max numeric inputs (reuse the T30 price-filter UI/pattern)
  - **Brand** — multi-select, default "Alle merken" (no filter); options from `getSearchBrands()` (T11)
- Submit button: "Zoek met AI"
- Filters are passed to `searchSemantic(query, filters)` on submit (not applied live)

**States:**

| State | UI |
|---|---|
| Idle | Textarea + button; no results |
| Loading | Spinner + "Zoeken…"; button disabled |
| Results | Grid of product cards (up to 10) |
| Empty | "Geen resultaten gevonden. Probeer een andere omschrijving." |
| Error | "Er is iets misgegaan, probeer het opnieuw." |

**Result cards:** same Tailwind card pattern as `CategoryProductGrid` product cards — image, name, brand, price, deal badge if applicable. Cards link to `/{category}/{slug}`. Show an **out-of-stock indicator** when `in_stock` is false (OOS products are ranked lower but still shown — see decisions log) — reuse whatever OOS treatment the category grid already uses.

**Top match (result #1) — AI text (A+B presentation):** the first result gets an expanded/highlighted treatment that surfaces the product's *existing* scraper-written AI copy — no query-time LLM call:
- `ai_description` — shown as the "why this fits" blurb (reuse the T3 "Over dit product" card styling / truncation)
- `ai_deal_description` — shown **only when `in_stock` is true and non-empty**, reusing the T2 blue "Prijs inzicht" insight card (Lightbulb + "AI" pill)
- If both are null/empty, the top match renders as a normal card (silent hide)
- AI text is shown on the **top match only** — not on every card (keeps the grid clean)

---

### T10 — Wire `SemanticSearch` into homepage

**File:** `app/page.tsx`

Add new section below the hero block, above the top deals section:

```
[Hero]
──────────────────────────────────────────
Zoek met AI                    (h2, font-bold)
Beschrijf wat je zoekt en wij vinden de beste match
<SemanticSearch />
──────────────────────────────────────────
[Top deals]
[Category cards]
```

---

## Implementation order

**F1** (no prerequisites):
- T1 → T2 → T3

**F2** (T4 DB steps can start immediately; T6–T11 require T4 + T5; end-to-end testing requires scraper to have run):
- T4 (manual DB) → T5 → T6 → T7 → T11 → T8 → T9 → T10
- T11 can be built any time after T5 (no embedding dependency); slotted before T9 since T9's brand dropdown consumes it

---

## Phase 2 (next, not in current scope)

Deliberate fast-follows once v1 (A+B) ships and rate limiting (T12) is live:

- **C — LLM synthesis blurb over results.** A short generated paragraph that reasons *across* the returned products and tailors to the query (e.g. "Van deze resultaten past de Jabra X het best voor sport, en die is nu ook afgeprijsd…"). Distinct from B: B reuses per-product text; C reasons across the result set. Requirements when built:
  - Chat-completion call per search (not an embedding) — real cost + latency; **stream** the response for UX.
  - Gate behind T12 rate limiting + the OpenAI monthly cap before enabling.
  - Ground strictly on the returned rows only (name/brand/price/specs/`ai_description`); forbid inventing specs or prices; cite prices from the data to avoid hallucination.
- **B (Option B filter extraction) — LLM parses budget/brand from the query text** and pre-fills the T9 UI controls (which remain the source of truth). See decisions log.

## Out of scope

- Semantic search on pages other than homepage
- Embedding regeneration when `ai_description` changes (scraper concern)
- Multi-retailer support
