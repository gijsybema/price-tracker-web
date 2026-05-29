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
