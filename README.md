<h1 align="center">UIUX Orchestrator</h1>

<h3 align="center">Give your coding agent a design team.</h3>

<p align="center">
  Turn the interface in your head into something people want to use.<br>
  Describe what you need. Your agent brings together design, motion and review to build it.
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

## You bring the idea. It brings the right skills.

A sharper landing page. A smoother onboarding flow. A dashboard that finally feels clear.
UIUX Orchestrator helps your agent take the work from the first design decision through
implementation and review.

- **One request, the right specialists.** It picks from your design skills and coordinates their work.
- **Built for your project.** It follows your stack, components and existing design system.
- **The right amount of work.** Small fixes and clearly specified components stay quick. A redesign gets the attention it needs.
- **A result you can inspect.** It checks the implementation and shows what was verified.

Works across **web, React Native, iOS, Android and Flutter**. Use it with Claude Code, Codex,
Cursor, Gemini CLI, GitHub Copilot, OpenCode or Windsurf — with the models your agent supports.

## Get started

Run from your project (Node.js 18+):

```bash
npx uiux-orchestrator install           # this project
npx uiux-orchestrator install --global  # all your projects
```

To target one agent, add `--agent claude-code` (or another supported agent).

**Alternative:** install through the Skills CLI (Node.js 22.20+):

```bash
npx skills add grayxcviii/uiux-orchestrator --skill uiux-orchestrator
```

Choose your agent when prompted. Add `-g` to use it across projects.

[Claude Code plugin installation →](docs/usage.md#install-update-remove)
The plugin includes frontend-design. Add other specialist skills when you need them; the
orchestrator also works with its built-in guidance.

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

In Claude Code, you can call it directly:

```text
/uiux-orchestrator Review this dashboard. Find the UX issues without changing code.
```

Project installs apply to that project; global installs are available across projects.
If the skill doesn't appear after installation, start a new agent session.

---

[Usage](docs/usage.md) · [How it works](docs/how-it-works.md) ·
[Specialist skills](docs/usage.md#recommended-skills) · [Contributing](CONTRIBUTING.md) ·
[Third-party notices](THIRD_PARTY_NOTICES.md)

<sub>Specialist skills are independent projects under their own licences. See the
[usage guide](docs/usage.md#recommended-skills) for dependencies and telemetry settings.</sub>

**Like what you built? Give the project a ⭐.**
