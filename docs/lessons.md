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

## Task: T17 — Products overview page

- **Pill badges must use `whitespace-nowrap` — always.** A badge that wraps its text loses its shape and stretches to fill the container. Add `whitespace-nowrap` by default to every pill/badge span.
- **`self-start` alone doesn't reliably constrain flex children — pair with `items-start` on the parent.** `inline-flex` + `self-start` can behave inconsistently. The reliable pattern: `items-start` on the `flex-col` parent constrains all children to their natural width.
- **Image selection for representative thumbnails is a data/design decision — surface it in planning.** "Which product image represents the category?" has real UX implications (most expensive → stable flagship; biggest deal → changes constantly). Raising it before implementation saved a post-implement discussion.

---
