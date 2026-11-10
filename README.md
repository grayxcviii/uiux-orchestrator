<h1 align="center">UIUX Orchestrator</h1>

<h3 align="center">Professional UI/UX, from concept to code.</h3>

<p align="center">
  Give your interface a clear concept and a cohesive experience.<br>
  UIUX Orchestrator guides your coding agent through UX structure, visual direction,
  interaction and implementation — shaped around your product and brand.
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

<sub>VELTORA Noir — a fictional luxury perfume campaign, created as an illustrative showcase. [Still](https://raw.githubusercontent.com/grayxcviii/uiux-orchestrator/main/docs/assets/veltora-overview.jpg) · [Motion film](https://raw.githubusercontent.com/grayxcviii/uiux-orchestrator/main/docs/assets/veltora-demo.mp4) · [Mobile](https://raw.githubusercontent.com/grayxcviii/uiux-orchestrator/main/docs/assets/veltora-mobile.jpg) · [Source](https://github.com/grayxcviii/uiux-orchestrator/blob/main/docs/showcase/README.md)</sub>

## A concept that carries through the whole interface

Professional UI/UX brings usability and visual identity together. UIUX Orchestrator helps your
agent establish that direction, explore alternatives when requested, and carry the chosen
concept through to a working web or mobile interface.

- **UX with purpose.** Define user flows, content hierarchy, primary actions and interaction states.
- **A modern, specific visual concept.** Turn your requested style and color intensity into concrete palette, typography, composition and media choices before building. Review the render against that brief, while respecting supplied designs and existing brands.
- **Depth that fits the subject.** Choose photography, expressive composition, rendered assets or interactive 3D from the actual brief. More effects do not establish better design; spatial work still needs convincing materials, lighting and responsive fallbacks.
- **Design decisions that survive implementation.** Coordinate specialist work around the chosen concept, existing tokens and project constraints.
- **Creative ambition on edits too.** New concepts, redesigns and open-ended polish explore distinct approaches and show a concrete visual or experience improvement. Existing tokens guide the work; they do not waive concept reasoning. Exact supplied fixes retain fidelity and scope.
- **Review and refinement.** Check usability, accessibility and implementation; inspect rendered output when tooling allows and disclose unverified details.

**Research & foundation → concept reasoning → art direction → finalized design system → motion & implementation → review → refine.**

[Architecture and skill boundaries →](https://github.com/grayxcviii/uiux-orchestrator/blob/main/docs/architecture.md)

Already have a design system or a supplied design? It follows that direction. Small, specified
changes take a shorter path without starting a new concept exercise.

Includes guidance for **web, React Native, iOS, Android and Flutter**. Install for Claude Code,
Codex, Cursor, Gemini CLI, GitHub Copilot, OpenCode or Windsurf, with the models your agent supports.
[Tested coverage →](https://github.com/grayxcviii/uiux-orchestrator/blob/main/docs/usage.md#supported-agents)

## Get started

```bash
npx uiux-orchestrator install           # this project
npx uiux-orchestrator install --global  # all your projects
```

Installs UIUX Orchestrator and its specialists together: relevant web/mobile skills for the
current project, or the full supported catalogue globally.

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

UIUX Orchestrator assigns and executes compatible specialists for each required role, from UX
and concept through design-system work, motion and separate design/technical reviews. Every
execution needs a receipt and accepted output; an available suitable specialist cannot be
replaced with "I can do this myself". Built-in coverage requires evidenced gaps and is reported
as limited. The record checker validates consistency; it cannot authenticate execution receipts
or establish visual quality. UI-quality claims still need observed renders and review.
The new visual comparison cases are evaluation specifications, not measured proof of improvement.
[Evaluation coverage](https://github.com/grayxcviii/uiux-orchestrator/blob/main/tests/README.md).
[Execution contract →](https://github.com/grayxcviii/uiux-orchestrator/blob/main/skills/uiux-orchestrator/core/orchestration.md)

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

The archived Vahl demo photos are used under the [Pexels licence](https://www.pexels.com/license/), with
[credits](https://github.com/grayxcviii/uiux-orchestrator/blob/main/docs/assets/CREDITS.md). No pictured car manufacturer endorses this project.

---

[Usage](https://github.com/grayxcviii/uiux-orchestrator/blob/main/docs/usage.md) · [How it works](https://github.com/grayxcviii/uiux-orchestrator/blob/main/docs/how-it-works.md) · [Contributing](https://github.com/grayxcviii/uiux-orchestrator/blob/main/CONTRIBUTING.md)

**Built something you're happy with? Give UIUX Orchestrator a ⭐.**
