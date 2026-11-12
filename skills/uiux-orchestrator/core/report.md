# Communication and report

Load at stage 6, and for the start summary format before execution.

Keep intake, profile, routing and handoff records in working context. Create process files only
when requested by the user or project. Explain decisions that affect the result, not routine
steps; honor requests for detailed plans or reports.

Skip the start summary on the fast path. Otherwise show once, at most three lines:

```text
Task: <scope and objective> · <platform>
Approach: <direction (mode, primary) or the key decision, constraints and specialist if it matters>
Checks: <planned evidence and known tooling limit>
```

Lead the final report with the outcome, checks and remaining limitations. Small changes usually
need one short paragraph or up to three bullets. Larger tasks add key decisions, files, the
contribution of specialists actually used, and status (`Passed`, `Passed with limitations`,
`Needs review` or `Failed`). Include reproducible commands when useful. Always disclose failed
or unavailable checks; never claim visual verification without observing rendered output.

For orchestrated tasks, include a compact role → skill actually executed → output/evidence table.
List verified reuse, missing/failed skills and fallbacks separately. Full-design work must show
the execution-record check result. A clean record check establishes consistency, not the truth
of receipts or aesthetic success; observed evidence and review are still required.
