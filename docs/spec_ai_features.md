# SPEC: AI Features

**Status:** Approved (pending scraper spec)
**Features:** F1 — AI product descriptions · F2 — Semantic search

---

## Task overview

| Done | Task | Feature | Description |
|---|---|---|---|
| ✅ | T1 | F1 | Extend `getProductBySlug` query and `Product` type with `ai_description` and `ai_deal_description` |
| ✅ | T2 | F1 | Display `ai_deal_description` inside price block (between badges and CTA button) |
| ✅ | T3 | F1 | Display `ai_description` in new section between price block and price history chart |
| ⬜ | T4 | F2 | Manual DB setup: enable pgvector, add `embedding` column, add IVFFlat index (Railway console) |
| ⬜ | T5 | F2 | Add `openai` npm package and `OPENAI_API_KEY` to `.env.local` |
| ⬜ | T6 | F2 | Create `lib/embeddings.ts` — `generateEmbedding()` using OpenAI `text-embedding-3-small` |
| ⬜ | T7 | F2 | Create `lib/semantic-search.ts` — pgvector cosine similarity query returning `SearchResult[]` |
| ⬜ | T8 | F2 | Create `app/actions/semantic-search.ts` — Server Action wrapping T6 + T7 |
| ⬜ | T9 | F2 | Create `components/SemanticSearch.tsx` — textarea input, loading state, result cards |
| ⬜ | T10 | F2 | Wire `SemanticSearch` into `app/page.tsx` below hero, above top deals |

---

## Decisions log

| # | Decision | Rationale |
|---|---|---|
| Embedding provider | OpenAI `text-embedding-3-small` (1536 dims) | Cheap (<€0.01 for 800 products), reliable, good multilingual quality |
| Embedding generation | Scraper repo (Python) | Scraper already generates ai_description/ai_deal_description; embeddings belong in the same pipeline |
| Query-time embedding | This repo (`lib/embeddings.ts`) | Web app must embed user queries at search time |
| What to embed | name + brand + category + ai_description + specs as key/value text + price tier | Rich signal for audio product semantic matching |
| Query-time filter extraction | Not implemented | Avoids LLM latency per search; hard SQL filters suffice |
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
export async function semanticSearch(
  embedding: number[],
  limit = 10
): Promise<SearchResult[]>
```

SQL pattern — same LATERAL join structure as `getProductsByCategory`:

```sql
SELECT
  p.id, p.name, p.brand, p.category, p.slug, p.image_url,
  ph.price        AS current_price,
  ph.availability AS in_stock,
  p30.high_30d,
  p30.high_30d - ph.price                                        AS price_diff,
  ROUND(((p30.high_30d - ph.price) / p30.high_30d * 100)::numeric, 1) AS drop_percentage
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
ORDER BY p.embedding <=> $1::vector
LIMIT $2
```

Embedding passed as `[${embedding.join(',')}]` with `::vector` cast.
Returns `SearchResult[]` — same type already used by FTS search.

---

### T8 — `app/actions/semantic-search.ts`

New file. Server Action wrapping T6 + T7.

```ts
"use server";

export async function searchSemantic(
  query: string
): Promise<{ results: SearchResult[]; error?: string }>
```

- Validates input: min 3 chars, max 500 chars
- Calls `generateEmbedding(query)` → `semanticSearch(embedding, 10)`
- Returns results or error string

---

### T9 — `components/SemanticSearch.tsx`

New client component (`"use client"`).

**Input:**
- `<textarea>` (not `<input>`) — allows multi-line natural language queries
- Placeholder: `"Beschrijf wat voor product je zoekt, inclusief functies en budget. Bijv: 'draadloze koptelefoon voor sport onder €100'"`
- Submit button: "Zoek met AI"

**States:**

| State | UI |
|---|---|
| Idle | Textarea + button; no results |
| Loading | Spinner + "Zoeken…"; button disabled |
| Results | Grid of product cards (up to 10) |
| Empty | "Geen resultaten gevonden. Probeer een andere omschrijving." |
| Error | "Er is iets misgegaan, probeer het opnieuw." |

**Result cards:** same Tailwind card pattern as `CategoryProductGrid` product cards — image, name, brand, price, deal badge if applicable. Cards link to `/{category}/{slug}`.

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

**F2** (T4 DB steps can start immediately; T6–T10 require T4 + T5; end-to-end testing requires scraper to have run):
- T4 (manual DB) → T5 → T6 → T7 → T8 → T9 → T10

---

## Out of scope

- Semantic search on pages other than homepage
- LLM-based query parsing / structured filter extraction from natural language
- Embedding regeneration when `ai_description` changes (scraper concern)
- Multi-retailer support
