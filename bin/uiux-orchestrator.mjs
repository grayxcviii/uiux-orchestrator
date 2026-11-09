#!/usr/bin/env node
import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const agents = new Map([
  ['codex', ['.agents/skills', process.env.CODEX_HOME ? join(process.env.CODEX_HOME, 'skills') : join(homedir(), '.agents/skills')]],
  ['claude-code', ['.claude/skills', join(process.env.CLAUDE_CONFIG_DIR || join(homedir(), '.claude'), 'skills')]],
  ['cursor', ['.agents/skills', join(homedir(), '.cursor/skills')]],
  ['gemini-cli', ['.agents/skills', join(homedir(), '.gemini/skills')]],
  ['github-copilot', ['.agents/skills', join(homedir(), '.copilot/skills')]],
  ['opencode', ['.agents/skills', join(process.env.XDG_CONFIG_HOME || join(homedir(), '.config'), 'opencode/skills')]],
  ['windsurf', ['.windsurf/skills', join(homedir(), '.codeium/windsurf/skills')]],
]);
const args = process.argv.slice(2);
const usage = 'Usage: npx uiux-orchestrator install [--project | --global] [--agent <name>]';
if (args.includes('--help') || args.includes('-h')) {
  console.log(`${usage}\n\nDefault: install for all supported agents in the current project. Use --global (-g) for all projects. --project (-p) explicitly selects project scope. Repeat --agent (-a) to select agents.\n\nAgents: ${[...agents.keys()].join(', ')}`);
  process.exit(0);
}
const command = args.shift();
let scope;
const selected = [];
let invalid = command !== 'install';
while (args.length) {
  const arg = args.shift();
  if (['--global', '-g', '--project', '-p'].includes(arg)) {
    if (scope) invalid = true;
    scope = ['--global', '-g'].includes(arg) ? 'global' : 'project';
  } else if (arg === '--agent' || arg === '-a') {
    const agent = args.shift();
    if (!agents.has(agent)) invalid = true;
    else selected.push(agent);
  } else invalid = true;
}
if (invalid) {
  console.error(`${usage}\nSupported agents: ${[...agents.keys()].join(', ')}`);
  process.exit(1);
}
const project = scope !== 'global';
const targets = [...new Set((selected.length ? selected : [...agents.keys()]).map((agent) => {
  const [local, global] = agents.get(agent);
  return join(project ? join(process.cwd(), local) : global, 'uiux-orchestrator');
}))];
const source = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'skills', 'uiux-orchestrator');
const marker = '.uiux-orchestrator-npm';

const requiredFiles = ['SKILL.md', 'LICENSE', 'legal/THIRD_PARTY_NOTICES.md', 'legal/licenses/apache-2.0.txt'];
if (requiredFiles.some((file) => !existsSync(join(source, file)))) {
  console.error('The npm package is missing required skill or licence files.');
  process.exit(1);
}

// Check every destination before changing any installation.
for (const target of targets) {
  let existing;
  try { existing = lstatSync(target); } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  if (existing && (existing.isSymbolicLink() || !existsSync(join(target, marker)))) {
    console.error(`Refusing to overwrite an existing installation: ${target}`);
    process.exit(1);
  }
}

for (const target of targets) {
  const parent = dirname(target);
  mkdirSync(parent, { recursive: true });
  const staging = mkdtempSync(join(parent, '.uiux-orchestrator-'));
  const backup = `${staging}-backup`;
  let movedExisting = false;
  try {
    cpSync(source, staging, { recursive: true });
    writeFileSync(join(staging, marker), 'Installed by the uiux-orchestrator npm CLI.\n');
    if (existsSync(target)) {
      renameSync(target, backup);
      movedExisting = true;
    }
    renameSync(staging, target);
    if (movedExisting) rmSync(backup, { recursive: true, force: true });
    console.log(`Installed UIUX Orchestrator: ${target}`);
  } catch (error) {
    if (movedExisting && !existsSync(target)) renameSync(backup, target);
    console.error(`Install failed: ${error.message}`);
    process.exitCode = 1;
    break;
  } finally {
    if (existsSync(staging)) rmSync(staging, { recursive: true, force: true });
  }
}
