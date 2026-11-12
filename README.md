<h1 align="center">UIUX Orchestrator</h1>

<h3 align="center">Stop shipping safe, forgettable UI.</h3>

<p align="center">
  <b>Your coding agent, upgraded into a full design team.</b><br>
  One install gives it a researcher, a UX designer, an art director, a motion designer and two
  reviewers, picks the right style for your product, and only calls the work done after it has
  looked at the rendered screen.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/uiux-orchestrator"><img src="https://img.shields.io/npm/v/uiux-orchestrator" alt="npm version"></a>
  <a href="https://github.com/grayxcviii/uiux-orchestrator/actions/workflows/validate.yml"><img src="https://github.com/grayxcviii/uiux-orchestrator/actions/workflows/validate.yml/badge.svg" alt="validate"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/project%20license-MIT-green" alt="Original project work: MIT"></a>
  <img src="https://img.shields.io/badge/web%20%26%20mobile-ready-black" alt="Web and mobile">
</p>

<picture>
  <source media="(prefers-reduced-motion: reduce)" srcset="https://raw.githubusercontent.com/grayxcviii/uiux-orchestrator/main/docs/assets/veltora-overview.jpg">
  <source srcset="https://raw.githubusercontent.com/grayxcviii/uiux-orchestrator/main/docs/assets/veltora-demo.webp" type="image/webp">
  <img src="https://raw.githubusercontent.com/grayxcviii/uiux-orchestrator/main/docs/assets/veltora-demo.gif" alt="VELTORA Noir — a luxury perfume campaign with an amber glass bottle, champagne lighting, elegant serif typography and a slow cinematic transition into the fragrance composition." width="100%">
</picture>

