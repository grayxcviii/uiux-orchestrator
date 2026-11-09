#!/usr/bin/env node
import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const usage = 'Usage: npx uiux-orchestrator install [--project | --global]';
if (args.includes('--help') || args.includes('-h')) {
  console.log(`${usage}\n\nDefault: current project only. Use --global (-g) for all projects. --project (-p) explicitly selects project scope.`);
  process.exit(0);
}
const command = args.shift();
const scopeOptions = new Map([['-g', 'global'], ['--global', 'global'], ['-p', 'project'], ['--project', 'project']]);
const scopes = args.map((arg) => scopeOptions.get(arg));
if (command !== 'install' || scopes.some((scope) => !scope) || scopes.length > 1) {
  console.error(usage);
  process.exit(1);
}
const project = scopes[0] !== 'global';
const globalSkills = process.env.CODEX_HOME
  ? join(process.env.CODEX_HOME, 'skills')
  : join(homedir(), '.agents', 'skills');
const parent = project ? join(process.cwd(), '.agents', 'skills') : globalSkills;
const target = join(parent, 'uiux-orchestrator');
const source = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'skills', 'uiux-orchestrator');
const marker = '.uiux-orchestrator-npm';

if (!existsSync(join(source, 'SKILL.md'))) {
  console.error('The npm package is missing its skill files.');
  process.exit(1);
}

if (existsSync(target) && (lstatSync(target).isSymbolicLink() || !existsSync(join(target, marker)))) {
  console.error(`Refusing to overwrite an existing installation: ${target}`);
  process.exit(1);
}

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
  console.log(`Installed UIUX Orchestrator for Codex: ${target}`);
} catch (error) {
  if (movedExisting && !existsSync(target)) renameSync(backup, target);
  console.error(`Install failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  if (existsSync(staging)) rmSync(staging, { recursive: true, force: true });
}
