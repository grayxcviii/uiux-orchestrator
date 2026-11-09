# Distribution licence review — 2026-11-09

Scope: the npm file list, installed skill folders, active skill registry, GitHub test metadata,
and six pinned Claude Code plugin sources. This is a technical compliance review, not a legal
opinion or trademark clearance.

**Current status:** the concrete missing transitive notices identified below have been supplied,
with original source provenance and installation safeguards. Asset-specific obligations still apply
when shipping a product; notice checks are not ownership or trademark clearance. See the remediation
section for the changes and verification scope.

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

## Transitive-content review — 2026-11-09

The initial follow-up inspected the selected Git trees for all 13 catalogue sources at the exact pinned
revisions, including nested licence files, asset-credit manifests and copyright/permission text.
The checks passed while the following notice gaps were still present. These paragraphs record the
initial findings; the missing-notice issues are addressed by the remediation below.

### Taste: third-party assets need their own notice review

At `9b4bf937a1f69348126959c15d2f99a73e65699b`, `skills/taste-skill/` contains photos, icons and
demo assets in addition to original MIT-licensed instructions and code. Its credit manifests
identify Unsplash, CC0, CC BY, CC BY-SA, ISC and third-party MIT material. The installer copies
those credit manifests, which is useful, but the catalogue only adds Leonxlnx's root MIT licence.

For example, `assets/icons/demo/ui-accessibility.svg` is credited to Lucide under ISC and
`assets/icons/demo/ai.svg` to vscode-icons under MIT. Their SVGs have no permission notices,
and no ISC permission text or those projects' complete licence notices was found in the selected
skill tree. Root MIT terms attributed to Leonxlnx do not replace the original holders' notices.
Resolve this by identifying the applicable upstream versions and including their original licence
and copyright notices with the installed assets; do not invent author/year notices.

Photo manifests retain authors and licence links, including CC BY-SA photos in
`assets/layout/img/credits.json` and `assets/scenes/_demo/credits.json`. These photos are not MIT.
Before publishing a product that uses them, preserve the required attribution and links, indicate
changes, and apply the relevant ShareAlike terms to adaptations of those images. This does not
automatically relicense unrelated application code. Each asset's actual licence/version controls.
The present review has not validated every asset against its original source or every adaptation.