<sub>VELTORA Noir — a fictional perfume campaign built from an explicit classic-luxury brief (gold and serif were requested, not defaults). [Still](https://raw.githubusercontent.com/grayxcviii/uiux-orchestrator/main/docs/assets/veltora-overview.jpg) · [Motion film](https://raw.githubusercontent.com/grayxcviii/uiux-orchestrator/main/docs/assets/veltora-demo.mp4) · [Mobile](https://raw.githubusercontent.com/grayxcviii/uiux-orchestrator/main/docs/assets/veltora-mobile.jpg) · [Source](https://github.com/grayxcviii/uiux-orchestrator/blob/main/docs/showcase/README.md)</sub>

<p align="center">
  <code>npx uiux-orchestrator install</code>
</p>

<p align="center">
  <b>47</b> specialist skills · <b>13</b> design styles · <b>5</b> platforms · <b>7</b> coding agents · <b>49/49</b> routing scenarios passed
</p>

## Why you'll want it

Ask any coding agent for "a beautiful page" and you get the same thing everyone else gets:
purple gradients, glowing blobs, three identical cards and a fade-up on every block. It compiles,
it ships, and nobody remembers it. Installing more design skills rarely helps: they overlap,
contradict each other or never run, and the agent still says "looks great" without ever looking.

UIUX Orchestrator fixes the process, not just the prompt.

| | Plain coding agent | A pile of installed skills | **UIUX Orchestrator** |
|---|---|---|---|
| Visual direction | The same generic look | Whichever skill fires first | **A style chosen for your product and audience** |
| Specialists | None | Overlapping, some never run | **One owner per step, run in the right order** |
| Your design system | Often ignored | Can be overwritten | **Detected and respected** |
| Motion | Fade-up on everything | Inconsistent | **Choreographed, interruptible, reduced-motion ready** |
| "Done" means | The code compiled | The code compiled | **The rendered screen was reviewed** |
| What actually ran | Unclear | Unclear | **A report of every skill used and the evidence** |

## What you get

**A real design team, not a single prompt.** Research, UX, concept, art direction, design system,
components, motion and review are each handed to the specialist that does it best, drawn from
respected open-source skills such as Impeccable, Taste, Emil Kowalski's motion skills, shadcn/ui
and Expo. The orchestrator settles their overlaps up front, so they work together instead of
against each other.

**The right style for every product.** A built-in Style Library of 13 directions, from Editorial
Luxury, Swiss Grid and Dark Premium to Organic Tactile, Instrument and Playful Illustrated, is
matched to your product, audience and brand personality. A clothing store is not assumed to be
luxury: when the answer would change the design, it asks one sharp question. Say "you decide" and
it commits to a direction and tells you why. Name a style and it is kept.

**Premium by default, never generic.** AI-cliché colors (indigo accents, purple-to-blue gradients,
neon on dark, gradient text) are banned unless your brand asks for them. Every design commits to
one memorable decision, and later steps are not allowed to sand it down.

**Motion that feels designed.** Entrances, transitions and feedback are planned with the visuals:
smooth, interruptible, compositor-friendly, with a reduced-motion version built in.

**Components that hold up everywhere.** A component contract covering 22 core components (states,
keyboard, accessibility, motion) maps each one to HTML, SwiftUI, Compose, React Native and
Flutter, and library components are held to the same bar.

**Proof, not promises.** Work is validated by build, interaction and rendered screenshots at real
sizes and themes, then reviewed separately for design and for accessibility. If something could
not be checked, the report says so instead of claiming success.

**Fits your project, not the other way round.** It reads your stack, tokens and components first.
Your design system wins over its own taste, and small fixes take a fast path instead of a full
design process.

**Installs only what you need.** The installer detects web, React Native (Expo or CLI), iOS,
Android and Flutter, adds just the matching specialists from pinned, licence-checked sources, and
removes everything again with one command.

## See it in action

Open your agent in your project and just ask:

```text
Use uiux-orchestrator to redesign this dashboard.
Keep our components and brand colors. Make the main actions easier to find.
```

It understands what you mean, and what you leave open:

```text
Design a landing page for our sustainable clothing brand for young adults.   → Organic Tactile
Design a portfolio site using Swiss Grid.                                     → keeps Swiss Grid
Design a landing page for a clothing store.                                   → asks: luxury, minimalist, bold or sustainable?
Design a clothing landing page. You decide everything.                        → decides and explains why
```

Want options first?

```text
Use uiux-orchestrator to propose three distinct UI/UX concepts for our productivity app.
Explain the user flow, visual direction and motion. Let me choose before implementation.
```

## Get started in 30 seconds

```bash
npx uiux-orchestrator install            # detects your stack and installs the matching specialists
npx uiux-orchestrator install --global   # every project on this machine, full catalogue
npx uiux-orchestrator install --dry-run  # preview the plan, change nothing
npx uiux-orchestrator uninstall          # clean removal of everything it added
```

Using Claude Code? Add it as a plugin with
`/plugin install uiux-orchestrator --marketplace grayxcviii/uiux-orchestrator`, then run the npm
command once to add the stack specialists. Call it any time with `/uiux-orchestrator <request>`.

Works with **Claude Code, Codex, Cursor, Gemini CLI, GitHub Copilot, OpenCode and Windsurf**.
[All options →](https://github.com/grayxcviii/uiux-orchestrator/blob/main/docs/usage.md#install-update-remove)

## How it works

1. **Reads your project:** platform, framework, tokens, components, motion library and tooling.
2. **Chooses a direction:** a style for your product and audience, or your existing brand.
3. **Routes every step** to the installed specialist that owns it, in order, with no overlaps.
4. **Builds** on your stack, keeping your design system and every interaction state.
5. **Proves it:** build, interactions and rendered screenshots, then independent design and
   accessibility reviews.
6. **Reports** what was done, which skills actually ran, and the evidence.

The process scales with the job:

| You ask for | What runs |
|---|---|
| A new product, a new visual world or a full redesign | The complete 11-stage design process |
| A new screen in your existing design system | Your tokens and components, one design specialist, build, design and accessibility review |
| Polish or improvement | One focused specialist; a concept step and audit for larger work |
| Animation | Only the step you need: find, design and build, review, fix jank, or remove |
| A UI/UX review | Read-only, prioritized findings; nothing changes |
| A bug fix or one well-specified component | A fast path: inspect, implement, validate, report |
| A design system or accessibility pass | Document, extend or create a system; or audit, fix and verify |

<details>
<summary><b>The complete 11-stage process</b></summary>

| # | Stage | What happens |
|---|---|---|
| 1 | Inspect | Platform, stack, tokens, components, tooling, installed skills |
| 2 | Design direction | Product, goal, audience and brand personality from your brief; a primary style, at most one complementary style and functional styles for screens like checkout or analytics; one question only if the answer would change the style |
| 3 | Research & UX | Research evidence first, then the UX plan: audience, tasks, hierarchy, flows, states |
| 4 | Concept | 2–3 distinct approaches inside the chosen direction; one chosen with its rationale |
| 5 | Art direction | Palette, type, composition, media and the decisive move |
| 6 | Design system | Final tokens, components, variants, states, contrast |
| 7 | Components & media | Each component checked against the contract, project and platform components reused, shadcn/Magic UI on React, asset rights checked |
| 8 | Motion | Motion signature, choreography, transitions, reduced motion |
| 9 | Build | Working code on your stack, every interaction state |
| 10 | Validate | Build, interactions and rendered screenshots at real sizes |
| 11 | Review & refine | Separate design, technical/accessibility and motion reviews; fix and re-check |

</details>

[Architecture →](https://github.com/grayxcviii/uiux-orchestrator/blob/main/docs/architecture.md) ·
[How it works in detail →](https://github.com/grayxcviii/uiux-orchestrator/blob/main/docs/how-it-works.md)

## Built on the best open-source design skills

| Expertise | Skills it coordinates |
|---|---|
| Research & UX | [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) for research, [Impeccable](https://github.com/pbakaus/impeccable) for the UX plan |
| Concept & art direction | [Taste](https://github.com/Leonxlnx/taste-skill) for marketing sites, Impeccable for product surfaces, [frontend-design](https://github.com/anthropics/skills) for single pages and concept work |
| Components | [shadcn/ui](https://github.com/shadcn-ui/ui) and [Magic UI](https://github.com/magicuidesign/magicui) on React; project and platform components everywhere |
| Review & polish | Impeccable, [Vercel agent-skills](https://github.com/vercel-labs/agent-skills) |
| Motion | [Emil Kowalski's skills](https://github.com/emilkowalski/skills), [GSAP skills](https://github.com/greensock/gsap-skills) |
| Mobile | [Expo](https://github.com/expo/skills), [Software Mansion](https://github.com/software-mansion-labs/skills), [Callstack](https://github.com/callstackincubator/agent-skills), [Android skills](https://github.com/android/skills), [SwiftUI Pro](https://github.com/twostraws/SwiftUI-Agent-Skill) |

Every skill is fetched from a pinned commit of its original repository, with its licence and
credits preserved. [Catalogue →](https://github.com/grayxcviii/uiux-orchestrator/blob/main/docs/usage.md#recommended-skills)

## Tested like software

- **49 routing scenarios** across web, React Native, iOS, Android and Flutter, including 8
  held-out cases never used for tuning. In the latest run it chose the required specialists in
  all 49. [Results →](https://github.com/grayxcviii/uiux-orchestrator/blob/main/tests/results/2026-11-12-context-reduction.md)
- **93 core rules** are guarded by tests, so a rewrite can never silently drop one.
- **Every release** runs installer, licence, style-engine and orchestration-record checks in CI.

## FAQ

**Will it override my design system?** No. Your tokens, components and brand are detected first
and always win. The style library only fills in what your system does not decide.

**Does it work on mobile?** Yes: React Native (Expo and CLI), native iOS (SwiftUI, UIKit), native
Android (Compose, Views) and Flutter, each with platform-specific guidance and validation.

**Is it slower or more expensive than a plain prompt?** A full design runs several specialists, so
it takes longer and uses more tokens, which is what buys the better result. Small fixes take a
fast path with little overhead.

**Will it install things without asking?** No. It never installs packages, SDKs or tools, or
changes your architecture, without your permission. Review-only requests change no files.

**Which agents are supported?** It is fully tested in Claude Code and Codex CLI. The installer
also sets it up for Cursor, Gemini CLI, GitHub Copilot, OpenCode and Windsurf, which use the same
open Agent Skills format.

**What do I need?** Node.js 18+, plus Git and network access for the specialist download. Rendered
checks use Chrome, Chromium or Edge (or a simulator/emulator on mobile).

## License & credits

UIUX Orchestrator's original code and instructions are [MIT](https://github.com/grayxcviii/uiux-orchestrator/blob/main/LICENSE).
Third-party skills are independent projects that keep their authors' copyrights and licences; no
affiliation or endorsement is implied. The installer preserves their licence/NOTICE files and
asset credits. Assets can carry separate terms: see the [asset usage guidance](https://github.com/grayxcviii/uiux-orchestrator/blob/main/skills/uiux-orchestrator/legal/asset-usage.md)
and [full notices](https://github.com/grayxcviii/uiux-orchestrator/blob/main/THIRD_PARTY_NOTICES.md).

---

[Usage](https://github.com/grayxcviii/uiux-orchestrator/blob/main/docs/usage.md) · [How it works](https://github.com/grayxcviii/uiux-orchestrator/blob/main/docs/how-it-works.md) · [Contributing](https://github.com/grayxcviii/uiux-orchestrator/blob/main/CONTRIBUTING.md)

**Shipped something people remember? Give UIUX Orchestrator a ⭐ so others can find it.**
