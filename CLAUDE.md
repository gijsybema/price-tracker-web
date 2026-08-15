# CLAUDE.md

## Core Rules
- In FULL mode: always plan before coding and wait for explicit approval before implementing
- In NORMAL mode: plan is optional — if the task is clear, proceed directly to implementation; do not wait for approval between steps
- In NORMAL mode, "proceed directly to implementation" does not cover architectural or infrastructure choices — new dependency vs. reusing existing/shared infra, where data is stored, credential/permission scope. Surface these as an explicit question before implementing, the same way threshold/state-transition decisions already require one short clarifying exchange
- Work in small, clearly defined steps — never implement more than one task or slice at a time
- Keep changes minimal and focused; do not modify unrelated files
- Read the exact task description before implementing — do not infer fields or requirements from nearby context in the spec
- Ask for clarification if requirements are unclear
- Be explicit about assumptions and decisions

## Working Style
- Follow existing architecture and patterns
- Reuse existing components where possible
- Do not refactor or rename unless necessary
- Avoid unnecessary complexity or over-engineering
- Avoid introducing new dependencies unless justified
- Do not expand scope beyond the current task
- Preserve backward compatibility unless explicitly told otherwise
- Consider edge cases, validation, error handling, security, privacy, and performance
- Add tests only when directly relevant
- Add comments only when they improve clarity
- Before implementing any task involving a state change or status transition: map all consumers/readers of that state first, and surface threshold and policy questions (when does the transition trigger? how many times?) before writing any code — one short clarifying exchange is cheaper than a full rewrite
- When a task involves side effects, do not start immediately after confirmation — pause and explicitly verify assumptions before proceeding
- Never modify spec files like `docs/spec.md` without explicit user confirmation; always show proposed changes and wait for approval
- Do not mark tasks done in `docs/spec.md` during implementation; only mark them done at wrap-up or on explicit user confirmation
- For tasks spanning multiple projects or files: read the source (e.g. SQL view, API response) before updating the consumer (e.g. TypeScript type) — never type against an assumed schema
- Before building any display on top of a DB field, verify what it actually represents — field names are often misleading (e.g. `old_price` may be the last drop event, not the 30-day high). For JSONB fields, also verify stored value types with `SELECT DISTINCT` before writing type-conversion logic.
- For visual design tasks: present 3–4 named options upfront and let the user choose before implementing — do not iterate one change at a time. When the decision is about color/look-and-feel, render the options as an actual visual mockup (not just text descriptions).
- At plan time, surface design questions explicitly as open questions (e.g. "which reference price do we show?", "how does this behave in a multi-retailer future?") — these decisions are cheaper to make before implementation than during testing
- When rendering a DB field on a new page, check how existing pages render the same field first — do not derive display logic from scratch
- For tasks that reference an external system or say "coordinate with [X]": identify the target project/repo at plan time before writing any code
- For custom search inputs, use `type="text"` not `type="search"` — the browser's native Escape-to-clear conflicts with custom dropdown and keyboard UX
- For small fixed-size thumbnails (≤ 64px) in dropdowns or lists, use a plain `<img>` tag — `next/image` with `fill` requires a `sizes` prop and adds unnecessary complexity at small sizes
- `pg` returns `numeric`/`decimal` columns as strings at runtime despite TypeScript typing them as `number` — always coerce with `Number()` before calling `.toFixed()` or passing to arithmetic
- For vector / ANN similarity search combined with hard filters (price, brand, availability), verify **recall against ground-truth counts** with real queries — approximate indexes (e.g. pgvector IVFFlat) apply `WHERE` filters *after* the index scan, so a low `probes` value silently returns far fewer rows (often zero) than actually match. Type-checks and "it returned some rows" do not catch this.
- Postgres views defined as `SELECT * FROM other_view_or_table` do NOT automatically pick up new columns added later to the underlying view/table — the column list is fixed at `CREATE`/`CREATE OR REPLACE` time. Any dependent `SELECT *` view must be explicitly re-created after its source gains a column, or it will silently keep serving the old shape (TypeScript won't catch this — it only surfaces at runtime/in the browser).
- When local dev environment variables are added or changed (new API key, new required env var), the running `npm run dev` process must be restarted — Next.js only reads `.env.local` at process start, not on file change.
- When a Vercel environment variable is added or changed (new API key, swapped credential), it does not take effect until the next deploy — state explicitly that a redeploy is required, the same way a local `.env.local` change requires restarting `npm run dev`.
- When a client component calls a Server Action, wrap the call in `try/catch` even if the action itself has internal error handling — an unhandled rejection from the action (timeout, network failure) will otherwise leave the UI stuck in its loading state indefinitely with no visible error.
- Before rotating, deleting, or narrowing the scope of a credential (DB role, API key) that might be used outside this repo, ask whether other projects/repos depend on it — don't treat the change as complete until that's confirmed either way.
- Don't truncate/clamp user-facing AI-generated or long-form text as a default "tidiness" choice — confirm with the user first. What reads as clean in a mockup can read as broken/cut-off once real (long) content is live.
- For copy/text tasks with multiple valid approaches: present 3–4 named options with a concrete rendered example and let the user choose — do not iterate one change at a time
- When the same small lookup data (labels, descriptions, category metadata) is needed in a second file, extract it into a shared module immediately — don't wait for a third copy-paste to trigger the cleanup.
- Avoid attaching onClick JS handlers to outbound `target="_blank"` links for click tracking — ad blockers flag the onClick+target="_blank" shape as a cloaked-redirect pattern and force the navigation into a stripped popup window. Prefer GA4 Enhanced Measurement (or another mechanism that doesn't run JS in the click path) for outbound-link tracking instead.
- Each `lib/*.ts` module that lazily instantiates an external client (OpenAI, DB pool, Redis) owns its own singleton rather than importing another module's — keeps modules independently testable/removable even at the cost of a small duplicated singleton pattern.
- When a Route Handler needs data the client already has from a prior Server Action call (e.g. search results), pass it through in the request body rather than re-fetching/re-querying server-side — but validate array length/shape defensively, since the payload is now client-controlled.
- When firing an async request in response to a user action without awaiting it in the main flow (e.g. a background summary fetch after a search), guard against a superseded/stale response with both an `AbortController` (cancels the request) and a generation/sequence counter (defense-in-depth: ignore a stale response even if it still lands) — see `SemanticSearch.tsx`'s summary-fetch pattern.

## Output Style
- Be concise and structured
- Do not dump large amounts of code unless necessary
- Explain key decisions briefly

## Workflow Modes

State the mode at the start of each task. If not stated, default to NORMAL silently — do not ask.

### FAST
**When:** single file, no logic risk, obvious change (rename, typo, config tweak)
```
Implement → Commit
```
No prompt needed — just describe the change and do it.

### NORMAL
**When:** features, bug fixes, clear scope, familiar code
```
Implement → Commit
```
- Plan is optional: if the task is clear, skip straight to implementation; run @plan.md only if needed
- Verify runs inline after each task (part of @implement.md)

### FULL
**When:** architecture changes, cross-cutting refactors, security-sensitive, unfamiliar area, high risk
```
Plan → Approve → Implement → Verify → Wrap-up → Commit
```
- Plan waits for explicit approval before implementing
- If the plan has more than 5 slices, flag it and suggest splitting into two tasks
- If a slice reveals an invalid assumption or missing dependency, stop, flag it, and re-run @plan.md before continuing
- Verify runs a thorough pass via @verify.md
- Wrap-up is expected

### Escalation
If scope or risk grows beyond the chosen mode mid-task: stop, state the new mode, and re-run @plan.md before continuing. Do not implement further until the new plan is approved.

### Manual Testing Handoff
If verification cannot be completed (no prod DB access, UI interaction required, external service needed, etc.): state what cannot be verified, list exact test scenarios (steps, inputs, expected outputs), and stop with **MANUAL TEST REQUIRED**. Do not mark a task done until the user confirms pass/fail.

## Pill badges
- Always add `whitespace-nowrap` to pill/badge spans. Pair `items-start` on the parent `flex-col` to prevent stretching. Never rely on `w-fit` or `self-start` alone in a flex context.

## SVG Charts
- Use SVG for geometry only (paths, lines, rects). Never put text inside the SVG when using `preserveAspectRatio="none"` — fixed font sizes don't scale correctly with the container. Instead, position all labels as HTML elements using `%` coordinates derived from the SVG viewBox (`x / W * 100%`).

## Testing
- Do not test DB query functions in isolation (e.g. dedicated test endpoints). Test them in context when the feature that uses them is built — visual output will catch query errors immediately.
