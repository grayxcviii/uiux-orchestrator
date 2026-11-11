#!/usr/bin/env node
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, rmdirSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { detectAgents, detectProfile, selectSources } from './lib/project.mjs';
import { prepareSpecialists } from './lib/specialists.mjs';
import { commitJobs, existing, managed, marker } from './lib/install.mjs';

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
const usage = 'Usage: npx uiux-orchestrator install [--project | --global] [--agent <name>] [--platform web|mobile|all] [--dry-run] [--orchestrator-only]\n       npx uiux-orchestrator uninstall [--project | --global] [--agent <name>] [--dry-run]';
if (args.includes('--help') || args.includes('-h')) {
  console.log(`${usage}\n\nDefault: detect the project and install the specialists for its stack (web, Expo, React Native CLI, iOS, Android, Flutter) for the agents it already uses; if no framework is detected, install the full catalogue, and if no agent is detected, install for every supported agent. --global (-g) installs the full catalogue. --project (-p) explicitly selects project scope. --platform installs every web or mobile specialist without stack filtering. Repeat --agent (-a) to select agents. Git and network access are required for specialists; --orchestrator-only skips them. --dry-run prints the plan without changing files.\n\nuninstall removes only folders this installer manages (marked ${marker}) for the selected agents, or all agents by default; user-managed skills are kept.\n\nAgents: ${[...agents.keys()].join(', ')}`);
  process.exit(0);
}
const command = args.shift();
let scope, platform, only = false, dryRun = false;
const selected = [];
let invalid = !['install', 'uninstall'].includes(command);
while (args.length) {
  const arg = args.shift();
  if (['--global', '-g', '--project', '-p'].includes(arg)) {
    if (scope) invalid = true;
    scope = ['--global', '-g'].includes(arg) ? 'global' : 'project';
  } else if (arg === '--agent' || arg === '-a') {
    const agent = args.shift();
    if (!agents.has(agent)) invalid = true;
    else selected.push(agent);
  } else if (arg === '--platform') {
    if (platform) invalid = true;
    platform = args.shift();
    if (!['web', 'mobile', 'all'].includes(platform)) invalid = true;
  } else if (arg === '--orchestrator-only') only = true;
  else if (arg === '--dry-run') dryRun = true;
  else invalid = true;
}
if (scope === 'global' && platform && platform !== 'all') invalid = true;
if (command === 'uninstall' && (platform || only)) invalid = true;
if (invalid) {
  console.error(`${usage}\nSupported agents: ${[...agents.keys()].join(', ')}`);
  process.exit(1);
}

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(packageRoot, 'skills/uiux-orchestrator');
const requiredFiles = ['SKILL.md', 'LICENSE', 'legal/THIRD_PARTY_NOTICES.md', 'legal/licenses/apache-2.0.txt'];
const project = scope !== 'global';
const parentsFor = list => [...new Set(list.map(agent => {
  const [local, global] = agents.get(agent);
  return project ? join(process.cwd(), local) : global;
}))];

// Removes only folders carrying this installer's marker; symlinks and user copies are left untouched.
function uninstall() {
  const chosenAgents = [...new Set(selected.length ? selected : [...agents.keys()])];
  const removed = [], kept = [];
  for (const parent of parentsFor(chosenAgents)) {
    if (!existsSync(parent)) continue;
    for (const name of readdirSync(parent)) {
      const path = join(parent, name), owner = managed(path);
      if (!owner) continue;
      if (owner.name && owner.name !== name) { kept.push({ path, reason: 'marker names another skill' }); continue; }
      removed.push(path);
    }
  }
  if (dryRun) {
    console.log(JSON.stringify({ scope: project ? 'project' : 'global', agents: chosenAgents, remove: removed, keep: kept }, null, 2));
    return;
  }
  for (const path of removed) { rmSync(path, { recursive: true, force: true }); console.log(`Removed: ${path}`); }
  for (const entry of kept) console.log(`Kept: ${entry.path} (${entry.reason})`);
  if (project) {
    // Drop the agent folders the installer created once they are empty; never touch non-empty ones.
    for (const parent of parentsFor(chosenAgents)) for (const dir of [parent, dirname(parent)]) {
      try { if (!readdirSync(dir).length) rmdirSync(dir); } catch {}
    }
  }
  console.log(removed.length ? `Uninstall complete: ${removed.length} folders removed.` : 'Nothing to remove: no folders installed by uiux-orchestrator were found.');
}

let temporary;
try {
  if (command === 'uninstall') { uninstall(); process.exit(0); }
  if (requiredFiles.some(file => !existsSync(join(source, file)))) throw new Error('The npm package is missing required skill or licence files.');
  const detectedAgents = selected.length ? [] : detectAgents(project ? process.cwd() : homedir(), project ? 'project' : 'global', process.env);
  if (!selected.length && !detectedAgents.length) console.error('No agent configuration detected; installing for every supported agent. Use --agent to choose.');
  else if (detectedAgents.length) console.error(`Detected agents: ${detectedAgents.join(', ')}. Add --agent <name> to install for others.`);
  const chosenAgents = [...new Set(selected.length ? selected : detectedAgents.length ? detectedAgents : [...agents.keys()])];
  const parents = parentsFor(chosenAgents);
  const profile = only || !project || platform ? null : detectProfile(process.cwd());
  let groups = only ? [] : !project || platform === 'all' ? ['web', 'mobile'] : platform ? [platform] : profile.groups;
  let stacks = profile?.groups.length ? profile.stacks : undefined;
  if (!only && !groups.length) {
    groups = ['web', 'mobile'];
    console.error('No web/mobile framework detected; installing the full specialist catalogue for this project.');
  }
  const catalog = JSON.parse(readFileSync(join(packageRoot, 'bin/specialists.json'), 'utf8'));
  const sources = selectSources(catalog, groups, stacks);
  if (dryRun) {
    console.log(JSON.stringify({ scope: project ? 'project' : 'global', platforms: groups, stacks: stacks || 'all', agents: chosenAgents,
      sources: sources.map(s => ({ id: s.id, skills: s.skills.map(v => v.name) })) }, null, 2));
    process.exit(0);
  }
  const version = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8')).version;
  const jobs = parents.map(parent => ({ source, destination: join(parent, 'uiux-orchestrator'), metadata: { name: 'uiux-orchestrator', version } }));
  for (const job of jobs) if (existing(job.destination) && !managed(job.destination)) throw new Error(`Refusing to overwrite an existing installation: ${job.destination}`);
  console.log(`Installing ${project ? 'project' : 'global'} for ${chosenAgents.join(', ')}: ${groups.join(' + ') || 'orchestrator only'}${stacks?.length ? ` (${stacks.join(', ')})` : ''}; ${sources.reduce((n, s) => n + s.skills.length, 0)} specialist skills from ${sources.length} sources.`);
  temporary = mkdtempSync(join(tmpdir(), 'uiux-install-'));
  const specialists = await prepareSpecialists(sources, parents, temporary, console.log);
  commitJobs([...jobs, ...specialists.jobs]);
  for (const job of [...jobs, ...specialists.jobs]) console.log(`Installed: ${job.destination}`);
  for (const kept of specialists.kept) console.log(`Kept: ${kept.destination} (${kept.reason})`);
  console.log('Installation complete. Start a new agent session to discover the skills.');
} catch (error) {
  console.error(`${command === 'uninstall' ? 'Uninstall' : 'Install'} failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  if (temporary) rmSync(temporary, { recursive: true, force: true });
}
