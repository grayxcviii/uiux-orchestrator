import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, existsSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';

const cli = resolve('bin/uiux-orchestrator.mjs');

function run(args, cwd, codexHome) {
  return spawnSync(process.execPath, [cli, ...args, ...(args[0] === 'install' ? ['--orchestrator-only'] : [])], {
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
    const first = run(['install', '--global', '--agent', 'codex'], root, home);
    assert.equal(first.status, 0, first.stderr);
    assert.match(readFileSync(join(target, 'SKILL.md'), 'utf8'), /^name: uiux-orchestrator/m);
    assert.ok(existsSync(join(target, 'core', 'decision-engine.md')));
    assert.ok(existsSync(join(target, 'scripts', 'ui-check.mjs')));
    const second = run(['install', '-g', '--agent', 'codex'], root, home);
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
    const result = run(['install', '--global', '--agent', 'codex'], root, home);
    assert.notEqual(result.status, 0);
    assert.equal(readFileSync(join(target, 'SKILL.md'), 'utf8'), 'user copy');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

for (const args of [[], ['install', '--agent', 'unknown'], ['install', '--agent'], ['install', '--unknown'], ['install', 'constructor'], ['install', '--project', '--global'], ['install', '-g', '-p']]) {
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

for (const [agent, folder] of [
  ['claude-code', '.claude/skills'], ['cursor', '.agents/skills'],
  ['gemini-cli', '.agents/skills'], ['github-copilot', '.agents/skills'],
  ['opencode', '.agents/skills'], ['windsurf', '.windsurf/skills'],
]) {
  test(`project installer supports ${agent} without creating Codex-specific files`, () => {
    const root = mkdtempSync(join(tmpdir(), 'uiux-agent-'));
    try {
      const result = run(['install', '--agent', agent], root, join(root, 'codex'));
      assert.equal(result.status, 0, result.stderr);
      assert.ok(existsSync(join(root, folder, 'uiux-orchestrator', 'SKILL.md')));
      assert.equal(existsSync(join(root, 'codex')), false);
    } finally { rmSync(root, { recursive: true, force: true }); }
  });
}

test('default project install covers shared, Claude Code and Windsurf directories', () => {
  const root = mkdtempSync(join(tmpdir(), 'uiux-agent-'));
  try {
    const result = run(['install'], root, join(root, 'codex'));
    assert.equal(result.status, 0, result.stderr);
    for (const folder of ['.agents/skills', '.claude/skills', '.windsurf/skills']) {
      assert.ok(existsSync(join(root, folder, 'uiux-orchestrator', 'SKILL.md')));
    }
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('multi-agent preflight preserves every target if one destination is an existing user copy', () => {
  const root = mkdtempSync(join(tmpdir(), 'uiux-agent-'));
  try {
    const target = join(root, '.claude/skills/uiux-orchestrator');
    mkdirSync(target, { recursive: true });
    writeFileSync(join(target, 'SKILL.md'), 'user copy');
    const result = run(['install'], root, join(root, 'codex'));
    assert.notEqual(result.status, 0);
    assert.equal(readFileSync(join(target, 'SKILL.md'), 'utf8'), 'user copy');
    assert.equal(existsSync(join(root, '.agents')), false);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('default project install targets only the agents the project already uses', () => {
  const root = mkdtempSync(join(tmpdir(), 'uiux-agent-'));
  try {
    mkdirSync(join(root, '.claude'));
    const result = run(['install'], root, join(root, 'codex'));
    assert.equal(result.status, 0, result.stderr);
    assert.ok(existsSync(join(root, '.claude/skills/uiux-orchestrator/SKILL.md')));
    assert.equal(existsSync(join(root, '.agents')), false);
    assert.equal(existsSync(join(root, '.windsurf')), false);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('uninstall removes managed folders, keeps user skills and empty-folder cleanup is safe', () => {
  const root = mkdtempSync(join(tmpdir(), 'uiux-agent-'));
  try {
    assert.equal(run(['install'], root, join(root, 'codex')).status, 0);
    const user = join(root, '.claude/skills/my-skill');
    mkdirSync(user, { recursive: true }); writeFileSync(join(user, 'SKILL.md'), 'user copy');
    const plan = run(['uninstall', '--dry-run'], root, join(root, 'codex'));
    assert.equal(plan.status, 0, plan.stderr);
    assert.equal(JSON.parse(plan.stdout).remove.length, 3);
    assert.ok(existsSync(join(root, '.agents/skills/uiux-orchestrator')));
    const result = run(['uninstall'], root, join(root, 'codex'));
    assert.equal(result.status, 0, result.stderr);
    assert.equal(readFileSync(join(user, 'SKILL.md'), 'utf8'), 'user copy');
    assert.equal(existsSync(join(root, '.claude/skills/uiux-orchestrator')), false);
    assert.equal(existsSync(join(root, '.agents')), false);
    assert.equal(existsSync(join(root, '.windsurf')), false);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('uninstall rejects install-only options', () => {
  const root = mkdtempSync(join(tmpdir(), 'uiux-agent-'));
  try {
    const result = spawnSync(process.execPath, [cli, 'uninstall', '--platform', 'web'], { cwd: root, encoding: 'utf8' });
    assert.notEqual(result.status, 0);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
