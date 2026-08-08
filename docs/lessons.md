# Lessons Learned

## Task: T01 — Fix localhost display bug

- **Diagnose before speccing.** T01 was written as "fix tailwind.config.ts content paths" but Tailwind v4 has no `tailwind.config.ts`. A 2-minute codebase read before the interview would have caught this. Next time: explore the stack before writing task descriptions for "fix" tasks.
- **Pre-existing bugs surface during implementation.** The `<ul>` inside `<p>` hydration error and the mobile header overlap were both unrelated to T01 but found during manual testing. Keep a scratch list of incidental bugs while working a task — don't lose them.
- **Dark mode CSS is a silent killer.** A `prefers-color-scheme: dark` block in global CSS will silently invert the whole design on any dev machine in dark mode, with no error or warning. Always check global CSS for system-preference media queries when investigating display discrepancies.

---

## Task: T07 — Product detail page

- **Extract shared formatting helpers early.** `fmt()` and `fmtPct()` (locale decimal separator + conditional decimals) will be needed in T28 (DealCard) and likely other components. When the same helper appears in a second file, move it to a shared util rather than duplicating.

---

## Task: T08 — PriceHistoryChart component

- **SVG text and `preserveAspectRatio="none"` are incompatible.** Fixed font sizes in SVG don't scale with the container. Pattern: SVG for geometry only (paths, lines, rects); position all text labels as HTML elements using `%` coordinates derived from the SVG viewBox (`x / W * 100%`). This works because `preserveAspectRatio="none"` scales linearly in both axes.

- **Timezone-safe date strings.** `new Date().toISOString().slice(0, 10)` shifts the date back one day in UTC+2 (Netherlands). Always build dates with a `localDateStr()` helper (using `getFullYear/getMonth/getDate`), and always parse date strings with `+"T00:00:00"` to force local midnight interpretation.

- **Availability logic: check whether data *extends beyond* the shorter window, not whether it *fills* the longer one.** `data.some(p => p.date < cutoff)` is correct; `data.filter(p => p.date >= cutoff).length >= 2` is always true for new products (all their points fall within any longer window) and is wrong.

- **Label proximity suppression is simpler than calculating label widths.** When axis labels can crowd start/end anchors, suppress any intermediate label within a fixed coordinate threshold (e.g. 70 SVG units out of 800). Cleaner and more robust than trying to measure rendered text width.

---

## Task: T09 — SpecsTable component — SpecsTable component

- **Share the authoritative source schema upfront.** Providing the scraper's `_SPEC_KEYS` dict at the start would have skipped the planning question entirely. When asking Claude to build a mapping component over DB data, hand over the actual key names immediately — don't wait to be asked.

- **Front-load option selection on visual tasks.** Converging through ~8 one-by-one tweaks was slow. Asking for named options and picking one worked well but came too late. Start any visual design exchange by requesting 3–4 options, then iterate from the chosen one.

- **Query JSONB value types before assuming them.** A quick `SELECT DISTINCT specs->>'key'` would have immediately confirmed values are strings ("Ja"/"Nee"), avoiding dead boolean-conversion code that had to be cleaned up in verify.

---

## Task: T12 — Category listing page

- **Cross-reference existing pages when rendering the same field on a new page.** The `in_stock === null` case was already handled correctly in the product detail page. Reading that code first would have caught the gap before implement rather than at verify — a 30-second check avoided a bug.

- **Surfacing display-name open questions pays off.** Asking about Dutch category labels upfront (earbuds → oordopjes) prevented a post-implement fix. For any task that introduces user-facing labels derived from DB slugs, always make the Dutch label mapping an explicit open question in the plan.

