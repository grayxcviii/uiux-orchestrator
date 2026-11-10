# Workflow: UI/UX review (read-only)

Steps: `inspect → (render) → audit-current → report`

Mutation is **read-only**: no edits, no design-system changes, no context files, no demo toggles.
If the user later asks for fixes, switch to `improvement.md` or `bug-fix.md` using these findings
as the audit record.

1. **inspect** — Read the target, its components and tokens; note platform conventions that apply.
2. **render** — If the app can run here, capture the target at the relevant sizes, themes and states
   (quality-gates tooling). If not, review from code and say so in the report. Do not describe
   rendered appearance you did not observe.
3. **audit-current** — One slot per dimension the user asked about (decision-engine §3):
   - UX / visual quality → `ux-critique`.
   - Technical: accessibility, performance, responsive, web rule compliance → `tech-audit`.
   - Platform conventions → `platform-conformance` (HIG reviewer for Apple platforms; Impeccable
     critique's native guidance for Android; the platform file as fallback; web has none).
   - Code quality, when asked or on Large reviews → `code-review`.
   - Motion → the animation workflow's *review* sub-type.
   "Review the screen / find UX problems" = `ux-critique` (+ `platform-conformance` on Apple
   platforms). "Full review" = `ux-critique` + `tech-audit` (+ `platform-conformance`). With no
   specialist available, use the rubric below.
4. **report** — Merge and dedupe findings (same location + same cause = one finding).

Execute compatible available reviewer skills for the requested dimensions; a self-written
rubric is fallback only after candidate checks. Keep review activation receipts and findings.
For the final review of full creative work, execute both UX/design and technical/accessibility
assessments under [orchestration.md](../core/orchestration.md). The builder's self-check is not
either activation. Fixes require updated evidence and review before findings are closed.

## Rubric (built-in)

Task clarity and primary action · information hierarchy · consistency with the rest of the app ·
platform conventions · states (loading/empty/error/disabled/long content) · forms (labels, errors
near fields, input types, keyboard) · navigation and back behavior · copy clarity ·
accessibility (contrast, targets, labels/roles, focus order, large text, reduced motion) · motion ·
responsiveness/adaptivity · performance signals visible in code.

For visual-quality reviews, also apply the
[visual craft acceptance check](../core/quality-gates.md#visual-craft-acceptance): composition,
typography, palette/materials, product identity, finish and responsive craft. Tie aesthetic
findings to observed details and the chosen direction; distinguish defects from optional taste.
Read the original visual brief as well as the direction record. A visually coherent result can
still miss the requested style. Report that mismatch explicitly rather than accepting it on
the strength of technical checks or consistency alone.

## Finding format

```text
[Severity] Title
Where: file:line (and screen/state/size if rendered)
Problem: what is wrong, observed or from code (say which)
Impact: who is affected and how
Fix: direction, not a full patch
```

| Severity | Meaning |
|---|---|
| Critical | Blocks a core task, data loss, or excludes users (e.g. checkout button unreachable by screen reader). |
| High | Significant friction or a WCAG AA failure on a main path. |
| Medium | Noticeable inconsistency or friction; secondary paths. |
| Low | Minor polish. |
| Suggestion | Optional improvement or idea, not a defect. |

Order by severity, then by user impact. End with the 3 changes that would matter most.

## Gate

Findings specific, located, with severity, impact and fix direction · evidence basis stated (code
vs. rendered) · no files changed · L0 (+ L4 when rendering was possible).
