<h1 align="center">UIUX Orchestrator</h1>

<h3 align="center">Professional UI/UX, from concept to code.</h3>

<p align="center">
  Give your interface a clear concept and a cohesive experience.<br>
  UIUX Orchestrator guides your coding agent through UX structure, visual direction,
  interaction and implementation — shaped around your product and brand.
</p>

<p align="center">
  <a href="https://github.com/grayxcviii/uiux-orchestrator/actions/workflows/validate.yml"><img src="https://github.com/grayxcviii/uiux-orchestrator/actions/workflows/validate.yml/badge.svg" alt="validate"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/project%20license-MIT-green" alt="Original project work: MIT"></a>
  <img src="https://img.shields.io/badge/web%20%26%20mobile-ready-black" alt="Web and mobile">
</p>

<picture>
  <source srcset="docs/assets/vahl-demo.webp" type="image/webp">
  <img src="docs/assets/vahl-demo.gif" alt="UIUX Orchestrator demo: an animated landing page with model tabs and an interactive charging simulator" width="100%">
</picture>

<sub>Demo: Vahl, a fictional brand. [Before & after](docs/assets/vahl-fullpage.jpg) · [Photo credits](docs/assets/CREDITS.md)</sub>

## A concept that carries through the whole interface

Professional UI/UX brings usability and visual identity together. UIUX Orchestrator helps your
agent establish that direction, explore alternatives when requested, and carry the chosen
concept through to a working web or mobile interface.

- **UX with purpose.** Define user flows, content hierarchy, primary actions and interaction states.
- **A coherent visual concept.** Connect typography, color, layout, components and motion to your brand and audience.
- **Design decisions that survive implementation.** Coordinate specialist work around the chosen concept, existing tokens and project constraints.
- **Review and refinement.** Check usability, accessibility and implementation; inspect rendered output when tooling allows and disclose unverified details.

**Understand the product → shape the concept → design the experience → build → review → refine.**

Already have a design system or a supplied design? It follows that direction. Small, specified
changes take a shorter path without starting a new concept exercise.

Includes guidance for **web, React Native, iOS, Android and Flutter**. Install for Claude Code,
Codex, Cursor, Gemini CLI, GitHub Copilot, OpenCode or Windsurf, with the models your agent supports.
[Tested coverage →](docs/usage.md#supported-agents)

## Get started

```bash
npx uiux-orchestrator install           # this project
npx uiux-orchestrator install --global  # all your projects
```

Automatic specialist setup arrives in **v1.3.0**: web/mobile skills per project, the full catalogue
globally. Available in GitHub source; npm release pending. Current npm installs the orchestrator only.

Requires Node.js 18+; specialist downloads also need Git and network access.
[Agent selection and setup options →](docs/usage.md#install-update-remove)

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

UIUX Orchestrator selects and activates compatible installed specialists where they help,
coordinating their work through implementation and validation. Built-in guidance covers gaps.

| Expertise | Independent skill projects |
|---|---|
| Visual direction | [frontend-design](https://github.com/anthropics/skills), [Taste](https://github.com/Leonxlnx/taste-skill) |
| Design data & components | [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill), [Lucian](https://github.com/Seokwoooo/lucian-uxui) |
| Review & polish | [Impeccable](https://github.com/pbakaus/impeccable), [Vercel agent-skills](https://github.com/vercel-labs/agent-skills) |
| Motion | [Emil Kowalski's skills](https://github.com/emilkowalski/skills), [GSAP skills](https://github.com/greensock/gsap-skills) |
| Mobile | [Expo](https://github.com/expo/skills), [Software Mansion](https://github.com/software-mansion-labs/skills), [Callstack](https://github.com/callstackincubator/agent-skills), [Android skills](https://github.com/android/skills), [SwiftUI Pro](https://github.com/twostraws/SwiftUI-Agent-Skill) |

Selection depends on the task; user-invoked skills require an explicit request.
[Catalogue and setup →](docs/usage.md#recommended-skills)

## License & credits

UIUX Orchestrator's original code and instructions are licensed under [MIT](LICENSE).
Third-party skills retain their authors' copyrights and their own licences; they are independent
projects, with no affiliation or endorsement implied. The npm installer preserves upstream
licence/NOTICE files alongside downloaded skills. [Full notices and licence texts →](THIRD_PARTY_NOTICES.md)

Demo photos are used under the [Pexels licence](https://www.pexels.com/license/), with
[credits](docs/assets/CREDITS.md). No pictured car manufacturer endorses this project.

---

[Usage](docs/usage.md) · [How it works](docs/how-it-works.md) · [Contributing](CONTRIBUTING.md)

**Built something you're happy with? Give UIUX Orchestrator a ⭐.**
