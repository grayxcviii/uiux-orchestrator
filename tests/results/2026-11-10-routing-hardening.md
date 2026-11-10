# Runtime, routing and visual-acceptance hardening

Date: 2026-11-10. Agent: Codex. Exact model identifier and token usage were not
captured for this run. Scope: the incremental repository changes, not the existing
staged release work or the generated Hanoi example.

## Observed checks

| Check | Observed result |
|---|---|
| `npm test` | 41 Node tests and 79 Python tests passed; no failures or skips |
| `python3 -I scripts/validate.py` | Passed: 62 registry entries, 26 slots, plugin 1.3.0 |
| `python3 -I scripts/check_licenses.py` | Passed: 46 specialists, 13 pinned sources, 18 original notices and 5 supplements |
| `git diff --check` | Passed |
| External skill-creator `quick_validate.py` | Could not run: its Python environment lacks `yaml`; no dependency was installed |

The Python total includes 57 execution-record checks, 6 runtime-probe checks and
4 routing regressions against the real scenario scorer. Package tests verify that
the probe and execution-record validator both ship and install.

The local read-only runtime probe observed Node 20.19.0 on PATH and selected the
already installed Node 24.18.0 from nvm. It did not install a runtime or change PATH
or global defaults. Isolated fake executables cover alternate discovery,
configured directories, invalid versions and an empty PATH.

## Independent forward routing probes

Two fresh agents each inspected a separate blank HTML target and the revised
instructions. Each ran once. These are planning-only probes, not a paired baseline
comparison or executions of the selected design drivers.

| Original brief | Observed routing |
|---|---|
| Hanoi travel marketing page; aesthetics delegated; necessary local kit authorized | Selected `taste/design-taste-frontend` after inspecting its installed rules and discovering Node 24; did not ask for repeated local-file permission |
| Same destination with explicitly required interactive 3D and violet/cyan | Selected `impeccable/new-work`; Taste was runtime-compatible but conflicted with the original brief's explicit visual requirements |

Neither probe built or rendered a UI, downloaded assets, published anything, or
installed dependencies. The second probe checked the installed Impeccable engine
without a download; later concept-service availability remains unverified.

An independent code review found regressions in built-in review fallback,
runtime-minimum validation and scenario placement. Each was corrected and covered
by a regression test. The final review reported no remaining findings in scope
and independently reran all 57 execution-record tests successfully, including
fresh built-in reassessment after negative feedback and rejection of reused
review identities.

## Interpretation and limits

The observed improvement is narrower than aesthetic quality: compatible installed
runtimes are discovered, the two tested briefs route appropriately, and incomplete
or contradictory execution records are rejected. Negative feedback requires a
fresh assessment without imposing another user-approval step. Built-in review
fallback retains its limited status ceiling.

The checker verifies declared record consistency. It cannot authenticate execution
receipts, screenshots, user feedback, or the quality of a visual judgment. Existing
records must not be backfilled with invented observations to satisfy it. S40/S41
are regression cases used during development, not held-out evidence.

E08 is a future paired destination-page evaluation specification. It was not run
here. No claim is made that the landing page became more attractive, that an entire
downstream design workflow succeeds, or that behavior generalizes across models.
