# Transitive notices implementation plan

> **For agentic workers:** Use superpowers:executing-plans to implement these steps in this session.

**Goal:** Deliver the missing original notices with specialist installs and preserve asset usage conditions without removing supported skills.

**Architecture:** Keep original supplementary licences and provenance in the existing installed skill's `legal/` tree. Each catalogue source declares supplementary files; the installer copies them into `.uiux-licenses/supplemental/` and verifies them when reusing an installation. Extend the offline gate and real installation verification.

**Tech stack:** Node.js 18+, Python 3, existing node:test fixtures and npm pack integration.

**Spec:** `docs/license-audit.md`, transitive-content findings; user-approved four-step remediation in conversation.

## Global constraints

- Preserve all 46 supported specialist folders and 13 pinned source revisions.
- Preserve upstream files and credit manifests without rewriting their notices or ownership.
- Fetch supplementary licence texts only from identified original sources; record immutable provenance and SHA-256.
- Do not execute third-party scripts, alter unmanaged user skills or publish npm in this task.
- Do not claim that root licences license every asset or that this review establishes unknown ownership.

## Review focus

- Previously managed installs at the same revision must gain new notices on rerun.
- Missing or corrupted supplementary notices must trigger repair; unchanged copies may be reused.
- A missing bundled notice must block preparation before any destination is written.
- Supplemental paths must remain within packaged legal resources and installed legal directories.
- Packed npm installs must carry all supplementary texts and the asset guidance.

### Task 1: Supplementary notice delivery

Files: `tests/specialists.test.mjs`, `bin/lib/specialists.mjs`, `bin/specialists.json`, `skills/uiux-orchestrator/legal/sources.json`, `skills/uiux-orchestrator/legal/licenses/`.

- [x] Write regression tests for supplementary copies in both scopes, same-revision upgrades, corruption, missing resources and unsafe paths.
- [x] Run the tests and observe the missing delivery/revalidation failures.
- [x] Record original Lucide/Feather, vscode-icons, CC0 logo-set and ehmo licence texts with immutable sources.
- [x] Add source `license.bundled_files`; copy under `.uiux-licenses/supplemental/` and record hashes/provenance in SOURCE.json.
- [x] Validate expected supplementary bytes on reruns and block absent resources before commit.
- [x] Run specialist tests and the complete test suite.

### Task 2: Asset conditions and release safeguards

Files: `scripts/check_licenses.py`, `tests/npm-package.test.mjs`, `skills/uiux-orchestrator/legal/asset-usage.md`, `skills/uiux-orchestrator/SKILL.md`, legal notices, README, `docs/license-audit.md` and installation records.

- [x] Record the pinned Taste photo/icon manifests and their hashes; bind them to the reviewed source revision.
- [x] Explain asset credit propagation, image adaptations/ShareAlike, logo trademarks, optional font/map terms and unknown-source handling in one routed resource.
- [x] Extend the release gate to require declared supplements, source hashes and the reviewed manifest record.
- [x] Assert supplemental resources in the packed tarball and installed orchestrator.
- [x] Run real web/mobile/global installs in isolated profiles; verify original notices, supplementary bytes, preserved credit manifests and reruns.
- [x] Close resolved audit findings while retaining provenance and ownership limitations.
- [x] Run npm publish --dry-run, obtain an independent review and resolve material findings.

## Execution record

- Worked in the existing user checkout to preserve the preceding README/audit changes; no isolated branch or source revision changes.
- Regression baseline: four installer tests, two packaging cases, three release-gate cases and the autocrlf case failed for the intended missing safeguards before fixes.
- Final verification: 41 Node tests, 12 Python tests, distribution gate, repository validator and npm publish --dry-run pass.
- Actual packed installs: global 46, web 30, mobile 23; original files and supplementary notices match, credit manifests retained, reruns reuse sources, missing ehmo notice repaired.
- Independent review and incremental autocrlf review approved with no material findings. Ownership/trademark clearance, real Windows installs and specialist runtime/design quality remain outside this verification.