- **Design consistency questions belong in planning, not verify.** The inactive product consistency question (detail page exists but product isn't listed) could have become a rework if raised after T12 was done. Asking "are there related pages or surfaces this interacts with?" before implementing is the right habit.

---

## Task: T15 — Deal badge component

- **The threshold question is a design decision, not a code decision — surface it in planning.** "On deal" needed a concrete definition before any code could be written. Deferring it to planning (rather than guessing at `price_diff > 0`) avoided a post-implement rework. Any badge, label, or highlight that signals a business concept needs its threshold defined upfront.
- **Consistency between surfaces matters more than local optimality.** Using the same `price_diff ≥ €25 AND current_price > €100` threshold as the deals page means "Deal" means the same thing everywhere on the site. A lower threshold on the category page would have been technically defensible but confusing to users comparing the two pages.

---

## Task: T16 — Header nav update

- **Audit every existing link before replacing nav.** "Hoe werkt het" was silently dropped because it wasn't in the spec nav table. The right habit: before rewriting a nav component, explicitly list every current destination and ask "where does each one go?" — not just "what does the spec say to add?" The spec is additive; it doesn't always document what to preserve.
- **Mobile header space is a hard constraint — state it as an open question in planning.** Search input + nav links fill the header fast on small screens. For any header task, the planning question should be "what shows on mobile vs desktop?" rather than discovering it at verify.

---

## Task: T22/T23 — Deals page category tabs + brand filter

- **Brand filter was caught at plan time, not during implement — this is the right moment.** Reviewing the plan before approving it is when scope additions are cheapest. A brand filter discovered mid-implement would have required stopping, re-planning, and restarting.
- **Client-side filtering over a bounded dataset preserves ISR.** Fetching all deals server-side and filtering in the browser avoids making the page dynamic, which would bypass `revalidate`. Reusable pattern for any page with interactive filters over a dataset that fits comfortably in memory.
- **Check the view definition before assuming you can add a WHERE clause to it.** `dealpage_topdeals` had `LIMIT 20` embedded — querying it with `WHERE category = $1` would not have removed the cap. Reading the view source first clarified that `deal_candidates` was the right base to query directly.

---

## Task: T21 — Search dropdown UI

- **Sort stability on ranked lists is a product decision — surface it at plan time.** `ts_rank` ties are non-deterministic. Defining tiebreakers (in-stock first, then deal size) required an extra exchange after implement. "What happens when two results score equally?" is a plan-time question for any ranked list.

---

## Task: T19/T20 — Search API route + query function

- **Spec tasks with a direct import dependency are one implementation slice, not two.** T19 imports T20 — implementing T19 without T20 leaves a broken state. At plan time, identify import chains and group them into one slice rather than following spec task numbers blindly.
- **"Which fields to return?" is a technical decision, not a user question.** The right move: look at what the consuming page needs, decide, and state the assumption. Only ask when the decision has a real product tradeoff.
- **`in_stock` gaps surface at verify when they should surface at plan time.** For any API that feeds a UI, listing the fields the consuming page needs is a plan-time checklist item, not a verify-time discovery.

---

## Task: T18 — DB tsvector index

- **"Coordinate with backend" is too vague for a spec task description.** It didn't name the project, causing a clarification round at plan time. Next time: name the exact repo and file path in the spec (e.g. "add migration to `product_scraper/sql/migrations/`").
- **Surface cross-repo ownership at plan time.** Before planning any DB task, ask "which repo owns this?" — one short question saves a rework loop mid-implementation.
- **Catch local ≠ prod gaps before they block verification.** The local DB missing most data would have broken T19/T20 verification if not surfaced now. When a task depends on DB state, confirm early whether local and prod are in sync.

---

## Task: T26/T27 — Sitemap update + Google Search Console submission

- **Deploy before submitting to Google Search Console.** Submitting a sitemap before the changes are live serves Google an outdated file. The right order is always: commit → deploy → submit.
- **"Page with redirect" in Search Console is not a bug.** The bare domain redirecting to www (or vice versa) will always show as a redirect and will never be "indexed" — the destination URL is what gets indexed. No action needed.
- **Request manual indexing for important new URLs via the URL Inspection tool.** Submitting the sitemap tells Google the URLs exist; requesting indexing directly queues them for crawling within days rather than waiting for the regular crawl cycle.

---

## Task: T25 — generateMetadata on all new pages

- **Audit for pre-existing metadata before treating a task as net-new.** Most pages already had `metadata` exports — the real work was one missing page. A 30-second grep at the start would have scoped the task immediately instead of discovering it mid-plan.
- **`pg` `numeric` columns return as strings at runtime — coerce with `Number()` before `.toFixed()`.** TypeScript types say `number` but the runtime value is a string. Silent crash at render time. Any new call to `fmt()` or arithmetic on a DB value needs `Number()` wrapping.
- **Copy iteration is faster with named options and a concrete rendered example.** Showing three labelled options with real output resolved the description question in one exchange — versus one-change-at-a-time iteration which takes many rounds.

---

## Task: T29 — Mobile filter FAB

- **Settle label copy precisely in the DoD.** "Filter count vs product count" and "always show vs conditional" were decided across 3+ turns after implementation started. Both belong in the DoD discussion, not post-verify back-and-forth.
- **When using a count variable, trace its derivation chain.** `displayed.length` looked right but was capped at 50, causing FAB/page inconsistency on the Alle tab. Before picking a count variable, ask: "has this been sliced, capped, or transformed relative to what the user expects?"
- **CLAUDE.md rules are most useful when applied at implement time, not verify time.** `whitespace-nowrap` was missed during implementation and caught only at verify. A quick "does every new pill/badge have `whitespace-nowrap`?" check while coding avoids the rework.

---

## Task: T17 — Products overview page

- **Pill badges must use `whitespace-nowrap` — always.** A badge that wraps its text loses its shape and stretches to fill the container. Add `whitespace-nowrap` by default to every pill/badge span.
- **`self-start` alone doesn't reliably constrain flex children — pair with `items-start` on the parent.** `inline-flex` + `self-start` can behave inconsistently. The reliable pattern: `items-start` on the `flex-col` parent constrains all children to their natural width.
- **Image selection for representative thumbnails is a data/design decision — surface it in planning.** "Which product image represents the category?" has real UX implications (most expensive → stable flagship; biggest deal → changes constantly). Raising it before implementation saved a post-implement discussion.

---

## Task: T1–T3 — AI product descriptions on product page

- **Rendered mockups beat prose for look-and-feel calls.** Showing the deal box as 4 rendered options (colors, icons, AI badge in context) let the choice land in one message — far faster than describing colors or iterating live on the real page. Render, don't describe, when the decision is visual.
- **Pin "no value" semantics before building a display on a scraper field.** The empty-string vs `NULL` edge case surfaced in verify, not planning, because the spec only said "non-null." For scraper-written text fields, ask up front how "no value" is stored (`NULL` vs `""`) and guard with a trimmed check.
- **Small explicit forks avoid silent rework.** The lucide-react-vs-inline-SVG question was a genuine dependency decision — a quick confirm was cheaper than guessing and being told to undo it.
- **Data-first slicing paid off.** Doing T1 (query + type) before T2/T3 (UI) meant each slice typechecked independently, and the later redesign rode entirely on the UI layer without touching `lib/products.ts`.

---

## Task: T30 — Price filter on category pages + deals page

- **Scope grows naturally in design-decision tasks — that's fine, catch it at the question stage.** T30 named "category pages" only, but discussing bucket-vs-min/max naturally surfaced the deals page gap. Asking "what about X?" before implementing kept it one clean slice instead of a follow-up task.
- **Category-relative bucket ranges are a real trap.** Fixed price buckets (`<€50`, `€200+`) look reasonable until you remember a €30 earbud category and a €1500 soundbar category can't share one scale. Any preset/bucket UI over a numeric field that varies by category should default to suspicion, not to buckets.
- **Reusing one filter component across two pages kept the diff small and consistent.** The same `PriceFilter` component was wired into both `CategoryProductGrid` and `DealsFilter`, mirroring `BrandFilter`'s existing reset-on-tab-change and cap-disabling pattern rather than inventing a new one.

---

## Task: T6/T7/T11 — Semantic search backend (embeddings, pgvector query, brand options)

- **Verifying vector search against real data caught a silent, feature-breaking bug no type-check would.** Running actual queries during verify exposed `maxPrice=100` returning 0 of 170 matching products — pgvector's IVFFlat default `probes=1` under-recalls the moment a hard filter is applied (it filters *after* scanning ~1% of vectors). For approximate-index + filter combos, "it compiles and returns some rows" is not verification; check recall against ground-truth counts.
- **The hard part was a data-modeling distinction, not code: the vector encodes *semantics*, price/brand are *facts*.** Naming that fork early — facts need an explicit source (UI controls), not the embedding or the query text — set the whole design and let LLM query-parsing be deferred cleanly as phase 2. Settling it before writing code avoided building the wrong thing.
- **Reused existing DB fields (`ai_description`/`ai_deal_description`) for the "AI recommendation" feel instead of a per-search LLM call.** Inventorying what the pipeline already produces beat adding cost, latency, and hallucination risk. Check for existing assets before reaching for a new API.
- **Calibrated magic numbers on measured data, not guesses.** Sampling real query distances (0.35–0.45 relevant vs 0.6+ off-topic) turned the `0.55` relevance cutoff from arbitrary into defensible — and surfaced the honest-empty-state win: off-topic searches now return nothing instead of unrelated products.

---

## Task: T8/T9/T10/T13 — Semantic search UI (Server Action, component, homepage wiring, UX polish)

- **A working dev server is a testing prerequisite that's easy to silently invalidate.** Two separate "it errors and I don't know why" moments turned out to be stale process environment, not code bugs: `OPENAI_API_KEY` added after `npm run dev` was already running (Next only reads `.env.local` at process start), and Norton's HTTPS-interception CA cert missing from the dev server's environment. Check the server's actual environment before assuming the code is broken.
- **Design mockups upfront prevented a full redesign later.** Rendering the three top-match layout options as an actual visual mockup (not prose) let the banner decision get made once, correctly — later UI feedback (icon, Enter-to-search, full text) was refinement, not scrap-and-redo.
- **"Truncate for tidiness" was the wrong default — should have asked, not assumed.** Line-clamping `ai_description`/`ai_deal_description` to look tidy in the mockup directly contradicted user preference once seen live (cut-off text reads as broken, not clean). Treat truncation of user-facing copy as a design choice to confirm, not an implementation detail to just pick.
- **Screenshot/zoom capture can silently fail mid-session while the app underneath is fine.** When visual tools time out, DOM inspection via `javascript_tool` (measuring `scrollHeight`/`clientHeight`, computed styles) is a reliable fallback for verifying layout facts without a picture.

---

## Task: T12 — Semantic search rate limiting

- **"Avoid new dependencies" is not license to repurpose shared infrastructure for something it wasn't designed for.** Choosing to store rate-limit counters in the production Postgres DB (to avoid adding Redis as a dependency) put unrelated, high-write-frequency app-operational data into a database meant purely for scraped product data — and the app turned out to have full DDL/write access to it, so nothing technical stopped that. Architectural/infra tradeoffs need explicit confirmation even in NORMAL mode; "no new dependency" is a default, not a rule that overrides asking.
- **A working credential can be silently over-scoped, and only shows up when you push on it.** `DATABASE_URL` granting `CREATE`/`DROP` to a "read-only frontend" app was invisible until an ad-hoc table creation just succeeded. Worth asking "what can this connection string actually do?" for shared/production credentials, not assuming least privilege.
- **A permanent env var (`setx`) only applies to processes launched after the change — not to new tabs in an already-open terminal app.** Restarting `npm run dev` in a "new terminal" that was really a new tab in an already-running terminal application didn't pick up the updated `NODE_EXTRA_CA_CERTS`; the terminal application itself needed a full relaunch. When a "set it permanently" fix doesn't take effect, check whether the parent process needs restarting, not just the shell command.
- **Temporarily lowering a threshold made live verification fast and cheap.** Testing the rate limiter at a limit of 3 instead of 20 turned a 21-request verification into a 4-request one — same code path, same confidence, far less real API usage. Worth doing for any threshold/limit feature.

---

## Task: T15/T16 — Relevance-cutoff keyword bypass + least-privilege DB role

- **Rotating/swapping a shared credential needs a "who else uses this?" check before it's actually done.** Swapping `DATABASE_URL` to `scraper_readonly` was a clean win for this app, but the old full-access credential is also used by `product_scraper` — something only surfaced when Vercel flagged the old value for rotation. Ask about other consumers before declaring a credential change complete, not after.
- **A Vercel env var change isn't live until a redeploy happens — this bit us twice.** `DATABASE_URL` (T16) and `OPENAI_API_KEY` both needed an explicit redeploy after being added/changed in the dashboard; the missing `OPENAI_API_KEY` redeploy is what caused "AI search stuck forever" in production. Mirrors the local-dev rule (restart `npm run dev` after `.env.local` changes) but for prod, and wasn't written down anywhere.
- **An `await` on a Server Action with no `try/catch` on the client leaves the UI stuck in a loading state forever if the action itself throws** (vs. returning its own `{error}`). Silent — no console error visible to the user, no timeout — until diagnosed by reading the code. Worth checking other Server Action call sites for the same gap.
- **Splitting manual QA between "verify the core regression case live, hand the rest of the checklist to the user" worked well** once browser automation started hitting friction (stale element refs after a layout shift). For a 12-row checklist, that division was faster and more reliable than fighting automation on every row.

---

## Task: T32/T37 — DealCard redesign + secondary link, CTA restyle

- **`SELECT * FROM other_view` views don't inherit new columns added to their source later** — Postgres bakes the column list in at `CREATE` time. Adding `slug` to `deal_candidates` never propagated to `homepage_topdeals`/`dealpage_topdeals`, which silently kept serving the old shape. TypeScript didn't catch it (the `Deal` type just claimed `slug: string`); only browser verification did, as `/soundbars/undefined`. Any future column added to a base view needs its dependent `SELECT *` views explicitly re-created.
- **In-browser verify after every code change, not just at the end, is what caught the broken slug link** — it would have shipped invisibly if verification only happened once at final wrap-up.
- **Pushing back on "why not just X" (rejecting a consistency-only justification and asking for a genuine blue-vs-black opinion) surfaced a real hierarchy argument** (contrast against bold black text/pricing already on the card) instead of a weaker "because it's already there" answer.
- **Iterating narrowly on one sub-element at a time (savings pill → wording → CTA color) worked better than trying to lock the whole card design in one pass** — each round was a cheap mockup + short exchange, and it compounded into a more considered final design than one big option set up front would have.

---
