# TechTracker.nl — Frontend Spec v1.0

_Last updated: 2026-05-22_

---

## 1. Product Brief

TechTracker.nl is a Dutch deal-finder for consumer audio products (headphones, earbuds, speakers, soundbars). The backend scraper tracks daily prices across all four categories from Coolblue. The primary user goal is to spot a deal and click through to buy. The secondary goal is product discovery — browsing a category, researching a specific model, and reviewing price history before deciding.

**Primary CTA on every page:** affiliate link to Coolblue.

**Target user:** returning Dutch audio enthusiast who checks the site regularly for deals on specific brands or product types.

**Language:** Dutch (English support deferred).

---

## 2. Functional Requirements

### 2.1 Homepage (`/`)
- Hero section with top deals (all categories combined, sorted by biggest absolute discount)
- Top 3 deals displayed, each as a deal card with single CTA → Coolblue affiliate link
- "Browse by category" section with four category cards linking to `/headphones`, `/earbuds`, `/speakers`, `/soundbars`
- Only active products (`is_active = true`, `in_stock = true`) shown

### 2.2 Deals page (`/deals`)
- Filter tabs: Alle | Headphones | Earbuds | Speakers | Soundbars
- Default tab: Alle
- Top 50 deals on Alle tab (cap lifted when brand filter is active); all deals shown on category tabs. Sorted by biggest absolute discount (€).
- Brand filter: narrows results within the active tab; resets on tab change.
- Spec filters: category-specific boolean/enum filters derived from the JSONB specs column (e.g. "Noise Cancelling" toggle on Headphones/Earbuds tab); hidden on the "Alle" tab
- Deal card contains: product image, product name, old price, new price, discount amount, CTA → Coolblue affiliate link
- Secondary "Bekijk product" link on deal card → `/{category}/{slug}` product detail page
- Only active, in-stock products shown
- Data sourced from `dealpage_topdeals` DB view (filtered by category when tab selected)

### 2.3 Category pages (`/headphones`, `/earbuds`, `/speakers`, `/soundbars`)
- Lists **all active products** in that category (not deals only)
- Each product card links to its product detail page (`/{category}/{slug}`)
- Products currently on deal are visually highlighted (e.g. deal badge)
- Brand filter: filter product list by brand (e.g. Sony, Bose, JBL)
- Spec filters: category-specific boolean/enum filters derived from the JSONB specs column (e.g. "Noise Cancelling" toggle for headphones/earbuds, "Draadloos" for speakers); derived at runtime from the available spec keys in the product list
- Sort options: biggest discount, price low→high, price high→low
- Inactive products excluded

### 2.4 Product detail pages (`/{category}/{slug}`)
- URL pattern: `/{category}/{slug}` (e.g. `/headphones/sony-wh-1000xm5`)
- Prominent "Bekijk bij Coolblue" affiliate CTA button
- Product name, brand, current price, old price, discount amount
- Deal badge (🏷️ Deal) when `price_diff ≥ €25` AND `current_price > €100` — same threshold as category page badge
- In-stock indicator
- Specs section — display JSONB specs blob, keyed by category (e.g. driver size, noise cancellation for headphones)
- Lowest-price-ever indicator — show "Laagste prijs ooit" label + the all-time low price derived from price history; highlight when current price equals (or is within a small threshold of) that low
- Price history chart — 30/60/90 day toggle, line chart of daily price; periods without sufficient data are disabled
- No retailer description (copyright risk)
- **Inactive product handling:** if product is inactive, show "Dit product is niet meer beschikbaar" notice + price history (still valuable) + "Bekijk vergelijkbare producten" link to the category page

### 2.5 Products overview page (`/products`)
- Four category cards: Headphones, Earbuds, Speakers, Soundbars
- Each links to the respective category page
- Brief description per category (e.g. number of products tracked)

### 2.6 Search
- Accessible from the header (search icon or input)
- Client-side triggered, queries `/api/search?q=` route handler
- Searches product name and brand using Postgres full-text search (`tsvector`)
- Results link to `/{category}/{slug}` product detail pages
- Searches active products only
- Index: `to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(brand,''))` with GIN index `idx_products_fts`. Query with `to_tsquery('simple', $1)` using per-token `:*` prefix matching. Results ordered by `ts_rank DESC`, in-stock first, then `price_diff DESC`.

### 2.7 Navigation
| Label | Destination |
|---|---|
| Deals | `/deals` |
| Producten | `/products` |

Logo links to `/` (home). Over ons (`/about`) and Hoe werkt het (`/how-it-works`) are linked from the footer, not the primary nav.

