# Skill registry — reading entries, availability, activation

Data lives in [../registry/skills.yaml](../registry/skills.yaml). This file explains how to read
it. The decision engine reads only shortlisted entries.

## Reading an entry

Search `registry/skills.yaml` for `id: <provider>/<skill>`, read the entry and its provider's
`shared:` block (entries inherit it). Fields that change routing:

| Field | Meaning |
|---|---|
| `names` | Invocation names to match against installed skills |
| `equivalent_to` / `complements` | Same content (load one) / may join the pick in the same slot |
| `role` | `driver` (whole-surface pipeline, one per surface) · `specialist` · `reviewer` |
| `invocation` | `user` = never auto-run; recommend it |
| `slots`, `authority` | Slots it fills; per-dimension authority (high/medium/low) for tie-breaks |
| `platforms`, `frameworks`, `requires`, `avoid_when` | Eliminators: any mismatch or match removes the candidate (`requires` = hard prerequisites) |
| `kind`, `use_when`, `capabilities`, `required_inputs`, `expected_outputs`, `delegates_to` | What it is, when it fits, what it does, what to pass in the brief, what comes back, which skills it calls itself |
| `side_effects`, `limitations` | What it writes/downloads; soft caveats |
| `cost` | Resource-planning information for a long/multi-agent pipeline; not a waiver for a required compatible specialist. |
| `priority` + `value_if_missing` | Preference among suitable candidates / missing-skill install hints. Neither permits bypassing an available owner of a required slot. |
| `owns` | Full drivers: slots the selected driver fills itself |
| `specialist_slots`, `scoped_brief` | Explicit bounded adapter slots and their brief; execution must declare the slot as its mode. This is not a second full driver. |
| `notes`, `brief` | Vocabulary mapping; what to pass and skip when activating |

`references:` lists knowledge sources (read, never run), with the date they were checked.

**Matching ids.** Registry `platforms` use families: `web`, `react-native`, `ios`, `android`,
`flutter`, `any` (= all). The profile's `react-native-expo` and `react-native-cli` both match
`react-native`; `unsupported` matches only `any`. `frameworks` tokens: web `react`, `nextjs`, `vue`,
`nuxt`, `svelte`, `sveltekit`, `angular`, `astro`, `html` · RN `expo`, `react-native-cli` · iOS
`swiftui`, `uikit` · Android `compose`, `views` · `any`. A missing `frameworks` means any.

## Availability detection

A registry entry says what a skill *is*; it does not mean the skill is installed. Check, in order,
and stop at the first hit:

1. **The agent's own skill list** in context (Claude Code lists available skills with names such
   as `animate` or `plugin:skill`). Match any of `names`. A `plugin:skill` name matches on the
   part after the colon: `emil-kowalski-motion:animate` matches `animate`, and
   `taste-skill:design-taste-frontend` matches `design-taste-frontend`. The UIUX Orchestrator
   Claude Code plugin installs frontend-design this way as a dependency. The npm installer
   can provision all specialists globally or a web/mobile subset in a project. If the same skill appears twice
   (a plugin copy and a skills-folder copy), it is available; invoke the one listed first.
2. **Skill directories** — search for a `SKILL.md` whose frontmatter `name` matches:
   - project: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.codex/skills/`, `.windsurf/skills/`
   - user: `~/.claude/skills/`, `~/.agents/skills/`, `~/.codex/skills/`, `~/.cursor/skills/`,
     `~/.gemini/skills/`, `~/.copilot/skills/`, `~/.config/opencode/skills/`, `~/.codeium/windsurf/skills/`
     (respect configured `CLAUDE_CONFIG_DIR`, `CODEX_HOME` and `XDG_CONFIG_HOME`)
   - Claude Code plugins: `~/.claude/plugins/` (installed plugin skills are namespaced)
3. Any additional skill location the user or environment explicitly designates.
4. Not found → **not available**. Do not search the network, do not install.

A skill whose hard `requires` cannot be met here (e.g. a device-automation skill with no
simulator/device, a network-only skill offline, a missing runtime) is **unavailable** even if
installed. If a requirement is unknown, check it when the slot executes and fall back if it fails.

For a Node version prerequisite, `node --version` checks only the current PATH binary. Before
excluding a skill, run `python3 -I <skill-dir>/scripts/probe-runtime.py --min-node 22` (adjust the
minimum to its actual requirement). It probes PATH and installed nvm/Volta/fnm/mise/asdf runtimes,
returns version observations and a compatible absolute binary path, and changes no environment.
Invoke that binary directly; this does not install Node, switch a shell or change a global default.
If probing is blocked or its errors leave compatibility unknown, record that uncertainty rather
than claiming the skill is absent. Preserve the JSON with the routing decision.

Network: skills that need it list it in `requires`; when network availability is unknown, select
the skill with its fallback noted and confirm at execution.

Record skill ids, actual sources, compatibility/availability results and evidence once per
session. Refresh invalidated checks. A missing menu entry is not proof of absence: check the
supported skill/plugin directories before declaring a skill unavailable.

## Activating an available skill

| Agent capability | How |
|---|---|
| Has a Skill/skill tool | Invoke by its listed name; pass the command and target as arguments for multi-command skills (e.g. `impeccable` with `critique src/app/settings`). |
| No skill tool | Read the skill's `SKILL.md` and follow it; resolve its relative paths from its own directory (`<skill-dir>` = the folder containing that SKILL.md, wherever the agent installed it). If it names an agent tool you don't have (e.g. WebFetch), use the closest equivalent you do have (e.g. `curl`) and note it. |
| `invocation: user` | Do not invoke. Tell the user: "`/<name>` would add <value> here." |

For registered bounded modes, load [adapters.md](adapters.md) and the actual upstream skill;
execute its permitted portion and report that mode, not a full-pipeline run.

After activation, the skill's own instructions govern *how* it works inside its slot; the
orchestrator's hard rules and the handoff brief govern *what* it may change.
Activation alone is not completion. Record the method, source, actual invocation/executed steps,
executor, success/failure, evidence and outputs; accept the handoff before counting use.
Follow [orchestration.md](orchestration.md) for receipts and activation failure recovery.

## Missing skill policy

- Never pretend a missing skill was used; say "built-in" in the plan.
- Try the next compatible candidate. Built-in fallback requires evidenced unavailability,
  incompatibility, exclusion or an unmet prerequisite for relevant alternatives. Label degraded
  coverage and apply the orchestration status ceiling; an available suitable specialist must run.
- A skill the user or environment deliberately excluded gets no install hint.
- Mention the missing skill to the user only when `value_if_missing: high` **and** the slot
  materially affects this task. One line, with `install_hint`. Never install it yourself.

Adding or changing entries: see `docs/registry-schema.md` in the repository (not installed).
