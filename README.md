<h1 align="center">UIUX Orchestrator</h1>

<h3 align="center">One prompt. Your design skills, working together.</h3>

<p align="center">
  An orchestrator for frontend-design, Impeccable, UI UX Pro Max, Taste and more.<br>
  It guides your coding agent to select and activate the right installed specialists,
  implement the UI and check the result.
</p>

<p align="center">
  <a href="https://github.com/grayxcviii/uiux-orchestrator/actions/workflows/validate.yml"><img src="https://github.com/grayxcviii/uiux-orchestrator/actions/workflows/validate.yml/badge.svg" alt="validate"></a>
  <img src="https://img.shields.io/badge/license-MIT-green" alt="license">
  <img src="https://img.shields.io/badge/web%20%26%20mobile-ready-black" alt="Web and mobile">
</p>

<picture>
  <source srcset="docs/assets/vahl-demo.webp" type="image/webp">
  <img src="docs/assets/vahl-demo.gif" alt="A landing page built with UIUX Orchestrator: animated hero, model tabs and an interactive charging simulator" width="100%">
</picture>

<sub>Demo: Vahl, a fictional brand. [Before & after](docs/assets/vahl-fullpage.jpg) · [Photo credits](docs/assets/CREDITS.md)</sub>

## Connect the specialists you already trust

| Specialist | What it brings |
|---|---|
| [Anthropic frontend-design](https://github.com/anthropics/skills), [Taste](https://github.com/Leonxlnx/taste-skill) | Visual direction and new web interfaces |
| [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | Styles, palettes, typography and charts |
| [Impeccable](https://github.com/pbakaus/impeccable) | UX critique, accessibility audits and polish |
| [Emil Kowalski's skills](https://github.com/emilkowalski/skills), [GSAP skills](https://github.com/greensock/gsap-skills) | Motion design, choreography and animation performance |
| [Expo](https://github.com/expo/skills), [Software Mansion](https://github.com/software-mansion-labs/skills), [Callstack](https://github.com/callstackincubator/agent-skills) | Mobile UI, native interactions and device checks |

The [built-in registry](skills/uiux-orchestrator/registry/skills.yaml) guides skill discovery and
selection. Your agent checks what is installed and compatible, activates the chosen specialists
and follows their instructions for the task.

**Inspect the project → select and activate specialists → implement → validate.**

Your existing components, tokens and supplied designs guide the work. Small, specified changes
take a shorter path. Reports cover changes, checks and remaining limitations.

Includes guidance for **web, React Native, iOS, Android and Flutter**. The installer supports
Claude Code, Codex, Cursor, Gemini CLI, GitHub Copilot, OpenCode and Windsurf, with the models
each agent supports. [Tested coverage →](docs/usage.md#supported-agents)

## Get started

Run from your project (Node.js 18+, Git and network access):

```bash
npx uiux-orchestrator install           # detect web/mobile and install relevant skills
npx uiux-orchestrator install --global  # install the complete supported skill catalogue
```

To target one agent, add `--agent claude-code` (or another supported agent).

**What gets installed?**

| Install method | Included |
|---|---|
| npm — project | Orchestrator + specialists for detected web/mobile projects |
| npm — global | Orchestrator + all 46 supported specialist skills |
| Skills CLI | UIUX Orchestrator |
| [Claude Code plugin](docs/usage.md#install-update-remove) | UIUX Orchestrator + frontend-design |

Project detection reads app manifests and workspace packages; mixed web/mobile projects get both
groups. Unknown project? Add `--platform web` or `--platform mobile`. Preview the selection with
`--dry-run`, or use `--orchestrator-only` for an offline install without specialists.

The npm installer downloads pinned skills from 13 upstream repos, retains their licence/NOTICE
files and preserves existing user-managed skills. It does not install SDKs, application libraries
or third-party hooks. [Setup details and alternative methods →](docs/usage.md#install-update-remove)

## How to use it

Open your coding agent in the project and describe what you want to change:

```text
Redesign this landing page. Make it feel premium and keep our brand colors.
```

Your agent can pick up UIUX Orchestrator automatically for UI/UX tasks. Activation is the
agent's choice; to request it explicitly, name the skill in your prompt:

```text
Use uiux-orchestrator to make the onboarding animation feel smooth and natural.
```

In Claude Code, call it directly with `/uiux-orchestrator <request>`.

Project installs apply to that project; global installs are available across projects.
If the skill doesn't appear after installation, start a new agent session.

---

[Usage](docs/usage.md) · [How it works](docs/how-it-works.md) ·
[Specialist skills](docs/usage.md#recommended-skills) · [Contributing](CONTRIBUTING.md) ·
[Third-party notices](THIRD_PARTY_NOTICES.md)

<sub>Specialist skills are independent projects under their own licences. See the
[usage guide](docs/usage.md#recommended-skills) for dependencies and telemetry settings.</sub>

**Like what you built? Give the project a ⭐.**
