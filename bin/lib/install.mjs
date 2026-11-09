import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export const marker = '.uiux-orchestrator-npm';
export function existing(path) {
  try { return lstatSync(path); } catch (error) { if (error.code !== 'ENOENT') throw error; return null; }
}
export function managed(path) {
  if (!existing(path) || lstatSync(path).isSymbolicLink()) return null;
  try {
    const text = readFileSync(join(path, marker), 'utf8');
    if (text.startsWith('Installed by the uiux-orchestrator npm CLI.')) return { installer: 'uiux-orchestrator' };
    const data = JSON.parse(text);
    return data.installer === 'uiux-orchestrator' ? data : null;
  } catch { return null; }
}

// Prepare every copy before changing destinations; roll back installed copies on commit failure.
export function commitJobs(jobs) {
  if (new Set(jobs.map(job => job.destination)).size !== jobs.length) throw new Error('Duplicate installation destination');
  const staged = [];
  try {
    for (const job of jobs) {
      if (existing(job.destination) && !managed(job.destination)) throw new Error(`Refusing to overwrite an existing installation: ${job.destination}`);
      const parent = dirname(job.destination); mkdirSync(parent, { recursive: true });
      const stage = mkdtempSync(join(parent, '.uiux-orchestrator-'));
      const state = { ...job, stage, backup: `${stage}-backup`, moved: false, installed: false };
      staged.push(state);
      cpSync(job.source, stage, { recursive: true, dereference: true });
      writeFileSync(join(stage, marker), JSON.stringify({ installer: 'uiux-orchestrator', ...job.metadata }) + '\n');
    }
    for (const state of staged) {
      if (existsSync(state.destination)) { renameSync(state.destination, state.backup); state.moved = true; }
      renameSync(state.stage, state.destination); state.installed = true;
    }
  } catch (error) {
    for (const state of [...staged].reverse()) {
      if (state.installed) rmSync(state.destination, { recursive: true, force: true });
      if (state.moved) renameSync(state.backup, state.destination);
    }
    throw error;
  } finally {
    for (const state of staged) rmSync(state.stage, { recursive: true, force: true });
  }
  for (const state of staged) if (state.moved) rmSync(state.backup, { recursive: true, force: true });
}
