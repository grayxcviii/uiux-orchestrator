# Distribution licence review — 2026-11-09

Scope: the npm file list, installed skill folders, active skill registry, GitHub test metadata,
and six pinned Claude Code plugin sources. This is a technical compliance review, not a legal
opinion or trademark clearance.

## Plugin downloads

The existing local Claude Code plugin cache was inspected in addition to the upstream trees.

| Plugin | Selected folder at the recorded commit | Observed result | Current distribution |
|---|---|---|---|
| Impeccable | `plugin` | No LICENSE or upstream NOTICE in installed folder | Optional author-managed install |
| Taste | `skills/taste-skill` | No LICENSE in installed folder | Optional author-managed install |
| UI UX Pro Max | `.claude/skills/ui-ux-pro-max` | Font licence data present; project LICENSE absent | Optional author-managed install |
| Emil Kowalski motion | `skills` | No LICENSE in installed folder | Optional author-managed install |
| frontend-design | `skills/frontend-design` | Full Apache-2.0 LICENSE.txt present | Automatic dependency retained |
| Vercel web-design-guidelines | `skills/web-design-guidelines` | No licence file in installed folder; upstream README declares MIT | Optional author-managed install |

Exact source paths and commit hashes are recorded in
[plugin-audit.json](../skills/uiux-orchestrator/legal/plugin-audit.json).
Author-managed installation is a distribution choice, not a guarantee that another installer
meets all licence requirements. Users retaining an older installation should verify its notices.
This update does not delete or repair existing third-party plugin caches.

## Release safeguards

- The installed skill contains the original project MIT licence, third-party attribution,
  full upstream licence/NOTICE texts and a source/hash manifest. Files travel with the skill
  through npm, direct folder copying and the plugin.
- `scripts/check_licenses.py` checks licence hashes, package inclusion, project licence equality
  and the audited source revision of every automatically listed external plugin.
- CI and `npm run prepublishOnly` run that gate. The npm integration test checks the actual
  packed file list and the licence files delivered by `npx`.
- The unlicensed dickwu Apple Design skill is absent from active routing and install guidance.
  Historical test inputs/results remain identifiable as historical; the current answer key
  uses a licensed reviewer and official Apple references.
- Demo credits and the fictional-brand/no-endorsement disclosure remain in the distribution
  notices. The npm package does not contain the demo images.

Re-audit when updating a third-party revision or adding copied source/assets. The gate verifies
the reviewed inputs; it cannot establish ownership of unknown copied material or legal rights
in every jurisdiction.

## Validation note

The optional local skill-creator `quick_validate.py` rejects the existing `compatibility`
frontmatter field on both the baseline and this revision. That helper does not accept all fields
in the [current Agent Skills specification](https://agentskills.io/specification). The repository's
validator accepts and checks this supported field. The field was retained; it is unrelated to
licence compliance.

## 1.3.0 npm installer follow-up

The npm installer now fetches the full supported catalogue globally or the detected web/mobile
subset in a project. It downloads the selected skill folders **and** each source's original root
licence/NOTICE files at audited commits; this resolves the directory-only omission for these
npm installs. The Claude Code plugin dependency mechanism remains unchanged.

Software Mansion and Vercel declare MIT only in their root README at these revisions. Those
original READMEs and the full MIT permission terms are retained, with the basis recorded in each
installed `.uiux-licenses/SOURCE.json`. This preserves the published declaration; it is not a
new licence grant or a guarantee about underlying ownership.

[install-audit.json](../skills/uiux-orchestrator/legal/install-audit.json) binds the reviewed
catalogue by hash. [Real installation results](../tests/results/2026-11-09-specialist-installer.json)
record isolated global, web and mobile installs plus original licence/NOTICE hash checks. No
third-party setup scripts, hook manifests, SDK installation or design tasks were executed.
Changing the catalogue requires repeating that source/licence review and updating the audit.
