# SPEC: AI Features

**Status:** Approved (pending scraper spec)
**Features:** F1 — AI product descriptions · F2 — Semantic search · F3 — Python reference implementation (portfolio, Phase 3)
**Phase 2 / Phase 3 (next-phase) work is documented at the bottom of this file** (§ Phase 2, § Phase 3).

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
| ✅ | T8 | F2 | Create `app/actions/semantic-search.ts` — Server Action wrapping T6 + T7 |
| ✅ | T9 | F2 | Create `components/SemanticSearch.tsx` — textarea + price/brand filters, loading state, result cards (OOS indicator; top match shows existing AI text) |
| ✅ | T10 | F2 | Wire `SemanticSearch` into `app/page.tsx` below hero, above top deals |
| ✅ | T11 | F2 | Add `getSearchBrands()` — distinct active-product brands for the brand filter dropdown |
| ✅ | T12 | F2 | Add per-IP rate limiting to the `searchSemantic` Server Action (T8) — short-circuit before the OpenAI call |
| ✅ | T13 | F2 | Search UX polish: Enter-to-search, AI-styled search card, full (untruncated) top-match AI text |
| ✅ | T14 | F2 | `sessionStorage` persistence of query/filters/results across navigation |
| ✅ | T15 | F2 | Fix relevance-cutoff false negative on short/category queries (e.g. "speaker") via category/brand keyword bypass; document a manual test-scenario checklist |
| ✅ | T16 | F2 | Restrict `DATABASE_URL` to a least-privilege, read-only Postgres role for this app — no `CREATE`/`DROP`/`INSERT`/`UPDATE`/`DELETE` |
| ✅ | T17 | F2 | Phase 2 — `lib/search-summary.ts`: prompt builder + non-streaming OpenAI chat completion call |
| ✅ | T18 | F2 | Phase 2 — `app/api/search-summary/route.ts`: Route Handler, rate-limited via T12 |
| ✅ | T19 | F2 | Phase 2 — Wire summary into `SemanticSearch.tsx`; remove `ai_description` from top-match card, keep `ai_deal_description` |
| ⬜ | T20 | F2 | Phase 2 — Add streaming (client + server) to the cross-result summary |
| ⬜ | T21 | F2 | Phase 2 — Manual grounding-accuracy checklist for the summary (≥5 queries) |
| ⬜ | T22 | F3 | Phase 3 — Decide/create repo or notebook location for Python reference implementation |
| ⬜ | T23 | F3 | Phase 3 — Port `lib/embeddings.ts` equivalent (embedding generation) |
| ⬜ | T24 | F3 | Phase 3 — Port `lib/semantic-search.ts` equivalent as a config-driven `SemanticSearchEngine` class |
| ⬜ | T25 | F3 | Phase 3 — Cross-check Python output against the TS implementation using T15's test queries |
| ⬜ | T26 | F2 | Polish look & feel of the "AI samenvatting" card (`SearchSummaryCard` in `SemanticSearch.tsx`) — current version is functional/plain, needs a visual design pass |
| ⬜ | T27 | F2 | Investigate negation handling in semantic search — e.g. "koptelefoon zonder noise cancelling" returned a product *with* noise cancelling as top match (the T17 summary correctly flagged the mismatch in its own text, exposing a retrieval-layer issue, not a summary bug). Likely an embedding-model limitation with negated queries; needs research into mitigation (query preprocessing, negation detection, reranking, etc.) before any fix is scoped |

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
| Query-time filter extraction (Option B) | Dropped (2026-08-14) — see Phase 2 § Dropped ideas | Brand and specs are already in the embedding, so extraction adds no unique value there; price is the only non-embedded filter, but the slider is already low-friction, and the cases where extraction would help most (vague phrasing like "goedkope") require inferring a number rather than extracting one — a riskier feature than originally scoped. |
| Results presentation | v1: product cards + AI text on the top match only | Ranked cards are the core recommendation. The #1 result additionally surfaces the product's *existing* scraper-written `ai_description` (+ `ai_deal_description` when in-stock) — an "AI recommendation" feel with zero query-time LLM cost and no hallucination risk (text is pre-vetted per product). AI text on top match only, to keep the grid clean. **Superseded once Phase 2's cross-result summary ships: `ai_description` drops off the top-match card, `ai_deal_description` stays — see Phase 2.** |
| Search bar UX | Enter submits, Shift+Enter for newline; single-card visual style with a Sparkles/AI icon | Textarea default (plain Enter = newline) fights expected search-box behavior. The original plain textarea + separate button read as bland — a single bordered card with an AI icon reads as a distinct, AI-flavored search entry point rather than a generic form field. |
| Top-match AI text length | Full text, no truncation | User preference: show the complete `ai_description` / `ai_deal_description` even though they're written for the product page and can run long, rather than a clamped/shortened version. Image is top-aligned (not vertically centered) to accommodate variable-height text. |
| Search result persistence | `sessionStorage`, not `localStorage` or server state | Clicking a result and returning to the homepage should not lose the search. Session-scoped (cleared on tab/browser close) is the right lifetime — this is a "don't lose my place" convenience, not a durable saved-search feature. |
| Semantic search abuse protection | OpenAI monthly usage cap (backstop) + per-IP rate limit + existing input caps | Public unauthenticated endpoint calling a paid API. Embedding cost is tiny (~$0.80 / 100k searches) but a scripted flood needs a hard stop. Monthly cap set in OpenAI dashboard (spend guarantee); per-IP rate limit (T12) short-circuits before the OpenAI call; T8's 3–500 char input caps bound per-call tokens. Optional query caching to skip duplicate embeds. |
| Rate-limit storage (T12) | Separate store (Redis via Vercel Marketplace/Upstash), not Postgres | `DATABASE_URL` is meant to be scraper/product data only — schema and migrations for it live in the `product_scraper` repo. Rate-limit counters are unrelated, high-write-frequency, app-operational bookkeeping and should not live in the production product DB. |
| DB credential scope (T16) | `DATABASE_URL` currently grants full DDL/write access, not just `SELECT` | Discovered while building T12: an ad-hoc `CREATE TABLE`/`DROP TABLE` against the production DB succeeded from this (frontend-only, read-should-be-enough) app without any permission error. Nothing technical currently stops this app's code from writing to or altering the production schema. Flagged as T16 — needs a least-privilege role, provisioned/coordinated on the Railway side (and with the `product_scraper` repo, which owns the schema). |
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
- `<textarea>` (not `<input>`) — allows multi-line natural language queries, wrapped in a single card with a Sparkles icon (visual AI cue), matching styling to feel distinct from the plain header `SearchInput`
- **Enter submits the search; Shift+Enter inserts a newline** — matches expected search-box behavior rather than the textarea's plain-Enter-is-newline default
- Placeholder: `"Beschrijf wat voor product je zoekt en welke functies belangrijk zijn. Bijv: 'draadloze koptelefoon voor sport met goede pasvorm'"` — no price/brand phrasing in the example, since those are now explicit controls, not parsed from the text
- Filter controls — collapsed by default behind a "Filters" toggle (keeps the search inviting; most searches won't need them):
  - **Price** — min/max numeric inputs (reuse the T30 price-filter UI/pattern)
  - **Brand** — multi-select **dropdown** (not a pill wall — ~37 brands is too many for `BrandFilter`'s always-visible pills), default "Alle merken" (no filter); options from `getSearchBrands()` (T11); new `components/BrandMultiSelect.tsx`
- Submit button: "Zoek met AI" with a Sparkles icon
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

**Top match (result #1) — featured banner (A+B presentation):** the first result is rendered as a full-width horizontal banner above the results grid (image left, top-aligned; brand/name/price + AI text right; `border: 2px solid border-accent`, "Beste match" badge). It surfaces the product's *existing* scraper-written AI copy — no query-time LLM call:
- `ai_description` — "why this fits" blurb, shown **in full** (no truncation/line-clamp — user preference: prefers the complete text over a shortened version, even though it's written for the product page and can run long)
- `ai_deal_description` — shown **in full**, **only when `in_stock` is true and non-empty**, in the T2 blue "Prijs inzicht" insight card (Lightbulb + "AI" pill)
- If both are null/empty, the banner shows just image + name + price (no AI block)
- AI text is shown on the **top-match banner only** — the remaining results are normal cards in the grid (keeps it clean)
- (Phase 2 will still add purpose-written short snippets as an alternative/better-fitting copy — see Phase 2 — but v1 shows the full existing text rather than a clamped version.)

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

### T13 — Search UX polish

Post-launch refinements to T9, driven by direct usability feedback on the first working version.

**File:** `components/SemanticSearch.tsx` (+ new `components/BrandMultiSelect.tsx`)

1. **Enter-to-search.** A plain `<textarea>` treats Enter as a newline by default, which fights expected search-box behavior. `Enter` now submits the search; `Shift+Enter` inserts a newline.
2. **AI-styled search card.** The original plain textarea + separate button read as bland/generic. Redesigned as a single bordered card containing the textarea, a Sparkles icon inline with the input, a collapsible "Filters" toggle, and a "Zoek met AI" button with a Sparkles icon — reads as a distinct AI-flavored entry point rather than a generic form.
3. **Full (untruncated) top-match AI text.** T9 originally line-clamped `ai_description`/`ai_deal_description` in the "Beste match" banner (3/2 lines) since they're written long for the product page. User feedback: show the complete text, not a clamped version — clamping cut off mid-thought and felt incomplete. The banner image is top-aligned (not vertically centered) so the layout works with variable-height text. Phase 2's short-snippet copy (see Phase 2) remains the longer-term fix for banner-appropriate length; T13 keeps the existing long text but shows all of it.
4. **Brand filter as a dropdown, not a pill wall.** T9 originally reused `BrandFilter`'s always-visible pill pattern; with ~37 brands on the homepage (vs. a handful per category) that's too many pills. New `components/BrandMultiSelect.tsx`: a compact "Alle merken" / "Merken (n)" button opening a checkbox list, click-outside-to-close.

### T14 — Session persistence
**Session persistence.** The last search (query text, filters, results) is saved to `sessionStorage` (key `semanticSearchState`) so it survives navigating to a product page and back to the homepage. Restored on mount; cleared automatically when the browser tab/session ends — deliberately `sessionStorage`, not `localStorage` or server state, since this is a "don't lose my place" convenience, not a durable saved-search feature.

**Save is explicit, not reactive.** The persist call happens once, inside `runSearch()`, right after a search completes — using values computed locally in that function, not by watching component state via a second `useEffect`. This is a deliberate correction of an earlier bug: a reactive "watch all state and auto-save on change" effect also fires on the initial hydration render, *before* the restore effect's `setState` calls have been applied to a re-render — so it wrote the still-default empty state directly over the just-restored `sessionStorage` data, silently losing every session on the very next remount (reproduced: searching, clicking a product, and returning to the homepage showed no results, and `sessionStorage` had shrunk from ~9KB of real results to the ~100-byte empty default). Saving explicitly after a search completes makes that race structurally impossible — nothing ever writes to `sessionStorage` during mount/hydration. **Do not reintroduce a reactive auto-save effect for this state.**

A search in progress (`status: "loading"`) is never persisted mid-request — restoring mid-request would show a spinner with no request in flight, so it's restored as `idle` instead if the tab is reloaded before a search completes.

---

### T15 — Fix relevance-cutoff false negative on short/category queries

**Bug found in manual testing:** searching just `"speaker"` returns "Geen resultaten gevonden" even though the catalog has ~200 speakers. Root cause: `MAX_RELEVANCE_DISTANCE` (T7, `lib/semantic-search.ts`) was calibrated on rich, descriptive queries (dist ~0.35–0.45 for genuine matches). Short single-word category queries carry less semantic signal and land further out — `"speaker"` sits at dist 0.615, `"oordopjes"` at 0.568 — **both beyond the 0.55 cutoff despite being unambiguously on-topic**. Simply raising the global threshold doesn't work: the off-topic calibration query (`"koffiezetapparaat"`, dist 0.61–0.64) overlaps the same range as legitimate short queries, so no single global distance value cleanly separates "terse but valid" from "genuinely off-topic."

**Fix — category/brand keyword bypass:** before applying `MAX_RELEVANCE_DISTANCE`, check whether the (lowercased) query contains a known category word or a catalog brand name. If it does, skip the distance filter entirely for this search — ranking still runs on cosine distance, only the *cutoff* is skipped. If it doesn't match a known term, the existing cutoff behavior (and honest empty state for genuinely off-topic queries) is unchanged.

- **File:** `lib/semantic-search.ts`
- New export `isLikelyOnTopicQuery(query: string, brands: string[]): boolean`:
  - `CATEGORY_KEYWORDS` — small hardcoded list covering the 4 categories in Dutch + English + common singular/plural: `koptelefoon(s)`, `headphone(s)`, `oordopje(s)`, `oortjes`, `earbud(s)`, `earphone(s)`, `speaker(s)`, `luidspreker(s)`, `soundbar(s)`
  - Brand check — case-insensitive substring match against the full catalog brand list (not just selected filter brands), via `getSearchBrands()` (T11)
  - Match = whole-word for category keywords (avoid accidental substring hits); simple substring for brand names
- `semanticSearch()` gains a `bypassRelevanceCutoff: boolean` param; SQL changes to `AND ($6::boolean OR (p.embedding <=> $1::vector) < 0.55)`
- `app/actions/semantic-search.ts` (T8) computes the flag via `getSearchBrands()` + `isLikelyOnTopicQuery()` before calling `semanticSearch()`

**Manual test-scenario checklist** (per this repo's testing convention — exercised via the live UI, not isolated DB-function tests):

| # | Query | Filters | Expected |
|---|---|---|---|
| 1 ✅ | `"draadloze koptelefoon voor sport met goede pasvorm"` | none | Results, relevant sport-focused earbuds/headphones as top match. **Verified live: returns earbuds only (no headphones) — within expected, since earbuds are a valid sport-focused match.** |
| 2 ✅ | `"speaker"` | none | **Results** (bug case — must no longer be empty). **Verified live: returns 10 results.** |
| 3 ✅ | `"oordopjes"` | none | Results. **Verified live: returns 10 results.** |
| 4 ✅ | `"koffiezetapparaat met melkopschuimer"` | none | "Geen resultaten gevonden" (genuinely off-topic, must stay empty). **Verified live: still empty.** |
| 5 ✅ | `"asdfqwer zxcv"` | none | "Geen resultaten gevonden" (gibberish). **Verified live: empty, as expected.** |
| 6 ✅ | `"speaker met koffiezetapparaat"` | none | **Known bypass edge case** — contains the category keyword `"speaker"`, so the cutoff is skipped for the whole query (see T15 design). Expect **results shown** (speakers, ranked by whatever the embedding finds closest — likely dominated by "speaker"), not an empty state. This is accepted behavior of the keyword-bypass approach, not a bug: a mixed query with *any* valid category/brand term is treated as on-topic. Verify results still look like speakers, not random noise. **Verified live: returns 10 results.** Mixed/multi-intent queries like this are a candidate for real disambiguation once Phase 2's LLM query-parsing lands — noted as a forward-looking idea, not a T15 defect. |
| 7 ✅ | `"koptelefoon"` | `maxPrice: 100` | Results ≤ €100 only (regression check for the T7 IVFFlat recall fix). **Verified live: returns headphones within the price cap, as expected.** |
| 8 ✅ | `"koptelefoon"` | `brands: ["Sony"]` | Results, all brand = Sony. **Verified live: returns Sony headphones only, as expected.** |
| 9 ✅ | any valid query | `minPrice: 50, maxPrice: 150, brands: [two brands]` | Results respecting both filters simultaneously. **Verified live: returns valid results respecting all filters.** |
| 10 | valid query returning a currently out-of-stock top match | none | Result still shown, ranked appropriately, with OOS indicator (not hidden). **Not tested — no current catalog scenario where an OOS product ranks as the top match; leave open for future manual testing when such a case arises.** |
| 11 ✅ | `""` / `"ab"` (< 3 chars) | none | Client/server validation error, no OpenAI call made. **Verified live: shows "Typ minimaal 3 tekens om te zoeken.", as expected.** |
| 12 ✅ | 501+ character query | none | Server validation error ("Zoekopdracht is te lang"), no OpenAI call made. **Verified live: shows expected error, as expected.** |

---

### T12 — Per-IP rate limiting

**File:** `lib/rate-limit.ts`, wired into `app/actions/semantic-search.ts`

Sliding-window rate limit (`@upstash/ratelimit` + `@upstash/redis`), 20 requests / 10 minutes per IP, backed by Redis provisioned via the Vercel Marketplace (not the product Postgres DB — see the T16 decision). Client IP read from `x-forwarded-for` / `x-real-ip` in the Server Action.

**Fails open** if Redis is unconfigured (env vars missing, e.g. local dev without setup) or unreachable (network/TLS error) — a rate-limit outage degrades to "unlimited," not "search broken." Over-limit requests short-circuit before the OpenAI call and return the existing error-message UI path: "Te veel zoekopdrachten. Probeer het over een paar minuten opnieuw."

**Verified live:** temporarily lowered to 3 requests / 10 min, ran 4 real searches through the UI — first 3 returned real results, the 4th showed the rate-limit message. Reverted to 20 after confirming.

---

### T16 — Restrict `DATABASE_URL` to a least-privilege read-only role

**Found while implementing T12:** the app's `DATABASE_URL` connection string authenticates as a role with full DDL and write privileges on the production database — an ad-hoc `CREATE TABLE search_rate_limits ...` and later `DROP TABLE search_rate_limits` both succeeded from this app's code with no permission error, even though the app only ever reads product/price data (it never writes). The credential's scope, not the app's code, is the only thing that made that possible.

**Fix:** provision a separate Postgres role for this app's `DATABASE_URL` that only has `SELECT` on the tables it actually queries (`products`, `price_history`, and whatever else `lib/*.ts` reads) — no `CREATE`, `DROP`, `INSERT`, `UPDATE`, or `DELETE` anywhere. This is a Railway/DB-side change (`CREATE ROLE ... ` + `GRANT SELECT ...` + `REVOKE` on everything else, or Railway's own role-scoping if it offers one), not an app-code change, and should be coordinated with whoever owns the schema in `product_scraper` (per [[project-scraper-path]]) so the scraper's own write access isn't accidentally affected.

**Done:** user already had a `scraper_readonly` role provisioned in Railway. Swapped `DATABASE_URL` to it in both local `.env.local` and Vercel (Production). Verified with a throwaway script: `SELECT` on `products` succeeds, `INSERT` and `CREATE TABLE` both fail with `permission denied`. Confirmed end-to-end in the browser (local dev, restarted after the env change) that homepage, category pages, product detail, and semantic search all still work on the read-only role. Old full-access credential still used by `product_scraper` — rotating its password is a follow-up the user is handling in that project's own repo, since rotation requires updating the scraper's config too.

- **Owner:** user (DB/infra change, not app code)
- **Scope:** production Railway Postgres instance + Vercel Production env; local dev DB is a separate, already-manual setup
- **Blocking:** not blocking other F2 work, and did not block public deploy — done

---

## Implementation order

**F1** (no prerequisites):
- T1 → T2 → T3

**F2** (T4 DB steps can start immediately; T6–T11 require T4 + T5; end-to-end testing requires scraper to have run):
- T4 (manual DB) → T5 → T6 → T7 → T11 → T8 → T9 → T10 → T13 → T14 → T15 → T12 → T16
- T11 can be built any time after T5 (no embedding dependency); slotted before T9 since T9's brand dropdown consumes it
- T13/T14 follow T9/T10 (UX polish + persistence on the shipped component, driven by hands-on feedback); T15 fixes a bug found during that same hands-on testing; T12 (rate limiting) and T16 (DB credential scoping) stay last — required before any public deploy, but not blocking earlier dev/testing. T16 is user-owned infra work, independent of T12's implementation.

---

## Phase 2 (next, not in current scope)

Discussed in detail 2026-08-14. Two of the three original ideas (filter extraction, concise AI copy) were interviewed through and dropped — rationale kept below, not deleted, so the reasoning isn't lost. One item remains in scope.

### Dropped ideas (kept for rationale)

- **~~Concise search-result AI copy~~ — dropped.** Original idea: replace the top-match banner's long `ai_description`/`ai_deal_description` with a short, purpose-written "why it fits" snippet (dedicated scraper field or query-time trim). Dropped because it's redundant with the cross-result summary below — once a query-level summary explains *why* the top match fits, a second per-product AI blurb duplicates that explanation. It was also the only one of the three ideas with a cross-repo dependency (`product_scraper` would need a new column) or a fallback that reproduces the "AI text reads cut off" problem already flagged once for this app. **Decision: `ai_description` is dropped from the top-match banner once the summary ships. `ai_deal_description` ("Prijs inzicht") stays** — it's price-specific insight, not a fit explanation, and isn't superseded by the summary.
- **~~Query filter extraction (Option B)~~ — dropped.** Original idea: LLM parses budget/brand out of the query text and pre-fills the T9 price/brand controls. Dropped after walking through what it would actually add:
  - Brand is already embedded in the vector (see "What to embed" in the decisions log above), so a query like "Sony koptelefoon" already ranks Sony products highly *without* a hard filter — extraction adds no unique value there.
  - Price is the only filter genuinely excluded from the embedding (deliberately — it drifts) — so it's the only case extraction could add real value. But the price slider sits right next to the search box; the friction of "also drag the slider" for an explicit number already in the sentence is small.
  - The cases where extraction *would* meaningfully help ("goedkope oordopjes", "beste soundbar") are vague/implied constraints where the LLM would be **inferring** a number, not extracting one already present — a materially riskier feature (guessing a price ceiling) than what was originally scoped.
  - A genuinely bigger, separate idea surfaced in this discussion — **spec-based filtering** (e.g. `noise_cancelling`, `battery_life`, `water_resistant` from the `specs` JSONB column, rendered today via `components/SpecsTable.tsx`). Not pursued: specs are already folded into the embedding text (same "already in the vector" reasoning as brand), keys are category-dependent (headphones/earbuds/speakers/soundbars each have a different spec vocabulary — no universal schema like price/brand), and value types per key haven't been verified. If revisited, treat as its own feature, not a filter-extraction sub-task.

### C — Cross-result AI summary (remaining Phase 2 item)

A short generated paragraph that reasons *across* the returned products and tailors to the query (e.g. "Van deze resultaten past de Jabra X het best voor sport, en die is nu ook afgeprijsd…"), shown above the result grid. Replaces the dropped concise-copy idea's job of explaining "why this fits" — at the result-set level instead of per-card.

**1. Functional Requirements**
- Triggered only when the search returns ≥1 result (skip on empty/error state)
- One chat-completion call per search, grounded strictly on the returned rows (name/brand/price/in_stock/`ai_description`) — must not invent specs or prices outside that data
- Streams into the UI
- Renders above the result grid, below the search card
- `ai_deal_description` ("Prijs inzicht") stays on the top-match card as-is; `ai_description` is removed from that card once this ships (see dropped-ideas note above)

**2. Non-Functional Requirements**
- Result cards render immediately; the summary streams in independently and must never block card rendering
- Gated behind T12's existing per-IP rate limit and the existing OpenAI monthly cap — no new abuse-protection mechanism

**3. Technical Constraints**
- Chat completion is real cost + latency, unlike v1's embedding-only search — reuse the existing rate limiter, don't build a second one
- Streaming to the client doesn't fit a Server Action cleanly — needs a Route Handler

**4. Architecture Notes**
- New `app/api/search-summary/route.ts` (Route Handler, streams), called client-side after `searchSemantic` resolves — a separate request, not blocking the main search
  - Takes `{ query, results }` in the POST body — the client passes along the results it already has; the route does not re-run the embedding/pgvector search
- Prompt builder in `lib/search-summary.ts`, mirroring `lib/semantic-search.ts`'s placement
- Reuses `checkRateLimit` from `lib/rate-limit.ts` (T12)
- Client guards against a superseded summary response (user re-searches before the previous summary resolves) with both an `AbortController` and a generation counter — see `SemanticSearch.tsx`

**5. Implementation Phases**
1. Non-streaming Route Handler + hardcoded prompt, tested directly (curl)
2. Wire into `SemanticSearch.tsx`, render once complete (no streaming yet); remove `ai_description` from the top-match card
3. Add streaming
4. Rate-limit/cap verification + prompt tuning against hallucination, using a manual test-scenario checklist (same convention as T15)

**6. Risks / Ambiguities**
- ~~Model choice and exact prompt wording not yet decided~~ — resolved: `gpt-4o-mini`, `temperature: 0.3`, grounded strictly on the top result only (name/brand/price/in_stock/`ai_description`) — see `lib/search-summary.ts`. No comparison across results in the summary text (an earlier "mention the runner-up" idea was considered and dropped for grounding-reliability reasons).
- No automated grounding check — relies on prompt instructions + manual spot-checks across several queries
- Streaming architecture (Route Handler, not Server Action) is a real decision baked into the design above, not an implementation detail to revisit casually

**7. Task Breakdown**
- T17 — `lib/search-summary.ts` (prompt builder + non-streaming OpenAI chat completion call)
- T18 — `app/api/search-summary/route.ts` (Route Handler, rate-limited via T12)
- T19 — Wire into `SemanticSearch.tsx`; remove `ai_description` from top-match card, keep `ai_deal_description`
- T20 — Add streaming (client + server)
- T21 — Manual grounding-accuracy checklist (≥5 queries, same convention as T15)

**8. Acceptance Checklist**
- [ ] Summary only shown when ≥1 result
- [ ] No reference to products/specs/prices outside the returned rows (manually verified across ≥5 queries)
- [ ] Doesn't block result-card rendering
- [ ] Rate-limited via the existing T12 gate (same IP bucket, no separate limiter)
- [ ] `ai_description` no longer rendered on the top-match card; `ai_deal_description` ("Prijs inzicht") still is

---

## Phase 3 (later, portfolio-only — no production dependency)

### Python reference implementation of retrieval logic

Currently the query-time retrieval logic (embed query → pgvector cosine search → relevance cutoff → hard filters → ranking) only exists as TypeScript ([lib/semantic-search.ts](../lib/semantic-search.ts)). This project doubles as an AI-engineering/Python portfolio piece, and the user (Python-first, doesn't read TS) can't currently point to or explain this logic in a language they're fluent in.

Moved out of Phase 2 (2026-08-14) — it's an independent portfolio artifact with no dependency on or from this app's production code, so it doesn't need to ship alongside the summary feature above.

**Product Brief:** A documented, non-production Python port of the same retrieval logic, structured as a reusable, config-driven library rather than a hardcoded script — built first as a working piece against this project's real schema, with **no coupling to this app in either direction**.

**1. Functional Requirements**
- Reproduces the same logic as `lib/semantic-search.ts`: 0.55 cosine-distance cutoff, `ivfflat.probes=100`, the T15 category/brand keyword bypass, price/brand hard filters, in-stock-first ordering
- Factored as a config-driven class (e.g. `SemanticSearchEngine`) taking table name, embedding column, filter fields, and relevance cutoff as config — not hardcoded to `products`/`price_history` — so the *pattern* generalizes even though only one catalog uses it today
- Runs against the real DB (read-only) or a documented sample dataset

**2. Non-Functional Requirements**
- Script/notebook + library module only — no hosting, no auth, no deploy pipeline, no always-on process
- Read-only DB access only, reusing the `scraper_readonly` role from T16 — no new credential

**3. Technical Constraints**
- Lives in its own repo, separate from both `price-tracker-web` and `product_scraper`
- **This project will not use it.** `price-tracker-web` keeps its own TypeScript implementation as the real production code; there's no in-process way for a Next.js app to call a Python library, and wiring them together would require a live network call — see the "live traffic" discussion below, which is explicitly deferred, not assumed.

**4. Architecture Notes — "should this ever serve live traffic?" (brainstormed 2026-08-14, decision deferred)**
Four shapes considered, from safest to most "live," **not decided now**:
  1. **Pure reference** — script/notebook only, never touches real traffic. Zero risk, zero hosting; weakest "it's live" claim.
  2. **Isolated demo endpoint** — small standalone service (e.g. FastAPI), publicly reachable, but decoupled from `price-tracker-web`'s request path. Strongest honest "live" claim for the lowest risk to the real product; costs recurring hosting + its own rate-limit/cost-cap story (mirrors T12's problem in a second codebase).
  3. **Shadow traffic** — real queries from this app also get fire-and-forget forwarded to the Python service, logged but not shown to users. Gets "served real production queries" bragging rights, but nothing user-facing to point to, and adds a call-out from the main app's request path.
  4. **Replace the TS path** — Python service becomes the real backend for this app's search. Rejected — same reasoning as the existing "moving live query-time search into `product_scraper`" rejection in the Phase 2 decisions log: turns a portfolio side-project into infrastructure this app's real users depend on.
  - **Current lean, not committed:** if a live version is ever built, #2 (isolated demo endpoint) is the better trade-off than #3/#4 — it can *import* the library from 1, so building the library first is a superset of any of these paths, not a step that has to be redone.

**5. Implementation Phases**
1. Decide/create the repo or notebook location
2. Port embedding generation (`lib/embeddings.ts` equivalent)
3. Port retrieval SQL/logic as the config-driven class (`lib/semantic-search.ts` equivalent)
4. Sanity-check outputs against T15's test queries, compare to the TS version
5. *(Explicitly deferred, not scheduled)* — decide whether to add a live demo endpoint per the options above

**6. Risks / Ambiguities**
- Repo location not yet created/decided
- "Documented reference" thoroughness not specified
- Whether a live endpoint ever gets built is an open, deliberately unscheduled decision — don't assume phase 5 happens

**7. Task Breakdown**
- T22 — Decide/create repo or notebook location
- T23 — Port embedding generation
- T24 — Port retrieval logic as a config-driven class
- T25 — Cross-check against the TS implementation using T15's queries

**8. Acceptance Checklist**
- [ ] Same cutoff/probes/bypass constants as `lib/semantic-search.ts`, explicitly noted as intentionally mirrored
- [ ] Config-driven (table/column/filters/cutoff passed in), not hardcoded to this catalog
- [ ] Read-only DB access only
- [ ] Not imported/called by production code in either repo, and `price-tracker-web` does not call out to it
- [ ] At least one side-by-side output comparison vs. the TS version

## Out of scope

- Semantic search on pages other than homepage
- Embedding regeneration when `ai_description` changes (scraper concern)
- Multi-retailer support
