<h1 align="center">UIUX Orchestrator</h1>

<h3 align="center">Your agent has a dozen design skills.<br>This is the one that knows which to use.</h3>

<p align="center">
  Describe the interface you want in one sentence. It picks the right specialists, builds the result,
  and proves it works with screenshots.
</p>

<p align="center">
  <a href="https://github.com/LongNguyen2312/uiux-orchestrator/actions/workflows/validate.yml"><img src="https://github.com/LongNguyen2312/uiux-orchestrator/actions/workflows/validate.yml/badge.svg" alt="validate"></a>
  <img src="https://img.shields.io/badge/version-1.1.0-blue" alt="version">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="license">
  <img src="https://img.shields.io/badge/Claude%20Code%20·%20Codex-ready-black" alt="agents">
</p>

---

## One sentence in. A finished landing page out.

<p align="center"><b>23 minutes · 4 specialist skills · 0 lines written by hand</b></p>

<table>
  <tr>
    <td align="center"><b>Before</b></td>
    <td align="center"><b>After</b></td>
  </tr>
  <tr>
    <td><img src="docs/assets/vahl-before.jpg" alt="Before: a generic template landing page"></td>
    <td><img src="docs/assets/vahl-after.jpg" alt="After: a cinematic night hero with a giant Vahl GT title on a line of light"></td>
  </tr>
</table>

<picture>
  <source srcset="docs/assets/vahl-demo.webp" type="image/webp">
  <img src="docs/assets/vahl-demo.gif" alt="The hero line draws and the title rises, model tabs wipe between photos, the charging simulator runs" width="100%">
</picture>

| Job | Skill the orchestrator picked |
|---|---|
| Visual direction | [Anthropic frontend-design](https://github.com/anthropics/skills) |
| Motion rules | [Emil Kowalski · animate](https://github.com/emilkowalski/skills) |
| Choreography | [Emil Kowalski · choreograph](https://github.com/emilkowalski/skills) |
| Independent review | [Impeccable · critique](https://github.com/pbakaus/impeccable) |

<details>
<summary>See both full pages side by side</summary>
<br>
<img src="docs/assets/vahl-fullpage.jpg" alt="Full page before (left) and after (right)">
</details>

<sub>Vahl is a fictional brand. Photos: Pexels ([credits](docs/assets/CREDITS.md)).</sub>

## Why you need it

| 😩 Without it | 😎 With UIUX Orchestrator |
|---|---|
| A one-line fix triggers a whole design pipeline | Small fixes stay small and fast |
| Two skills fight over the same screen | One clear lead, each specialist on its own job |
| Code that doesn't fit your stack or versions | It reads your project before it writes |
| *"Done ✅"*, and nobody opened the page | Screenshots and checks, with an honest status |

## Install

**Codex** (npm CLI; available after the first npm release):

```bash
npx uiux-orchestrator install
```

This installs the skill for the current project only. Use `npx uiux-orchestrator install --global` (or `-g`) to make it available in every project. `--project` (or `-p`) explicitly selects project scope. The package is prepared in this repository but has not been published to npm yet.

**Codex and other Agent Skills agents** (available now; Node.js 22.20+):

```bash
npx skills add LongNguyen2312/uiux-orchestrator --skill uiux-orchestrator -g -a codex
```

Run it without `-g` to install in the current project. Replace `codex` with your agent name, or omit `-a codex` to choose interactively. This installs the orchestrator skill; optional specialist skills have separate install instructions in the [usage guide](docs/usage.md#recommended-skills).

**Claude Code plugin** (includes six specialist skills):

```text
/plugin install uiux-orchestrator --marketplace LongNguyen2312/uiux-orchestrator
```

Then describe the UI task to your agent. In Claude Code, you can call the skill directly:

```text
/uiux-orchestrator The onboarding animation feels dead. Make it smooth.
```

<sub>Install, update and removal options: [usage guide](docs/usage.md#install-update-remove).</sub>

## Numbers, not adjectives

<table>
  <tr>
    <td align="center"><h2>100%</h2>right skills picked<br><sub>vs 50% for the agent alone</sub></td>
    <td align="center"><h2>0%</h2>unnecessary skill runs<br><sub>vs 47% for the agent alone</sub></td>
    <td align="center"><h2>16/16</h2>stacks detected<br><sub>from real project files</sub></td>
  </tr>
</table>

## Works everywhere you build UI

**Web** · **React Native** · **iOS** · **Android** · **Flutter**. Each platform has built-in,
version-checked guidance.

## Comes with a design team

Install it in Claude Code and **six specialist skills come with it**, fetched straight from their
authors' repositories:

[Impeccable](https://github.com/pbakaus/impeccable) ·
[Taste](https://github.com/Leonxlnx/taste-skill) ·
[UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) ·
[Emil Kowalski's motion skills](https://github.com/emilkowalski/skills) ·
[frontend-design](https://github.com/anthropics/skills) ·
[Vercel web-design-guidelines](https://github.com/vercel-labs/agent-skills)

The orchestrator decides which of them each task needs. Mobile and extra skills (Expo, Android,
SwiftUI, GSAP…) are optional, and it works without any of them.
[Details →](docs/usage.md#recommended-skills)

<sub>These are independent projects by their own authors, under their own licences
([notices](THIRD_PARTY_NOTICES.md)). This project is not affiliated with them. Impeccable runs
background hooks and may send anonymous telemetry when a new design starts. To turn the telemetry
off, run `npx impeccable telemetry off` or set `DO_NOT_TRACK=1`.</sub>

---

<p align="center">
  📘 <a href="docs/usage.md">Usage</a> · ⚙️ <a href="docs/how-it-works.md">How it works</a> ·
  📊 <a href="tests/benchmark.md">Benchmark</a> · 🤝 <a href="CONTRIBUTING.md">Contributing</a> ·
  📄 <a href="THIRD_PARTY_NOTICES.md">Third-party notices</a>
  <br><br>
  <b>If it saves you a redesign, give it a ⭐</b>
</p>
