#!/usr/bin/env node
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { detectProject, selectSources } from './lib/project.mjs';
import { prepareSpecialists } from './lib/specialists.mjs';
import { commitJobs, existing, managed } from './lib/install.mjs';

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
const usage = 'Usage: npx uiux-orchestrator install [--project | --global] [--agent <name>] [--platform web|mobile|all] [--dry-run] [--orchestrator-only]';
if (args.includes('--help') || args.includes('-h')) {
  console.log(`${usage}\n\nDefault: detect the project and install its web/mobile specialists for all supported agents. --global (-g) installs the full catalogue. --project (-p) explicitly selects project scope. Repeat --agent (-a) to select agents. Git and network access are required for specialists; --orchestrator-only skips them. --dry-run prints the plan without changing files.\n\nAgents: ${[...agents.keys()].join(', ')}`);
  process.exit(0);
}
const command = args.shift();
let scope, platform, only = false, dryRun = false;
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
  } else if (arg === '--platform') {
    if (platform) invalid = true;
    platform = args.shift();
    if (!['web', 'mobile', 'all'].includes(platform)) invalid = true;
  } else if (arg === '--orchestrator-only') only = true;
  else if (arg === '--dry-run') dryRun = true;
  else invalid = true;
}
if (scope === 'global' && platform && platform !== 'all') invalid = true;
if (invalid) {
  console.error(`${usage}\nSupported agents: ${[...agents.keys()].join(', ')}`);
  process.exit(1);
}

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(packageRoot, 'skills/uiux-orchestrator');
const requiredFiles = ['SKILL.md', 'LICENSE', 'legal/THIRD_PARTY_NOTICES.md', 'legal/licenses/apache-2.0.txt'];
let temporary;
try {
  if (requiredFiles.some(file => !existsSync(join(source, file)))) throw new Error('The npm package is missing required skill or licence files.');
  const project = scope !== 'global';
  const chosenAgents = [...new Set(selected.length ? selected : [...agents.keys()])];
  const parents = [...new Set(chosenAgents.map(agent => {
    const [local, global] = agents.get(agent);
    return project ? join(process.cwd(), local) : global;
  }))];
  const groups = only ? [] : !project || platform === 'all' ? ['web', 'mobile'] : platform ? [platform] : detectProject(process.cwd());
  if (!only && !groups.length) throw new Error('Cannot identify this project as web or mobile. Use --platform web, --platform mobile, --platform all, or --orchestrator-only.');
  const catalog = JSON.parse(readFileSync(join(packageRoot, 'bin/specialists.json'), 'utf8'));
  const sources = selectSources(catalog, groups);
  if (dryRun) {
    console.log(JSON.stringify({ scope: project ? 'project' : 'global', platforms: groups, agents: chosenAgents,
      sources: sources.map(s => ({ id: s.id, skills: s.skills.map(v => v.name) })) }, null, 2));
    process.exit(0);
  }
  const version = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8')).version;
  const jobs = parents.map(parent => ({ source, destination: join(parent, 'uiux-orchestrator'), metadata: { name: 'uiux-orchestrator', version } }));
  for (const job of jobs) if (existing(job.destination) && !managed(job.destination)) throw new Error(`Refusing to overwrite an existing installation: ${job.destination}`);
  console.log(`Installing ${project ? 'project' : 'global'}: ${groups.join(' + ') || 'orchestrator only'}; ${sources.reduce((n, s) => n + s.skills.length, 0)} specialist skills from ${sources.length} sources.`);
  temporary = mkdtempSync(join(tmpdir(), 'uiux-install-'));
  const specialists = await prepareSpecialists(sources, parents, temporary, console.log);
  commitJobs([...jobs, ...specialists.jobs]);
  for (const job of [...jobs, ...specialists.jobs]) console.log(`Installed: ${job.destination}`);
  for (const kept of specialists.kept) console.log(`Kept: ${kept.destination} (${kept.reason})`);
  console.log('Installation complete. Start a new agent session to discover the skills.');
} catch (error) {
  console.error(`Install failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  if (temporary) rmSync(temporary, { recursive: true, force: true });
}
