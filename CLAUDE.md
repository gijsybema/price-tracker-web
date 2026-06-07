# CLAUDE.md

## Core Rules
- In FULL mode: always plan before coding and wait for explicit approval before implementing
- In NORMAL mode: plan is optional — if the task is clear, proceed directly to implementation; do not wait for approval between steps
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
- Never modify `docs/spec.md` without explicit user confirmation; always show proposed changes and wait for approval
- Do not mark tasks done in `docs/spec.md` during implementation; only mark them done at wrap-up or on explicit user confirmation
- For tasks spanning multiple projects or files: read the source (e.g. SQL view, API response) before updating the consumer (e.g. TypeScript type) — never type against an assumed schema
- Before building any display on top of a DB field, verify what it actually represents — field names are often misleading (e.g. `old_price` may be the last drop event, not the 30-day high). For JSONB fields, also verify stored value types with `SELECT DISTINCT` before writing type-conversion logic.
- For visual design tasks: present 3–4 named options upfront and let the user choose before implementing — do not iterate one change at a time
- At plan time, surface design questions explicitly as open questions (e.g. "which reference price do we show?", "how does this behave in a multi-retailer future?") — these decisions are cheaper to make before implementation than during testing
- When rendering a DB field on a new page, check how existing pages render the same field first — do not derive display logic from scratch
- For tasks that reference an external system or say "coordinate with [X]": identify the target project/repo at plan time before writing any code

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