Evidence: [pinned Taste source](https://github.com/Leonxlnx/taste-skill/tree/9b4bf937a1f69348126959c15d2f99a73e65699b/skills/taste-skill),
[Lucide licence](https://github.com/lucide-icons/lucide/blob/main/LICENSE),
[vscode-icons licence](https://github.com/vscode-icons/vscode-icons/blob/master/LICENSE),
[CC BY-SA 4.0 terms](https://creativecommons.org/licenses/by-sa/4.0/).
The linked current icon-project licences corroborate the notice requirements; exact version
provenance still needs review before copying supplementary notices into the installer.

### Impeccable: preserve the transitive MIT notice

At `c3bb418ee38ee49a6b999b7752c1368f3123a2bd`, Impeccable's original `NOTICE.md` attributes its
iOS/Android references to ehmo/platform-design-skills under MIT. Both references are in the
installed `plugin/skills/impeccable/reference/` tree. The installer preserves Impeccable's Apache
licence and NOTICE, but no complete ehmo MIT copyright/permission notice accompanies them.
The NOTICE's author/link/licence name is not the full MIT notice. Obtain the original licence at
the applicable source revision and retain it alongside those references. Upstream's stated MIT
licence does not by itself establish rights in any separately owned platform documentation.

Evidence: [pinned Impeccable NOTICE](https://github.com/pbakaus/impeccable/blob/c3bb418ee38ee49a6b999b7752c1368f3123a2bd/NOTICE.md),
[platform-design-skills licence](https://github.com/ehmo/platform-design-skills/blob/main/LICENSE),
[MIT notice condition](https://opensource.org/license/mit).

### README-only declarations remain a provenance limitation

Software Mansion and Vercel declare MIT in their pinned READMEs. Keeping those declarations and
generic MIT permission terms records the available evidence, but cannot supply an absent original
copyright notice or cure uncertainty about third-party material. A complete upstream licence file
or clarification from the copyright holder would strengthen the record. This is a documentation
limitation, not a finding that their published MIT declarations are invalid.

### README and release status

The public npm `latest` endpoint was checked again and reports `1.1.1`. GitHub's `1.3.0` installer
is not available through the documented npm command yet. README now states the two versions
separately and warns that downloaded assets may have their own terms. Its MIT badge is scoped to
original project work, and integration credits explicitly disclaim affiliation or endorsement.
The professional UI/UX introduction is a description of the intended workflow, not a certification
or a guarantee of third-party rights. Pexels demo credits and the fictional-brand disclosure remain.

The initial recommendation was to close the concrete missing-notice findings, review the affected
asset licences and extend the gate before a v1.3.0 npm release. Checks of root licence files alone
were insufficient for that release decision.

## Transitive-notice remediation — 2026-11-09

The catalogue still contains all 46 specialist folders from the same 13 source revisions.

- Five unmodified supplementary originals now travel with the installed orchestrator: Lucide's
  ISC/Feather MIT notices, vscode-icons MIT, Simple Icons CC0, gilbarbara/logos CC0 and ehmo's MIT.
  `legal/sources.json` records exact source URLs, SHA-256 and the version/selection basis. The
  npm installer copies the applicable files into each specialist's `.uiux-licenses/supplemental/`
  and records their hashes and original URLs in `SOURCE.json`.
- Taste's two icon-credit manifests, photo catalogue and layout/scene/moment photo-credit
  manifests are bound by hashes in the pinned catalogue. Preparation stops if an original is
  missing or changed. Installed copies with damaged credits are repaired on a managed rerun.
- An unchanged source revision no longer causes the installer to skip newly required notices.
  Missing or damaged supplemental texts trigger a managed reinstall. Existing user-managed skill
  folders remain untouched and explicitly unverified.
- Source checkouts disable Git's automatic line-ending conversion so credit hashes and licence
  bytes do not depend on the user's `core.autocrlf` setting. A regression test exercises that
  configuration; this is not a claim of a real Windows installation run. This repository also
  preserves exact bytes for the hash-bound catalogue/provenance files and original licence texts.
- The release gate requires the declared supplements, immutable original notice sources, asset
  manifest hashes and usage guidance. Package tests assert that notices and guidance survive
  npm packing and project installation. Negative release-gate tests remove a supplement
  declaration, corrupt a licence, remove guidance and damage an asset hash.
- The orchestrator routes asset reuse to `legal/asset-usage.md`; the same guidance accompanies
  each downloaded specialist. It covers propagating original notices and public credits, exact
  image licence versions and adaptations/ShareAlike, logo trademarks, optional maps and fonts.
  Unknown or conflicting provenance calls for a verified replacement or permission, rather
  than inventing a grant. Upstream skills and their original manifests were not rewritten.

The icon package versions come from Taste's pinned credit manifests. vscode-icons 12.14.0 is
identified by Iconify vscode-icons 1.2.30 metadata. For Lucide and vscode-icons, the original
licence bytes are taken at the last licence-changing commit before those Iconify package releases;
Iconify's Lucide metadata does not identify an exact upstream icon-content commit. Simple Icons
uses the npm 16.30.0 release gitHead and matching tarball licence bytes. gilbarbara/logos uses
the exact commit named by Taste. ehmo's licence is from the repository creation commit, its only
recorded LICENSE change; Impeccable does not identify an exact source-content revision. Those
limits are retained in provenance instead of presenting inferred content versions as verified.

Verification is recorded in [transitive-notice installation results](../tests/results/2026-11-09-transitive-notices.json).
This closes the identified missing-notice delivery defects; it does not establish ownership of
every photograph/icon, validate source-platform documentation rights, or remove the existing
README-only declaration limitation for Software Mansion and Vercel. No unverified licence was
invented for those authors, and no upstream scripts/hooks were executed in this check.