Search input visible in header on desktop; hidden on mobile — accessible via a search icon in the header that expands an inline input (or slides a search bar into view below the header).

---

## 3. Non-Functional Requirements

- **Performance:** ISR with 5-minute revalidation on all data-heavy pages (homepage, deals, category pages). Product pages revalidate on the same cycle.
- **SEO:** All pages listed in section 2 are indexable. Auto-generated `<title>` and `<meta description>` via Next.js `generateMetadata()` for product, category, and deals pages.
- **Inactive products:** never appear in any listing. Product detail pages for inactive products render gracefully (no 404). This is intentional — inactive pages exist to handle old bookmarks and inbound links (e.g. from Google) without serving a 404, not for active discovery. The detail page shows a "Niet meer beschikbaar" notice and links back to the category page. The inconsistency (page exists but isn't listed) is acceptable given this rationale.
- **Localhost parity:** all pages must render correctly in local development with real data. Tailwind content paths must be verified to fix known dev/prod display discrepancy.
- **Affiliate links:** all Coolblue links open in a new tab with appropriate `rel="noopener noreferrer"`.
- **GDPR:** no user data collected beyond Google Analytics. Price alert functionality (future) will require explicit consent flow.

---

## 4. Technical Constraints

- No new npm dependencies without justification
- No breaking changes to existing DB views (`deal_candidates`, `dealpage_topdeals`, `homepage_topdeals`)
- No user accounts or authentication in this spec
- Extend current design system (Tailwind classes, existing components, color palette)
- No API layer except one route handler for search (`/api/search`)
- Direct Postgres via `pg` driver for all server component data fetching
- Deployed on Vercel; no infrastructure changes required

---

## 5. Architecture Notes

### URL structure
```
/                          → homepage
/deals                     → deals page (all categories, with tabs)
/products                  → category overview
/{category}                → category listing (e.g. /headphones)
/{category}/{slug}         → product detail (e.g. /headphones/sony-wh-1000xm5)
/api/search?q=             → search route handler (client-side)
```

### Data fetching pattern
- Server components query Postgres directly for all page-level data
- `/api/search` is the only route handler — accepts `q` param, returns JSON array of matching products
- Search uses Postgres `tsvector` on `name` + `brand` columns (index to be added if not present)
- Price history chart fetches from a new server component prop or dedicated query function in `lib/`

### Key new query functions (to add in `lib/`)
| Function | Query | Used by |
|---|---|---|
| `getProductsByCategory(category)` | All active products in category | Category pages |
| `getProductBySlug(category, slug)` | Single product with specs | Product detail page |
| `getPriceHistory(productId, days)` | Daily prices for chart | Product detail page |
| `searchProducts(query)` | Full-text search | `/api/search` |

### Localhost fix
- Verify `tailwind.config.ts` content paths include all `app/**` and `components/**` directories
- Add `.env.local` with `DATABASE_URL` pointing to production DB (read-only connection string) or a seeded local DB

### Inactive products
- Filtering handled in DB views for listings (already in place)
- Product detail page checks `is_active` field and renders notice if false
- "Vergelijkbare producten" on inactive page = link to `/{category}` page

---

## 6. Implementation Phases

### Phase 1 — Foundation fixes (no new pages)
1. Fix Tailwind content path config so localhost renders correctly
2. Add `.env.local` setup instructions (or seed script) for local DB access
3. Add `category` and `slug` fields to existing deal queries
4. Verify inactive products are excluded from all existing views

### Phase 2 — Product detail pages
1. Add query functions: `getProductBySlug`, `getPriceHistory`
2. Build `/{category}/[slug]/page.tsx` with product info + specs + affiliate CTA
3. Build price history chart component (60/90 day toggle)
4. Handle inactive product state on detail page

### Phase 3 — Category pages
1. Add `getProductsByCategory` query function
2. Build `/[category]/page.tsx` with product grid
3. Add brand filter (client-side, from product list)
4. Add sort options (client-side)
5. Deal badge on products currently on deal

### Phase 4 — Navigation & products overview
1. Update `Header.tsx` with new nav structure
2. Build `/products/page.tsx` with four category cards
3. Add search input to header

### Phase 5 — Search
1. Add `tsvector` index on `products` table (migration or DB-side)
2. Build `/api/search` route handler
3. Wire up search UI in header (input → results dropdown or results page)
4. Mobile search: search icon in header expands inline input on tap

### Phase 6 — Deals page update
1. Add category filter tabs to `/deals`
2. Update deal queries to support per-category filtering
3. Add "Browse by category" section to homepage

### Phase 8 — UX enhancements
1. Mobile search bar in header
2. Lowest-price-ever indicator on product detail page
3. Spec-based filters on category pages and deals page

### Phase 7 — SEO & meta
1. Add `generateMetadata()` to all new pages
2. Verify sitemap includes new URL patterns
3. Submit updated sitemap to Google Search Console

---

## 7. Risks & Ambiguities

| Risk | Likelihood | Mitigation |
|---|---|---|
| ~~Tailwind dev/prod display bug~~ | ~~Medium~~ | Resolved: dark mode media query in `globals.css` caused color inversion on dark-mode dev machines. Fixed in T01. |
| `specs` JSONB schema varies per category | High | Build a per-category specs renderer; gracefully skip unknown keys |
| Coolblue affiliate link format unknown | Low | Confirm link format before Phase 2 ships |
| Full-text search quality on Dutch product names | Medium | Test with real queries; fall back to `ILIKE` if `tsvector` gives poor results |
| `dealpage_topdeals` view not filterable by category | Medium | Check view definition; may need a new parameterized query instead |
| Price history gaps (product not scraped every day) | Low | Chart handles sparse data gracefully (no line between gaps) |
| Homepage becomes too dense/slow with added product rows | Medium | Decide final layout (placement, product count per category, whether "Browse by category" cards are replaced or kept) before implementing T38 |

---

## 8. Task Breakdown

| ID | Phase | Task | Done |
|---|---|---|---|
| T01 | 1 — Foundation | Fix localhost display bug — remove dark mode media query and dead font variables from `globals.css` | ✅ |
| T02 | 1 — Foundation | Document `.env.local` setup in README | ✅ |
| T03 | 1 — Foundation | Add `category` and `slug` fields to existing deal queries | ✅ |
| T04 | 1 — Foundation | Verify DB views exclude inactive products | ✅ |
| T05 | 2 — Product pages | `lib/products.ts` — `getProductBySlug(category, slug)` | ✅ |
| T06 | 2 — Product pages | `lib/products.ts` — `getPriceHistory(productId, days)` | ✅ |
| T07 | 2 — Product pages | `app/[category]/[slug]/page.tsx` — product detail page | ✅ |
| T08 | 2 — Product pages | `components/PriceHistoryChart.tsx` — line chart with 60/90 toggle | ✅ |
| T09 | 2 — Product pages | `components/SpecsTable.tsx` — per-category specs renderer | ✅ |
| T10 | 2 — Product pages | Inactive product notice + category link | ✅ |
| T11 | 3 — Category pages | `lib/products.ts` — `getProductsByCategory(category)` | ✅ |
| T12 | 3 — Category pages | `app/[category]/page.tsx` — category listing page | ✅ |
| T13 | 3 — Category pages | `components/BrandFilter.tsx` — client component | ✅ |
| T14 | 3 — Category pages | `components/SortSelect.tsx` — client component | ✅ |
| T15 | 3 — Category pages | Deal badge component | ✅ |
| T16 | 4 — Nav & overview | Update `components/Header.tsx` — new nav + search input | ✅ |
| T17 | 4 — Nav & overview | `app/products/page.tsx` — category overview page | ✅ |
| T18 | 5 — Search | DB: add `tsvector` index (coordinate with backend) | ✅ |
| T19 | 5 — Search | `app/api/search/route.ts` — search route handler | ✅ |
| T20 | 5 — Search | `lib/search.ts` — `searchProducts(query)` | ✅ |
| T21 | 5 — Search | Search results UI (dropdown or `/search?q=` page) — note: API does not return `in_stock`; add to `searchProducts` if out-of-stock indicator is needed | ✅ |
| T22 | 6 — Deals update | Add category tabs to `app/deals/page.tsx` | ✅ |
| T23 | 6 — Deals update | Update `lib/deals.ts` to support category filter param | ✅ |
| T24 | 6 — Deals update | Add "Browse by category" section to `app/page.tsx` homepage | ✅ |
| T25 | 7 — SEO | `generateMetadata()` on all new pages | ✅ |
| T26 | 7 — SEO | Verify/update `sitemap.xml` generation | ✅ |
| T27 | 7 — SEO | Google Search Console submission | ✅ |
| T28 | 1 — Foundation | `components/DealCard.tsx` — use Dutch comma separator for percentage display (`-29,9%`) | ✅ |
| T29 | 3 — Category pages | Mobile filter UX on category pages — sticky/floating brand filter access or back-to-top button so users can re-filter after scrolling down | ✅ |
| T30 | 3 — Category pages | Price filter on category pages and deals page — client-side min/max inputs (`components/PriceFilter.tsx`), chosen over preset buckets since price ranges vary heavily by category | ✅ |
| T31 | 8 — Dev tooling | `product_scraper/scripts/refresh_local_db.sh` — dump subset of prod into local DB to keep local in sync | ✅ |
| T32 | 6 — Deals update | DealCard redesign — replaced blue "Bespaar" box with a single green pill (`Bespaar €X (Y% korting)`) + 30-day caption line; restructured card from a single outer `<a>` to a `div` with two distinct stacked CTAs: primary blue button "Bekijk bij Coolblue" (+ external-link icon) → affiliate URL, secondary underlined text link "Bekijk productinfo" → `/{category}/{slug}`; same external-link icon added to the product detail page's Coolblue button for consistency | ✅ |
| T33 | 7 — SEO | Improve website copy for SEO — rescoped inconsistent "tech" wording to "audio" across about/how-it-works/terms/footer; rewrote /about (new positioning "Wij zoeken de beste audio deals voor jou") and /how-it-works (7-question Q&A structure) with fixed grammar/typo bugs; added "prijsgeschiedenis" keyword to homepage hero + tile; enriched /products, homepage, and /[category] pages with shared per-category descriptions (new lib/categories.ts, replacing 3x duplicated data); reworded /deals subtext; fixed h2/h3 heading-hierarchy bugs on homepage and CategoryCard; confirmed product detail page metadata/labels already strong (no changes needed) | ✅ |
| T34 | 8 — UX | Mobile search bar — search icon in header expands inline input on tap (desktop input unchanged); close on Escape or outside tap | ⬜ |
| T35 | 8 — UX | Lowest-price-ever indicator on product detail page — query all-time low from price history, show "Laagste prijs ooit: €X" label; highlight when current price ≤ all-time low (or within threshold TBD) | ⬜ |
| T36 | 8 — UX | Spec-based filters on category pages and deals page — category-specific boolean/enum toggles from JSONB specs (e.g. Noise Cancelling for headphones/earbuds); plan which spec keys to expose per category before implementing | ⬜ |
| T37 | 8 — UX | Make deal card text selectable — resolved via T32's card restructure: outer `<a>` replaced with a `div` wrapping two separate, explicit CTA links (no stretched-link overlay needed) — text is selectable since it's no longer nested inside a single anchor | ✅ |
| T38 | 8 — UX | Homepage layout — add per-category preview rows (3–4 products per category: Headphones, Earbuds, Speakers, Soundbars) to increase product visibility on `/`. Placement/layout TBD — options include replacing the "Browse by category" link-cards with product previews, adding rows below the hero, or a tabbed/carousel layout; decide before implementing | ⬜ |
| T39 | 1 — Foundation | Cleanup: remove dead `getDealpageDeals()` (`lib/deals.ts`) and the `dealpage_topdeals` DB view (coordinate removal with `product_scraper`) — unused since `/deals` moved capping logic into `DealsFilter.tsx` (T22/T23); discovered during T32 when the view was found missing the `slug` column | ⬜ |

---

## 9. Acceptance Checklist

- [ ] All pages render correctly on localhost with real data (no missing styles or layout breaks)
- [ ] All pages deployed and accessible on techtracker.nl
- [ ] Inactive products do not appear in any listing
- [ ] Product detail pages exist at `/{category}/{slug}` with specs and price history chart
- [ ] Category pages list all active products with brand filter and sort
- [ ] Deals page has working category filter tabs, defaults to "Alle"
- [ ] Search returns relevant results and links to correct product pages
- [ ] All Coolblue links are affiliate links opening in new tab
- [ ] `generateMetadata()` produces correct titles and descriptions on product and category pages
- [ ] Google Search Console shows new URLs being indexed (within ~2 weeks of deploy)

---

## Backlog (out of scope for this spec)

- Price alerts (email notification when product drops below target price)
- "Deal of the day" homepage highlight
- Brand filter on category pages _(moved to Phase 3 — in scope)_
- Sorting options on category pages _(moved to Phase 3 — in scope)_
- English language support
- User accounts / saved products
- Multi-retailer support (backend column exists; frontend deferred)
- Social sharing buttons on product pages
- Multi-retailer inactive handling: if a product becomes inactive at one retailer but is still available at another, the "niet meer beschikbaar" notice is misleading — revisit when multi-retailer support is added
- Full search results page (`/search?q=`) — T21 builds dropdown only; a dedicated results page with pagination or "load more" is deferred
