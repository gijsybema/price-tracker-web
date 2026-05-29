# Lessons Learned

## Task: T01 — Fix localhost display bug

- **Diagnose before speccing.** T01 was written as "fix tailwind.config.ts content paths" but Tailwind v4 has no `tailwind.config.ts`. A 2-minute codebase read before the interview would have caught this. Next time: explore the stack before writing task descriptions for "fix" tasks.
- **Pre-existing bugs surface during implementation.** The `<ul>` inside `<p>` hydration error and the mobile header overlap were both unrelated to T01 but found during manual testing. Keep a scratch list of incidental bugs while working a task — don't lose them.
- **Dark mode CSS is a silent killer.** A `prefers-color-scheme: dark` block in global CSS will silently invert the whole design on any dev machine in dark mode, with no error or warning. Always check global CSS for system-preference media queries when investigating display discrepancies.

---

## Task: T07 — Product detail page

- **Extract shared formatting helpers early.** `fmt()` and `fmtPct()` (locale decimal separator + conditional decimals) will be needed in T28 (DealCard) and likely other components. When the same helper appears in a second file, move it to a shared util rather than duplicating.

---
