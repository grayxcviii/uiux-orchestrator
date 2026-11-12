import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';

test('npm package excludes Python caches even after local validation', () => {
  const root = mkdtempSync(join(tmpdir(), 'uiux-pack-cache-'));
  try {
    const project = join(root, 'project');
    mkdirSync(project);
    for (const entry of ['package.json', 'bin', 'skills', 'LICENSE', 'README.md', 'THIRD_PARTY_NOTICES.md']) {
      cpSync(resolve(entry), join(project, entry), { recursive: true });
    }
    const scripts = join(project, 'skills/uiux-orchestrator/scripts');
    mkdirSync(join(scripts, '__pycache__'), { recursive: true });
    writeFileSync(join(scripts, '__pycache__/release-test.cpython-312.pyc'), 'test cache');
    writeFileSync(join(scripts, 'release-test.pyc'), 'test cache');
    const result = spawnSync('npm', ['pack', '--dry-run', '--json'], {
      cwd: project, env: { ...process.env, npm_config_cache: join(root, 'cache') },
      encoding: 'utf8', timeout: 60000,
    });
    assert.equal(result.status, 0, result.stderr);
    const files = JSON.parse(result.stdout)[0].files.map(file => file.path);
    assert.ok(files.includes('skills/uiux-orchestrator/scripts/check-orchestration.py'));
    assert.deepEqual(files.filter(file => file.includes('__pycache__') || /\.py[cod]$/.test(file)), []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

for (const inheritedDryRun of ['false', 'true']) {
test(`packed npm CLI installs with isolated scopes (parent dry-run=${inheritedDryRun})`, () => {
  const root = mkdtempSync(join(tmpdir(), 'uiux-npx-'));
  const env = { ...process.env, npm_config_dry_run: inheritedDryRun, npm_config_cache: join(root, 'cache'), CODEX_HOME: join(root, 'codex') };
  // publish --dry-run exports this flag to lifecycle scripts. The test must still
  // create and install its temporary tarball; only these child commands override it.
  const commandEnv = { ...env, npm_config_dry_run: 'false' };
  function command(executable, args, cwd) {
    const result = spawnSync(executable, args, { cwd, env: commandEnv, encoding: 'utf8', timeout: 60000 });
    assert.equal(result.status, 0, `${result.error || ''}\n${result.stdout}\n${result.stderr}`);
    return result.stdout;
  }
  try {
    const packed = JSON.parse(command('npm', ['pack', '--json', '--pack-destination', root], resolve()));
    const files = new Set(packed[0].files.map((file) => file.path));
    assert.ok(files.has('THIRD_PARTY_NOTICES.md'));
    assert.ok(files.has('skills/uiux-orchestrator/LICENSE'));
    assert.ok(files.has('skills/uiux-orchestrator/legal/THIRD_PARTY_NOTICES.md'));
    assert.ok(files.has('skills/uiux-orchestrator/legal/licenses/apache-2.0.txt'));
    for (const file of ['core/direction.md', 'registry/styles.json', 'scripts/direction.mjs']) {
      assert.ok(files.has('skills/uiux-orchestrator/' + file), file);
    }
    for (const file of ['scripts/probe-runtime.py', 'scripts/check-orchestration.py']) {
      assert.ok(files.has('skills/uiux-orchestrator/' + file), file);
    }
    const supplementary = ['asset-usage.md', 'licenses/taste-lucide-license', 'licenses/taste-vscode-icons-license',
      'licenses/taste-simple-icons-license', 'licenses/taste-gilbarbara-license', 'licenses/ehmo-platform-design-license'];
    for (const file of supplementary) assert.ok(files.has('skills/uiux-orchestrator/legal/' + file), file);
    for (const file of ['bin/specialists.json', 'bin/lib/project.mjs', 'bin/lib/install.mjs', 'bin/lib/specialists.mjs', 'bin/licenses/MIT-terms.txt']) {
      assert.ok(files.has(file), file);
    }
    const tarball = join(root, packed[0].filename);
    assert.ok(existsSync(tarball), 'npm pack must create the temporary tarball');
    const projectA = join(root, 'project-a');
    const projectB = join(root, 'project-b');
    mkdirSync(projectA);
    mkdirSync(projectB);
    const localA = join(projectA, '.agents', 'skills', 'uiux-orchestrator', 'SKILL.md');
    const localB = join(projectB, '.agents', 'skills', 'uiux-orchestrator', 'SKILL.md');
    const global = join(env.CODEX_HOME, 'skills', 'uiux-orchestrator', 'SKILL.md');
    const npx = ['--offline', '--yes', '--package', tarball, '--', 'uiux-orchestrator', 'install', '--orchestrator-only', '--agent', 'codex'];
    const bootstrap = ['--offline', '--yes', '--package', tarball, '--', 'uiux-orchestrator', 'install', '--dry-run', '--agent', 'codex'];
    const webPlan = JSON.parse(command('npx', [...bootstrap, '--platform', 'web'], projectA));
    assert.ok(webPlan.sources.some(source => source.id === 'anthropic'));
    assert.equal(webPlan.sources.some(source => source.id === 'expo'), false);
    const globalPlan = JSON.parse(command('npx', [...bootstrap, '--global'], projectB));
    assert.equal(globalPlan.sources.length, 14);
    command('npx', npx, projectA);
    assert.match(readFileSync(localA, 'utf8'), /^name: uiux-orchestrator/m);
    for (const file of ['LICENSE', 'legal/THIRD_PARTY_NOTICES.md', 'legal/licenses/apache-2.0.txt']) {
      assert.ok(existsSync(join(projectA, '.agents/skills/uiux-orchestrator', file)), file);
    }
    for (const file of ['scripts/probe-runtime.py', 'scripts/check-orchestration.py']) {
      assert.ok(existsSync(join(projectA, '.agents/skills/uiux-orchestrator', file)), file);
    }
    for (const file of supplementary) {
      assert.ok(existsSync(join(projectA, '.agents/skills/uiux-orchestrator/legal', file)), file);
    }
    assert.equal(existsSync(localB), false);
    assert.equal(existsSync(global), false);
    command('npx', [...npx, '--project'], projectA);
    command('npx', [...npx, '--global'], projectB);
    assert.match(readFileSync(global, 'utf8'), /^name: uiux-orchestrator/m);
    assert.equal(existsSync(localB), false);
    command('npx', [...npx, '-g'], projectA);
    assert.ok(existsSync(global));
    assert.ok(existsSync(localA));

    // Use a temporary user profile so the multi-agent global test cannot touch real installations.
    const profile = join(root, 'profile');
    const isolatedEnv = { ...commandEnv, HOME: profile, USERPROFILE: profile,
      CLAUDE_CONFIG_DIR: join(profile, '.claude'), XDG_CONFIG_HOME: join(profile, '.config') };
    delete isolatedEnv.CODEX_HOME;
    const allAgents = spawnSync('npx', npx.slice(0, -2).concat('--global'), {
      cwd: projectB, env: isolatedEnv, encoding: 'utf8', timeout: 60000,
    });
    assert.equal(allAgents.status, 0, `${allAgents.error || ''}\n${allAgents.stderr}`);
    for (const folder of ['.agents/skills', '.claude/skills', '.cursor/skills', '.gemini/skills', '.copilot/skills',
      '.config/opencode/skills', '.codeium/windsurf/skills']) {
      assert.ok(existsSync(join(profile, folder, 'uiux-orchestrator', 'SKILL.md')), folder);
    }
    assert.equal(existsSync(localB), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
}
