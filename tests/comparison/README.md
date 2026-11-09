# Paired execution comparison

This suite measures whether orchestration helps a real UI task enough to justify its cost.
It is separate from installer tests and routing-only probes. No execution results are included
until agents actually complete these tasks and an evaluator inspects the output.

## Run the four cases

Use the prompts and acceptance criteria in [cases.json](cases.json). Start with two repetitions
per case and condition (16 runs) if resources permit; a single pair is a smoke test, not a trend.
Record failed runs and tool limitations instead of dropping them. An unavailable simulator makes
E04 unverified, not successful.

1. Prepare one fixture snapshot per case. For E03, capture the reference first and make the same
   body-only removal in both starting copies. Record the prepared tree/commit hash and the
   reference image hash. Never let either run read the other run's code or agent transcript.
2. Use clean agent sessions and isolated profiles. Keep model, effort/settings, tool versions,
   permissions, starting files and installed specialist versions identical. The baseline must
   have no orchestrator in its project, parent, global or plugin skill locations. The other
   condition must load the exact recorded orchestrator version. Keep all other skills unchanged.
3. Give the same task prompt to each condition. Change only whether the orchestrator is available
   and explicitly requested. Alternate condition order between repetitions. Start timing at
   task submission; stop at the final response, including checks and correction attempts.
4. Save agent/runtime token counts when exposed. Record `null` when unavailable; do not estimate
   token savings from response length or files read. Record failures, unfinished requirements
   and remaining issues even when the agent reports success.
5. Capture the required sizes/states and exercise interactions. Give shuffled, neutral labels
   to the outputs and have a reviewer inspect them against `acceptance`. Do not reveal condition
   names or the agent's claimed status until grading is finished. Store reviewer notes beside
   the artifacts. Self-grading should be disclosed as such.

The same model can behave differently across runs. Report repetitions and limitations; a small
test on one model does not establish performance on every supported coding agent.

## Record observations

Write a JSON array with one object per condition, case and repetition. The following is a schema
example, not measured data. Replace the descriptive strings and unknown values with actual
records. `specialists` lists installed specialist names **and versions**, not selected skills.
`settings` includes model effort, permission mode and any preparation/reference hashes.

```json
[
  {
    "task_id": "E01",
    "repeat": 1,
    "condition": "baseline",
    "model": "exact-model-id",
    "agent": "agent-name-and-version",
    "settings": {"effort": "record the actual value"},
    "source_revision": "hash of the prepared fixture snapshot",
    "tooling": ["tool name and version"],
    "specialists": [],
    "duration_seconds": null,
    "tokens": null,
    "criteria": {"reuse": null, "states": null, "scope": null},
    "remaining_issues": null,
    "evidence": {"visual_observed": false, "artifacts": []}
  }
]
```

Add the matching `orchestrator` record with `skill_version`. Boolean criteria are evaluator
judgments; `null` means ungraded. Artifact paths are relative to the observations JSON file.
Actual elapsed time and remaining-issue counts are required. A positive visual claim needs an
existing artifact; file existence alone does not prove that somebody inspected it.

```bash
python3 -I scripts/compare_execution.py path/to/observations.json --out path/to/comparison.md
```

The script rejects unmatched/duplicate conditions, mismatched setup, incomplete criteria and
missing artifacts. It displays time/token/issue deltas and reported checks separately, without
inventing a combined quality score or declaring an automatic winner. Missing token counts remain
unavailable; absent visual observation stays unverified. It cannot independently verify that
recorded settings, measurements or human judgments are truthful.
