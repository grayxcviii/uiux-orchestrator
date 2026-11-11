<h1 align="center">UIUX Orchestrator</h1>

<h3 align="center">Stop shipping safe, forgettable UI.</h3>

<p align="center">
  UIUX Orchestrator turns your coding agent into a small design team: UX structure, a bold
  product-specific visual direction, motion and implementation, reviewed against the brief
  before it calls the work done.
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

## What changes in your agent's output

- **Premium monochrome by default.** Without a color brief, palettes are black, white and dark
  value ramps built in OKLCH, with one temperature and at most one rare accent. Richness comes
  from photography, material and typography. Your brand or color request always wins.
- **No AI-generated colors.** Indigo and violet accents, purple-to-blue gradients, neon on dark,
  gradient headline text and glow blobs are banned unless you or your brand ask for them.
- **Bold, not bland.** Original work commits to a named decisive move, such as an oversized type
  crop, a full-bleed black field or a dramatic photographic crop. Later stages keep it instead of
  sanding it down.
- **Smooth motion, built in.** New surfaces and redesigns ship a motion signature, choreographed
  entrances and fluid, interruptible transitions on compositor-only properties, with a reduced-motion
  path, checked with a motion trace when tooling allows. No fade-up-on-everything, bouncy springs or scroll-jacking.
- **UX first.** It defines flows, hierarchy, primary actions and every interaction state, and
  keeps conventions where users rely on them.
- **Specialists, coordinated.** The right design, motion, platform and review skills run in order
  without overriding one another.
- **Proof, not claims.** Rendered output is reviewed for brief fit, boldness, craft, accessibility
  and responsive behavior. Unverified details are disclosed.

**Research → concept → art direction → design system → motion & build → review → refine.**
[Architecture →](https://github.com/grayxcviii/uiux-orchestrator/blob/main/docs/architecture.md)

Have a design system, a brand or a supplied design? It invents within those constraints, and
small specified fixes take a short path. Works for **web, React Native, iOS, Android and
Flutter**, in Claude Code, Codex, Cursor, Gemini CLI, GitHub Copilot, OpenCode and Windsurf.
[Tested coverage →](https://github.com/grayxcviii/uiux-orchestrator/blob/main/docs/usage.md#supported-agents)

## Get started

```bash
npx uiux-orchestrator install           # this project
npx uiux-orchestrator install --global  # all your projects
```

Installs UIUX Orchestrator and its specialists together. Project installs automatically detect
your web/mobile framework and select the matching skills. In a new or unrecognized project,
the installer automatically installs the full web/mobile catalogue locally — no platform flag
required. Global installs always include the full supported catalogue.

Requires Node.js 18+; specialist downloads also need Git and network access.
Full-design execution-record checks use Python 3 (standard library only).
Specialists can require newer runtimes; for example, Taste requires Node.js 22+.
The runtime probe checks installed alternatives without changing your default Node version.
[Agent selection and setup options →](https://github.com/grayxcviii/uiux-orchestrator/blob/main/docs/usage.md#install-update-remove)

## Tell it what you want

Open your agent in the project and ask:

```text
Use uiux-orchestrator to redesign this dashboard.
Keep our components and brand colors. Make the main actions easier to find.
```

Or explore before building:

```text
Use uiux-orchestrator to propose three distinct UI/UX concepts for our productivity app.
Explain the user flow, visual direction and motion. Let me choose before implementation.
```

Ordinary UI/UX prompts can activate it automatically; naming it explicitly requests the workflow.
In Claude Code, use `/uiux-orchestrator <request>`. Restart the agent session after installation
if the skill is not visible.

## Specialist integrations

Each required role, from UX and concept through motion and the separate design and technical
reviews, is assigned to a compatible specialist that actually runs. Built-in fallbacks are used
only when a gap is evidenced, and are reported as limited.
[Execution contract →](https://github.com/grayxcviii/uiux-orchestrator/blob/main/skills/uiux-orchestrator/core/orchestration.md) ·
[Evaluation coverage →](https://github.com/grayxcviii/uiux-orchestrator/blob/main/tests/README.md)

| Expertise | Independent skill projects |
|---|---|
| Research & foundation | [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) |
| Concept reasoning | [frontend-design](https://github.com/anthropics/skills), in an explicitly bounded planning mode |
| Art direction | [Taste](https://github.com/Leonxlnx/taste-skill), or another compatible visual driver |
| Components | [Lucian](https://github.com/Seokwoooo/lucian-uxui), project and platform components |
| Review & polish | [Impeccable](https://github.com/pbakaus/impeccable), [Vercel agent-skills](https://github.com/vercel-labs/agent-skills) |
| Motion | [Emil Kowalski's skills](https://github.com/emilkowalski/skills), [GSAP skills](https://github.com/greensock/gsap-skills) |
| Mobile | [Expo](https://github.com/expo/skills), [Software Mansion](https://github.com/software-mansion-labs/skills), [Callstack](https://github.com/callstackincubator/agent-skills), [Android skills](https://github.com/android/skills), [SwiftUI Pro](https://github.com/twostraws/SwiftUI-Agent-Skill) |

Selection depends on the task; user-invoked skills require an explicit request.
[Catalogue and setup →](https://github.com/grayxcviii/uiux-orchestrator/blob/main/docs/usage.md#recommended-skills)

## License & credits

UIUX Orchestrator's original code and instructions are licensed under [MIT](https://github.com/grayxcviii/uiux-orchestrator/blob/main/LICENSE).
Third-party skills retain their authors' copyrights and their own licences; they are independent
projects, with no affiliation or endorsement implied. The npm installer preserves
upstream licence/NOTICE files, supplementary notices and reviewed asset credits. Photos, icons
and other assets can carry separate terms; follow the [asset usage guidance](https://github.com/grayxcviii/uiux-orchestrator/blob/main/skills/uiux-orchestrator/legal/asset-usage.md)
when reusing them in a product. [Full notices and licence texts →](https://github.com/grayxcviii/uiux-orchestrator/blob/main/THIRD_PARTY_NOTICES.md)

---

[Usage](https://github.com/grayxcviii/uiux-orchestrator/blob/main/docs/usage.md) · [How it works](https://github.com/grayxcviii/uiux-orchestrator/blob/main/docs/how-it-works.md) · [Contributing](https://github.com/grayxcviii/uiux-orchestrator/blob/main/CONTRIBUTING.md)

**Built something you're happy with? Give UIUX Orchestrator a ⭐.**
