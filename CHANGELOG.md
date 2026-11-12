# Changelog

This project follows [Semantic Versioning](https://semver.org). From 1.0, a minor version may add
routing rules or skills, and a major version is needed to remove a workflow or change the report
format.

## [1.5.1] - 2026-11-12

### Changed
- Context reduction: SKILL.md body from about 2,100 to about 1,000 words. Full-design-only
  material moved to `core/full-design.md` (stages, foundation ownership, driver phases, driver
  eligibility) and `core/execution-record.md` (record checker schema); the report format to
  `core/report.md`; capture tooling to `references/validation-tooling.md`; manual direction
  scoring and the style index to `references/direction-rules.md`. The skill text read for
  "improve one screen" fell from about 22,400 to about 16,400 words.
- The skill description now says when not to use it (code, repository, pull-request, tool,
  backend or architecture reviews, writing tests), and intake asks before starting UI work when
  "review / đánh giá this" is ambiguous.

- Routing: a new screen inside an established design system is no longer full-design; concept
  alternatives come inline from the scoped visual specialist (a separate `design-reasoning`
  activation stays for full-design, Redesign/Replace, Large work and explorations).
  `emil/choreograph` is limited to complex multi-group sequences and scoped motion review to
  motion deliverables or multi-flow work. iOS platform conformance uses Impeccable critique's native
  guidance. Accessibility work states that unverified screen-reader or keyboard behavior caps the
  status at `Passed with limitations`.
- Answer key v3: `emil/improve-animations` is allowed for full-design scenarios whose motion ships.

### Added
- `tests/rule-inventory.json` and `tests/skill-rules.test.mjs`: 90 normative rules that must stay
  present, every skill file reachable from SKILL.md, and every anchor link valid.
- Paired routing benchmark (v1.5.0, the refactor, and the refactor plus routing rules):
  `tests/results/2026-11-12-context-reduction.md`. Skill selection 90% → 100% (main), unnecessary
  invocations 24% → 14% (main) and 33% → 6% (held-out), agent tokens −10%.

- CONTRIBUTING: media over about 1 MB goes to GitHub Releases, not the repository; links to the
  licence audit and the 1.3.0 routing-hardening record.

### Fixed
- `scripts/direction.mjs` printed nothing when reached through a symlinked path, and ignored
  `brand` given in the `{ value, source }` shape; it now accepts it and warns on other shapes.

## [1.5.0] - 2026-11-12

### Added
- Design direction decision (`core/direction.md`): context analysis with explicit / inferred /
  default / unknown sources, an information-sufficiency check that asks at most one question
  only when unknown audience or personality would change the style family on a brand-expressive
  surface, and a composed direction (primary, at most one secondary, functional directions per
  surface, treatments, ambition, color posture, motion level). Its record is the single source
  of truth for direction; drivers author the concrete direction contract inside it.
- Style Library (`registry/styles.json`): 13 data-driven styles in four families with fit rules,
  exclusions, pairings, clashes, treatments, accessibility notes and platform notes. Glass
  Modern and Spatial Futurism are deferred and honored only as explicit custom directions.
- `scripts/direction.mjs`: zero-dependency deterministic scoring and composition, with
  `--vocabulary` and stdin input.
- `tests/direction-scenarios.json` and `tests/direction.test.mjs`: 24 scenarios (the ten
  reference prompts plus edge cases) and invariant, consistency, extensibility, malformed-input,
  style-cap and CLI tests.

### Changed
- Ownership by stage adds the design direction row; UUPM style results become evidence for the
  record. Color posture, ambition (`bold`, `confident`, `quiet`) and motion level now come from
  the record. The premium monochrome, bold direction stays the default when context is too thin,
  and the AI-generated signature lists apply to every style.
- Intake records `design_context`; "When to ask" covers the direction question. The visual craft
  gate's brief-fit dimension checks the render against the record.

## [1.4.5] - 2026-11-12

### Added
- `npx uiux-orchestrator uninstall [--project | --global] [--agent <name>] [--dry-run]` removes
  only folders carrying the installer marker, keeps user-managed skills and symlinks, and drops
  project agent folders left empty.

### Changed
- Project installs filter mobile specialists by detected stack (`stacks` in
  `bin/specialists.json`: `expo`, `react-native`, `ios-native`, `android-native`). React Native
  CLI apps no longer receive Expo Router, Expo UI, Expo native UI, Expo design system, SwiftUI or
  Android/Compose skills; their `ios/` and `android/` folders are not counted as native apps.
  `--platform mobile` still installs every mobile specialist.
- Installs target only the agents detected in the project (or home folder for `--global`), and
  fall back to all seven agents when none is detected, instead of always writing to `.claude/`,
  `.agents/` and `.windsurf/`.
- README states that existing brand colors, tokens and components override the monochrome and
  bold-direction defaults.

## [1.4.4] - 2026-11-11

### Added
- Platform-agnostic component intelligence (`references/component-intelligence.md`): a
  resolution order, a universal contract (states, semantics, keyboard/focus, targets, text,
  motion, color, content states), a "choose the right component" table, contracts for 22 core
  components and their mapping to HTML/WAI-ARIA APG, SwiftUI, Compose Material 3, React Native
  and Flutter. The visual craft gate adds a Component contract check.
- shadcn/ui (official skill) and Magic UI (official skill) as web specialists for React, both
  MIT, pinned and installed for the web group. Magic UI is limited to recorded motion moments
  and filtered against the AI-generated color and motion signatures.
- Documentation references for WAI-ARIA APG, React Native Reusables, the Flutter widget catalog,
  Compose Material 3 components, Apple HIG components and the A2UI catalog.

### Changed
- Foundation ownership is explicit (`core/decision-engine.md` §3): UUPM search owns research
  evidence, Impeccable shape owns the UX plan (users, tasks, hierarchy, flows, states), and
  Impeccable onboard or a targeted UUPM re-query only fill gaps. UUPM may cover both only when
  its output contains every UX output and shape is unavailable or the task is Small. UUPM
  style/palette results stay provisional references and cannot override art direction, the
  premium monochrome default or the AI-signature lists. Shape used for concept runs as a
  separate activation with its own alternatives.
- Ownership by stage (`core/decision-engine.md` §3): one owner per decision, with advisors and
  forbidden shortcuts. The color and motion postures and the AI-signature lists constrain every
  driver and specialist (they choose values inside them); Impeccable colorize runs only when more
  color is wanted. Design system splits into create (owning driver, Expo design-system, shadcn)
  and record (Impeccable document, never creation). Project and platform components are always
  checked before component specialists. Motion build names its primary owner per platform and
  its specialized skills; Emil choreograph joins whenever several elements move. Review adds
  `motion-review` whenever motion ships. Concept and art direction are always separate
  activations, including when frontend-design serves both.
- The execution-record checker enforces these rules: `impeccable/document` cannot create a
  system, UUPM cannot stand in for UX analysis while Impeccable shape is available, concept needs
  its own activation, shipped motion needs `motion-review`, and `visual_review` now requires
  `boldness`, `component-contract` and (with motion) `motion-smoothness`.

### Removed
- Lucian UX/UI from the specialist catalogue, registry, routing and notices.

## [1.4.3] - 2026-11-11

### Changed
- README rewritten around the problem, what you get, how it works (one install that detects the
  project and installs matching specialists) and the full design process with shorter paths for
  smaller tasks. Runtime requirements moved to `docs/usage.md`.

## [1.4.2] - 2026-11-11

### Changed
- Bold by default: original work and open-ended redesigns record an ambition level (`bold`
  unless the brief, brand or surface calls for restraint) and one named decisive move that
  must survive build and review.
- Premium monochrome color posture (`references/visual-design.md` §4): without a user or
  brand color direction, palettes are black/white/dark OKLCH value ramps with one temperature
  and at most one rare accent; richness comes from photography, material and type. Includes
  six monochrome archetypes and accessible-contrast rules (no tiny or faint "premium" text).
- AI-generated color signatures are banned unless a user or brand requires them: indigo/violet
  accents, purple/pink/teal multi-hue gradients, neon on dark, gradient headline text, glow
  blobs, violet-tinted dark backgrounds, colored glass and glow shadows. Gradients must have a
  job (light, material, data or brand) and pass a two-question removal/swap test.
- Safe-default traps (lazy mono, gold-and-italic reflex, editorial beige, SaaS gray, dark glow)
  are flagged unless the brief asks for them.
- Web, iOS, Android and Flutter guides add OKLCH/wide-gamut APIs and replace template purple
  defaults (Material baseline `#6750A4`, Flutter `deepPurple` seed).
- Smooth motion by default (`references/motion-principles.md` §0): new surfaces and redesigns
  ship a motion signature, choreographed entrances and interruptible, velocity-preserving
  transitions at 60/120 fps, with shared motion tokens and a reduced-motion path. The design and
  redesign workflows run the motion stage by default (`motion_required` defaults to true), the
  visual craft gate adds Motion smoothness, and AI-generated motion signatures (fade-up on
  everything, bouncy springs, hover-scale everywhere, typewriter text, scroll-jacking) are banned.
- Visual craft gate adds a Boldness dimension and fails AI-generated color signatures or flat
  mid-gray monochrome; a new conflict ruling stops reviewers and anti-generic specialists from
  flattening an accepted bold direction without a concrete defect.
- README rewritten around the new direction; disclaimers moved behind links.
- Repository cleanup: internal plans, early research, superseded scenarios, uncited run logs
  and the archived Vahl showcase media are no longer tracked (kept locally, listed in
  `.gitignore`).

## [1.4.1] - 2026-11-10

### Fixed
- Keep project installation automatic when no web/mobile framework is detected: install the
  full specialist catalogue locally instead of requiring a platform flag. Recognized projects
  still receive the matching subset; global installs still include the full catalogue.

### Changed
- Replace the README demo with VELTORA Noir, a fictional luxury perfume campaign, with
  responsive stills, smooth motion exports, reduced-motion support and reproducible sources.
- Expand npm and plugin discovery keywords for supported agents, design disciplines and platforms.

## [1.4.0] - 2026-11-10

### Added
- Orchestration contract (`core/orchestration.md`): full-design work runs ten ordered stages
  (inspect → foundation → concept → direction → system → components → motion → implement →
  validate → review) with execution receipts, accepted handoffs and separate UX/design and
  technical reviews. Built-in fallback requires evidenced candidate checks and is reported as limited.
- `scripts/check-orchestration.py` (Python standard library) checks schema 2 execution records
  for stage order, inputs, ownership, receipts, review independence and evidence levels.
- Bounded adapters (`core/adapters.md`): frontend-design serves concept reasoning without
  becoming a second driver.
- Creative-improvement contract for open-ended polish/Refresh, a visual craft gate, and
  `references/spatial-design.md` for requested or chosen 3D.
- `docs/architecture.md` and execution-contract regression tests.

### Changed
- Improvement and Refresh separate creative refinement from exact corrections; design-system
  Create runs foundation, concept and art direction before tokens.
- Scoped workflows scale with size. An exact correction routes no specialist. Small open-ended
  refinement uses one scoped specialist and a self-check, and Medium adds one UX/design reviewer.
  The outcome test and default-on presumption return for non-full-design slots; more than 5
  routed slots outside full-design is flagged as over-engineered. Full-design is unchanged.
- The orchestration contract documents the full stage `inputs` matrix that the record checker
  enforces, with a test keeping both in sync.

### Fixed
- Require an eligible routing candidate for the selected driver on every surface.
- Require declared sequential mode for built-in technical self-review and validate evidence-level arrays.
- Reject unrelated or failed activations as the previous visual review when resolving negative feedback.
- Exclude Python bytecode/cache files from npm packages, including after local validation.
- Use absolute repository documentation and media URLs in README for npm compatibility.

## [1.3.0] - 2026-11-09

### Added
- Global npm installs provision all 46 supported specialist skill folders from 13 pinned sources.
  Project installs detect web/mobile and workspace apps, then install the relevant subset.
- `--platform web|mobile|all`, `--dry-run` and `--orchestrator-only` for unknown projects, previews
  and offline/minimal installs. Existing user-managed skills are preserved.
- Sparse Git downloads retain original licence/NOTICE files, source provenance and hashes.
  README-only MIT grants preserve the original README plus permission terms. Downloads are
  prepared before committing the skill installation; failures do not silently degrade to an
  orchestrator-only success. No SDKs, app libraries, setup scripts or hooks run during install.
- Detection, selection, real local Git-source, licence, collision and symlink-escape tests.

### Fixed
- Preserve supplementary original notices for Lucide/Feather, vscode-icons, Simple Icons,
  gilbarbara/logos and ehmo platform references. Verify Taste asset-credit manifests and repair
  missing notices or damaged credits on managed reruns, including at the same source revision.
- Retain original source bytes regardless of Git's `core.autocrlf` setting; include asset usage
  guidance and release-gate/package checks for the supplementary notices.

## [1.2.0] - 2026-11-09

### Changed
- Extend the fast path to one fully specified, low-risk component inside an existing design
  system. Skip specialist selection and routine planning; retain static, build, visual and
  applicable interaction checks. Escalate when the inspected scope no longer qualifies.
- Shorten routine summaries and final reports. Keep process records in working context unless
  the user or project requests documents; disclose unavailable verification.
- Clarify callback reuse versus changes to state/data-flow architecture. Require interaction
  checks for normal design implementation as well as the component shortcut.

### Added
- Four paired execution cases and a comparison tool that rejects mismatched setups and missing
  measurements. Reports distinguish unverified visuals and unavailable tokens. Comparative
  execution gains are not claimed until actual runs have been measured.

## [1.1.1] - 2026-11-09

### Fixed
- Include project and third-party licence/NOTICE files in the npm package and installed skill.
  Preserve original upstream texts with source revisions and SHA-256 hashes.
- Add an offline licence gate to CI and npm prepublish checks, plus packaged-install tests.
- Keep frontend-design as the only automatic plugin dependency. Move five specialists to
  author-managed installs because their selected folders lacked complete licence/NOTICE files.
- Remove the unlicensed dickwu Apple Design skill from active routing and recommendations.
  Use official Apple guidance and licensed reviewers. Historical test results are unchanged;
  the current routing answer key records this change.

## [1.1.0] - 2026-11-06

### Added
- The Claude Code plugin now installs six specialist skills as plugin dependencies: Impeccable,
  Taste, UI UX Pro Max, eight of Emil Kowalski's motion skills, Anthropic `frontend-design` and
  Vercel `web-design-guidelines`.
  - Each is fetched from its author's repository at a pinned, verified commit, using sparse
    checkouts so only the listed skills load (about 2,600 tokens per session in total).
  - `uninstall --prune` removes them again.
- The skill registry matches plugin-namespaced skill names (`plugin:skill`) on the part after the
  colon.

### Changed
- README "Comes with a design team" section. The usage guide documents the dependencies,
  Impeccable's hooks and telemetry, and manual installs for other agents.

## [1.0.0] - 2026-11-06

First public release (Phase 5: packaging).

### Added
- Claude Code plugin and marketplace manifests (`.claude-plugin/`). Install with
  `/plugin install uiux-orchestrator --marketplace grayxcviii/uiux-orchestrator`.
- `docs/usage.md`: the commands, the request → workflow table, and real example output.
- CI (`.github/workflows/validate.yml`) runs `scripts/validate.py` on every push.
- `validate.py` checks that the plugin, marketplace and SKILL.md versions agree.

### Changed
- README rewritten around install and usage. It has a supported-agents table, with only Claude
  Code and Codex CLI marked as tested.
- Decision engine: one more "not a reason to skip" row, for "heavy for such a small screen" or "it
  spawns sub-agents" when the slot is central. Found in a Phase 5 example run: a dashboard review
  skipped the installed `impeccable/critique` for that reason. Re-test in
  `tests/results/2026-11-06-phase5-packaging.md`.
- CONTRIBUTING: the slot index location and a release checklist.

### Not tested
- `npx skills add`: the CLI could not be run in this environment, so it is not documented as an
  install method.
- Agents other than Claude Code and Codex CLI.

## [0.6.0] - 2026-11-06

Pre-release review: two independent reviewers, then fixes and re-tests
(`tests/results/2026-11-06-prerelease-review.md`).

### Changed
- Decision engine rewritten:
  - outcome test first, default-on as a presumption with explicit exceptions;
  - the slot index (preference-ordered) lives here and is enforced against the registry;
  - one driver table;
  - the Execution Plan records all 12 decisions: investigation depth, platform guidance, a11y audit,
    validation tools and the rest.
- `critique` slot split into `ux-critique`, `tech-audit`, `platform-conformance`, `code-review`.
- SKILL.md:
  - slot table moved out, saving about 1.3k tokens on the fast path;
  - evidence-level line added;
  - hard rules added for untrusted tool output and non-interactive runs.
- Registry:
  - every entry has `required_inputs`, `expected_outputs`, `capabilities`;
  - platform and framework ids defined and validated;
  - `animate-expo` also fills `motion-performance`;
  - Impeccable critique covers Android/iOS platform conformance.
- Project intelligence:
  - lockfiles as the version source;
  - monorepo package discovery;
  - Expo Router `src/app/`;
  - explicit arch flags win over defaults (and can differ between Android and iOS);
  - Views Material 2 vs. 3;
  - Vue, Svelte and Angular motion signals;
  - `CupertinoThemeData`;
  - `unknown (<why>)`.
- Gates are canonical in the workflow files. "L1 + L2" wording. Polish routed only for polish-level
  findings.
- Scripts:
  - fail on load errors and HTTP ≥ 400;
  - per-call timeouts;
  - Chrome and profile cleanup on every path;
  - `--help`, `--opt=value`, real `--full` page capture;
  - `--no-sandbox` as root;
  - count of text not contrast-checked.
- `validate.py`: registry fields, platform/framework ids, a two-way slot-index check, script syntax,
  a 180-day freshness warning.

### Added
- Real triggering test (`claude -p`, real install), file-based detection fixtures
  (`tests/fixtures/detect/`), a Codex CLI test, a native iOS run via agent-device, and a full
  39 + 8 re-run on v0.6 (`tests/results/`).

### Moved
- Superseded scenario sets moved to `tests/archive/`. Contributor schema is in `docs/registry-schema.md`.

## [0.5.0] - 2026-11-06

### Added
- Registry:
  - `anthropic/frontend-design`: a light driver for a single new web page or small surface;
  - `dickwu/apple-design`: a HIG reviewer for Apple platforms, including RN/Flutter iOS builds,
    with rules for the clash with Emil's `apple-design`.
  - Both were verified against their SKILL.md at a recorded commit.
- Bundled zero-dependency validation scripts (`scripts/ui-check.mjs`, `scripts/motion-trace.mjs`,
  `scripts/lib/cdp.mjs`). Each includes a minimal WebSocket client and runs on Node 18+ with the
  system Chrome. Verified on the fixture (`tests/results/2026-11-06-scripts.md`).
- Scenarios S35–S39. Answer key v3: changes listed in `answer_key_changes_v3`.

### Changed
- Slot table, review workflow and conflict rulings cover the two new skills.
- Quality gates and platform files point to the bundled scripts, with their limits stated.
- `scripts/validate.py` syntax-checks the bundled scripts.
- `scripts/score_routing.py`: fixed source-suffixed `apple-design` names being mapped before
  disambiguation.

## [0.4.0] - 2026-11-06

### Added
- 34 routing scenarios (`tests/scenarios.json`) covering every requested category, plus 8 held-out
  scenarios (`tests/scenarios-heldout.json`).
- Routing harness: decision schema, prompts, shuffled batches (`tests/harness/`), and
  `scripts/score_routing.py`, which reports metrics 1–5 plus fast-path, mutation, driver, ask,
  status honesty and loading.
- `tests/benchmark.md`: 68 + 34 + 16 with-skill decisions and 42 baseline decisions;
  targets vs. measured; cost; threats to validity.
- `docs/registry-schema.md`: contributor schema, moved out of the installed skill.

### Changed
- Intake defines canonical intent ids and maps them to workflows. High-risk plans need user
  confirmation. Read-only reviews are low risk.
- Quality gates: a visual-verification ask with no rendering possible → `Needs review`.
- Registry:
  - skills whose hard `requires` can't be met are unavailable even if installed;
  - network handling;
  - no install hints for deliberately excluded skills;
  - provider bundles (e.g. GSAP) count as one pick.
- Decision engine:
  - mode ids;
  - a driver's other command may review only in a fresh context.
- Fast path allows validation-only tooling and names the files to read. Agents read only the
  workflow files they picked.
- Animation: a "Discover + build" sub-type for "make it feel alive".
- Execution policy: rule for a scoped request on a global value.
- Design exploration status rule. Accessibility workflow routes its automated check to
  `impeccable/audit`. The design-system Document gate no longer requires L4.
- `core/skill-registry.md` reduced by about 35% (compact field glossary).

## [0.3.0] - 2026-11-06

### Added
- Sample projects in `tests/fixtures/`:
  - `web-app`: Vite + React 19 + Tailwind v4 with planted UX problems, and a puppeteer-core
    screenshot harness that uses the system Chrome;
  - `expo-onboarding`: SDK 58.
- Phase 3 runs (`tests/results/2026-11-06-phase3-execution.md`): 8 execution runs that each made
  real edits, ran builds and took screenshots, plus 2 plan-only routing probes, in two rounds. Six integrations ran for real:
  Impeccable critique/audit/detect, Lucian, Vercel guidelines, Emil animate-expo, UUPM search, and
  the Taste prerequisite check.
- Per-skill `brief` fields in the registry (what to pass, what to skip, what to take back), and a `cost` field.
- `data-visualization` slot; chart-choice fallback in `references/visual-design.md` §8.

### Changed
- Fast path is now an explicit eligibility check before the decision engine. Only bug-fix and
  improvement tasks qualify, with no design judgment asked, at Small size and low risk. Reviews never
  take it.
- Default-on specialists: recommended entries with high value-if-missing are used when available,
  unless there is a concrete reason to skip. A table lists rejected excuses.
- Animation tool decision: CSS first for simple state changes; an installed-but-unused library must
  justify its bundle cost.
- Execution policy:
  - read-only allows build outputs and evidence written to temp or gitignored locations;
  - missing backend: keep existing no-ops and mark the integration point;
  - "shared" means it has other usages;
  - check a tool is configured before running it.
- Quality gates:
  - motion evidence without recording tools;
  - mobile automation limits;
  - explicit simulator UDIDs;
  - react-native-web fallback labelled as non-device evidence.
- Conflict rulings: skill fidelity vs. layout fit; tokens failing floors; workflow rule vs. skill recipe.
- The driver can't be its own reviewer. Handoff records are optional for single-agent Small/Medium work.

## [0.2.0] - 2026-11-06

### Added
- Platform files `platforms/{web,react-native,ios,android,flutter}.md`. Each has the same 13-section
  layout: version gates, principles, layout/adaptive, typography, color, components, navigation,
  interaction, accessibility, animation, performance, validation commands, common mistakes, and
  sources.
- Version gates verified against official sources on 2026-11-06. Highlights:
  - Expo SDK 58 / RN 0.88 (New Architecture can't be disabled from RN 0.82 / SDK 55);
    Reanimated 4.7 (3.x unmaintained); Gesture Handler 3 hooks API; `@expo/ui` stable.
  - iOS 27 / Xcode 27 (Liquid Glass mandatory, old-design opt-out removed); HIG text styles and
    control sizes.
  - Android 17 (API 37); Material3 1.4 stable with Expressive in 1.5 RC; edge-to-edge and
    predictive back by targetSdk; window size classes up to extra-large.
  - Flutter 3.47 (`material_ui`/`cupertino_ui` packages, Impeller, predictive back default).
  - Web Baseline status of new CSS features; Core Web Vitals; React 19.3 `<ViewTransition>` stable.
- References `references/{visual-design,motion-principles,accessibility}.md`. They contain
  cross-platform principles, WCAG 2.2 AA criteria, and a platform API mapping.
- Phase 2 test run (`tests/archive/phase2-scenarios.md`, `tests/results/2026-11-06-phase2-platforms.md`).

### Changed
- SKILL.md links every platform and reference file directly (one level deep, per the spec).
- Animation and accessibility workflows link to the references instead of duplicating tables.
- Touch-target floor: iOS uses the HIG default of 44 pt for touch-first controls (HIG minimum is 28 pt).
- Conflict resolution: new ruling for old-OS customizations versus a new system design.
- Registry: 5 new verified references; `animate-expo` complements SWM; Callstack install hint fixed;
  `expo/ui` status noted.

## [0.1.0] - 2026-11-06

### Added
- Phase 0 research (`docs/phase-0-research.md`): Agent Skills spec constraints, verified analysis of
  UI UX Pro Max, Taste 2.5, Lucian, Impeccable 4.8, GSAP and Emil Kowalski skills, extra sources
  (Expo, Software Mansion, Callstack, Android, Vercel, SwiftUI Pro), a capability matrix, overlaps,
  the conflict model, the architecture, routing examples, no-call cases and the MVP plan.
- The `uiux-orchestrator` skill: `SKILL.md` hub with the pipeline, the capability-slot routing table,
  hard rules and the report format.
- Core: intake (intent, complexity, risk), project intelligence, decision engine, registry schema and
  availability detection, conflict resolution, design-to-code handoff, execution policy, validation
  engine and quality gates.
- Workflows: design, redesign (Refresh/Replace), improvement, animation (per-platform tool ladder),
  review, bug fix, design system, accessibility.
- Registry: 61 skill entries across 11 providers and 18 reference sources.
- `scripts/validate.py`: spec and consistency checks.
- Baseline (no skill) and with-skill routing runs on 8 scenarios, plus a re-test after refactor
  (`tests/results/`).

### Changed (after the with-skill run)
- Missing render tooling now limits the validation status instead of raising risk.
- Size and risk are provisional at intake and finalized after project inspection.
- The fast path allows token changes only when the token itself is what the user asked to change,
  and it still collects the gate's evidence.
- The animation tool decision checks the installed library first; GSAP needs a reason and permission.
- Registry: added a `complements` field; `requires` is now hard prerequisites only; added a rule for
  unregistered installed skills; entries are read by searching ids.
