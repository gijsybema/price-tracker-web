---
name: Do not mark tasks done until wrap-up
description: When to mark tasks as ✅ in spec.md — only at wrap-up or on explicit user instruction, not immediately after implementing.
type: feedback
---

Do not mark tasks as ✅ (or otherwise "done") in `docs/spec.md` immediately after completing the implementation. Wait until the wrap-up phase or until the user explicitly confirms the task is done.

**Why:** The user corrected this after T02 — marking mid-task bypasses the review gate and implies completion before the user has confirmed.

**How to apply:** After implementing a task, leave its Done cell unchanged in spec.md. Only update it when the wrap-up is confirmed or the user explicitly says to mark it done.
