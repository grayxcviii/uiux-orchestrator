import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';

test('packed npm CLI installs through npx with isolated project and global scopes', () => {
  const root = mkdtempSync(join(tmpdir(), 'uiux-npx-'));
  const env = { ...process.env, npm_config_cache: join(root, 'cache'), CODEX_HOME: join(root, 'codex') };
  function command(executable, args, cwd) {
    const result = spawnSync(executable, args, { cwd, env, encoding: 'utf8', timeout: 60000 });
    assert.equal(result.status, 0, `${result.error || ''}\n${result.stdout}\n${result.stderr}`);
    return result.stdout;
  }
  try {
    const packed = JSON.parse(command('npm', ['pack', '--json', '--pack-destination', root], resolve()));
    const tarball = join(root, packed[0].filename);
    const projectA = join(root, 'project-a');
    const projectB = join(root, 'project-b');
    mkdirSync(projectA);
    mkdirSync(projectB);
    const localA = join(projectA, '.agents', 'skills', 'uiux-orchestrator', 'SKILL.md');
    const localB = join(projectB, '.agents', 'skills', 'uiux-orchestrator', 'SKILL.md');
    const global = join(env.CODEX_HOME, 'skills', 'uiux-orchestrator', 'SKILL.md');
    const npx = ['--offline', '--yes', '--package', tarball, '--', 'uiux-orchestrator', 'install'];
    command('npx', npx, projectA);
    assert.match(readFileSync(localA, 'utf8'), /^name: uiux-orchestrator/m);
    assert.equal(existsSync(localB), false);
    assert.equal(existsSync(global), false);
    command('npx', [...npx, '--project'], projectA);
    command('npx', [...npx, '--global'], projectB);
    assert.match(readFileSync(global, 'utf8'), /^name: uiux-orchestrator/m);
    assert.equal(existsSync(localB), false);
    command('npx', [...npx, '-g'], projectA);
    assert.ok(existsSync(global));
    assert.ok(existsSync(localA));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
