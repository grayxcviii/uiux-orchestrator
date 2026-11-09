# Third-party notices

UIUX Orchestrator's original code and instructions are MIT-licensed. The project licence is
included as `LICENSE` in the installed skill. Third-party material remains under its original
licence; our MIT licence does not replace those terms.

## What is distributed

The runtime registry includes project names, factual descriptions, command names and short
excerpts about independent skills. The GitHub repository also contains skill metadata excerpts
in its historical test inputs and research notes. We do not bundle the implementations of those
specialist skills in the npm package.

Original licence and notice files for the referenced projects are provided below, unmodified,
at the recorded upstream revisions. `sources.json` records their URLs and SHA-256 hashes.

| Source | Included licence or notice | Provenance |
|---|---|---|
| impeccable | [impeccable-license](licenses/impeccable-license) | [Original file](https://raw.githubusercontent.com/pbakaus/impeccable/c3bb418ee38ee49a6b999b7752c1368f3123a2bd/LICENSE) |
| impeccable | [impeccable-notice.md](licenses/impeccable-notice.md) | [Original file](https://raw.githubusercontent.com/pbakaus/impeccable/c3bb418ee38ee49a6b999b7752c1368f3123a2bd/NOTICE.md) |
| uupm | [uupm-license](licenses/uupm-license) | [Original file](https://raw.githubusercontent.com/nextlevelbuilder/ui-ux-pro-max-skill/b7d5353e0130feb8c5574ef1251f8a1db1873ccb/LICENSE) |
| taste | [taste-license](licenses/taste-license) | [Original file](https://raw.githubusercontent.com/Leonxlnx/taste-skill/9b4bf937a1f69348126959c15d2f99a73e65699b/LICENSE) |
| lucian | [lucian-license](licenses/lucian-license) | [Original file](https://raw.githubusercontent.com/Seokwoooo/lucian-uxui/0067ad85bfcf62a572071fdbe82a4e02f0d2098f/LICENSE) |
| emil | [emil-license](licenses/emil-license) | [Original file](https://raw.githubusercontent.com/emilkowalski/skills/c8a79627b59d72d764d6ab6f2c87c09a48169833/LICENSE) |
| gsap | [gsap-license](licenses/gsap-license) | [Original file](https://raw.githubusercontent.com/greensock/gsap-skills/aed9cfd3277740755f6bfc1155c7aa645403b760/LICENSE) |
| expo | [expo-license](licenses/expo-license) | [Original file](https://raw.githubusercontent.com/expo/skills/a9e5bd3fa00b4e61f632e43f85da73aee1942582/LICENSE) |
| callstack | [callstack-license](licenses/callstack-license) | [Original file](https://raw.githubusercontent.com/callstackincubator/agent-skills/59e9d17446a248b21d86f078fcd0bd2d36db1ca4/LICENSE) |
| anthropic | [anthropic-license.txt](licenses/anthropic-license.txt) | [Original file](https://raw.githubusercontent.com/anthropics/skills/ca45fc496a3436251f191354091d557da31c15b5/skills/frontend-design/LICENSE.txt) |
| android | [android-license.txt](licenses/android-license.txt) | [Original file](https://raw.githubusercontent.com/android/skills/bf68e2d66a992a1e6aeb7e9263293cc23fcbf475/LICENSE.txt) |
| twostraws | [twostraws-license](licenses/twostraws-license) | [Original file](https://raw.githubusercontent.com/twostraws/SwiftUI-Agent-Skill/f2920b63995263f57b3e198674e89a602efba6d2/LICENSE) |
| apache-license-text | [apache-2.0.txt](licenses/apache-2.0.txt) | [Original file](https://www.apache.org/licenses/LICENSE-2.0.txt) |

Software Mansion's skills and Vercel's agent-skills declare MIT in their upstream READMEs,
but no standalone licence file was found at the reviewed revisions. Their metadata is attributed
to Software Mansion and Vercel respectively. The full MIT permission and warranty terms are
included in the project-specific MIT licence copies above; those terms apply with each original
copyright holder's notice, not the UIUX Orchestrator copyright. No implementation from either
project is bundled here.

- Software Mansion source: https://github.com/software-mansion-labs/skills/tree/43cde80
- Vercel source: https://github.com/vercel-labs/agent-skills/tree/1a2c79d

## External plugin downloads

Only Anthropic frontend-design remains an automatic Claude Code plugin dependency: its selected
folder includes `LICENSE.txt` (Apache-2.0). Other specialists are optional installs from their
authors' own distributions. Their licences and any required NOTICE files must accompany their
own distributions. The licence copies here are attribution for this project's excerpts, not a
replacement for missing notices in an external plugin cache.

The historical test inputs contain a paraphrase of a skill from dickwu/apple-design-skill.
That skill has no verified licence grant; it is no longer listed in the active registry or
recommended for installation. Historical results describe earlier runs, not current routing.
Use Apple's official Human Interface Guidelines for Apple platform reference material.

## Names and photographs

Project names and trademarks belong to their owners. References do not imply endorsement or
affiliation. Impeccable, Taste, UI UX Pro Max, Emil Kowalski's skills, Anthropic's skills and Vercel's
skills are independent projects.

The GitHub README demo uses screenshots containing photos from Pexels under the Pexels licence:
https://www.pexels.com/license/
Photo credits: https://github.com/grayxcviii/uiux-orchestrator/blob/main/docs/assets/CREDITS.md
Vahl is a fictional brand. The pictured cars belong to other manufacturers; none endorses or
is affiliated with this project. Demo images are not included in the npm package.

## Optional tools and test fixtures

The installer and bundled browser scripts have no runtime package dependencies. Test-fixture
packages are installed separately and retain their own licences. Impeccable's own installation
may enable hooks and anonymous telemetry; see its documentation, `npx impeccable telemetry off`
or `DO_NOT_TRACK=1`.
