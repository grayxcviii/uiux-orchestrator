import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, existsSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';

const cli = resolve('bin/uiux-orchestrator.mjs');

function run(args, cwd, codexHome) {
  return spawnSync(process.execPath, [cli, ...args], {
    cwd,
    env: { ...process.env, CODEX_HOME: codexHome },
    encoding: 'utf8',
  });
}

test('explicit global install copies the complete skill and can be rerun', () => {
  const root = mkdtempSync(join(tmpdir(), 'uiux-cli-'));
  try {
    const home = join(root, 'codex');
    const target = join(home, 'skills', 'uiux-orchestrator');
    const first = run(['install', '--global'], root, home);
    assert.equal(first.status, 0, first.stderr);
    assert.match(readFileSync(join(target, 'SKILL.md'), 'utf8'), /^name: uiux-orchestrator/m);
    assert.ok(existsSync(join(target, 'core', 'decision-engine.md')));
    assert.ok(existsSync(join(target, 'scripts', 'ui-check.mjs')));
    const second = run(['install', '-g'], root, home);
    assert.equal(second.status, 0, second.stderr);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('install defaults to project scope and leaves global scope untouched', () => {
  const root = mkdtempSync(join(tmpdir(), 'uiux-cli-'));
  try {
    const home = join(root, 'codex');
    const result = run(['install'], root, home);
    assert.equal(result.status, 0, result.stderr);
    assert.ok(existsSync(join(root, '.agents', 'skills', 'uiux-orchestrator', 'SKILL.md')));
    assert.equal(existsSync(join(home, 'skills', 'uiux-orchestrator')), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('invalid options fail without installing files', () => {
  const root = mkdtempSync(join(tmpdir(), 'uiux-cli-'));
  try {
    const home = join(root, 'codex');
    const result = run(['--unknown'], root, home);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Usage: npx uiux-orchestrator/);
    assert.equal(existsSync(join(home, 'skills', 'uiux-orchestrator')), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('existing skill directory without this installer marker is preserved', () => {
  const root = mkdtempSync(join(tmpdir(), 'uiux-cli-'));
  try {
    const home = join(root, 'codex');
    const target = join(home, 'skills', 'uiux-orchestrator');
    mkdirSync(target, { recursive: true });
    writeFileSync(join(target, 'SKILL.md'), 'user copy');
    const result = run(['install', '--global'], root, home);
    assert.notEqual(result.status, 0);
    assert.equal(readFileSync(join(target, 'SKILL.md'), 'utf8'), 'user copy');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

for (const args of [[], ['install', '--unknown'], ['install', 'constructor'], ['install', '--project', '--global'], ['install', '-g', '-p']]) {
  test(`rejects missing command or conflicting scopes: ${args.join(' ')}`, () => {
    const root = mkdtempSync(join(tmpdir(), 'uiux-cli-'));
    try {
      const home = join(root, 'codex');
      const result = run(args, root, home);
      assert.notEqual(result.status, 0);
      assert.equal(existsSync(join(root, '.agents')), false);
      assert.equal(existsSync(home), false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
}
