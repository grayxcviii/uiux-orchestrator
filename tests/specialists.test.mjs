import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { detectProject, selectSources } from '../bin/lib/project.mjs';
import { prepareSpecialists } from '../bin/lib/specialists.mjs';
import { commitJobs } from '../bin/lib/install.mjs';

function workspace(t) {
  const root = mkdtempSync(join(tmpdir(), 'uiux-specialists-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}
function json(path, value) { mkdirSync(join(path, '..'), { recursive: true }); writeFileSync(path, JSON.stringify(value)); }

test('detects web, mobile and mixed workspace projects without counting unrelated fixture folders', (t) => {
  const root = workspace(t);
  json(join(root, 'package.json'), { dependencies: { next: '1' }, workspaces: ['apps/*'] });
  json(join(root, 'apps/mobile/package.json'), { dependencies: { expo: '1', 'react-native': '1' } });
  assert.deepEqual(detectProject(root), ['web', 'mobile']);
  assert.deepEqual(detectProject(join(root, 'apps/mobile')), ['mobile']);
  const plain = join(root, 'plain'); mkdirSync(plain);
  json(join(plain, 'tests/fixture/package.json'), { dependencies: { next: '1' } });
  assert.deepEqual(detectProject(plain), []);
});

test('detects Flutter and native projects, static web, and refuses malformed package metadata', (t) => {
  const root = workspace(t);
  writeFileSync(join(root, 'pubspec.yaml'), 'dependencies:\n  flutter:\n    sdk: flutter\n');
  assert.deepEqual(detectProject(root), ['mobile']);
  rmSync(join(root, 'pubspec.yaml')); mkdirSync(join(root, 'App.xcodeproj'));
  assert.deepEqual(detectProject(root), ['mobile']);
  rmSync(join(root, 'App.xcodeproj'), { recursive: true }); writeFileSync(join(root, 'index.html'), '<html></html>');
  assert.deepEqual(detectProject(root), ['web']);
  writeFileSync(join(root, 'package.json'), '{broken');
  assert.throws(() => detectProject(root), /package.json/);
});

test('selects all supported sources globally and platform-relevant skills per project', () => {
  const catalog = { sources: [{ id: 'web', skills: [{ name: 'design', groups: ['web'] }] },
    { id: 'mobile', skills: [{ name: 'native', groups: ['mobile'] }] },
    { id: 'common', skills: [{ name: 'audit', groups: ['web', 'mobile'] }] }] };
  assert.deepEqual(selectSources(catalog, ['web']).map(s => s.id), ['web', 'common']);
  assert.deepEqual(selectSources(catalog, ['mobile']).map(s => s.id), ['mobile', 'common']);
  assert.equal(selectSources(catalog, ['web', 'mobile']).length, 3);
});

function sourceFixture(root) {
  const repo = join(root, 'upstream'); mkdirSync(join(repo, 'skills/design'), { recursive: true });
  writeFileSync(join(repo, 'skills/design/SKILL.md'), '---\nname: design\ndescription: Fixture skill\n---\n');
  writeFileSync(join(repo, 'LICENSE'), 'MIT fixture licence and copyright\n');
  writeFileSync(join(repo, 'NOTICE.md'), 'Original upstream attribution\n');
  writeFileSync(join(repo, 'skills/design/credits.json'), '{"author":"Original artist","license":"CC BY-SA 4.0"}\n');
  for (const args of [['init', '-q'], ['add', '.'], ['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', '-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null', 'commit', '-qm', 'fixture']]) {
    const result = spawnSync('git', args, { cwd: repo, encoding: 'utf8' }); assert.equal(result.status, 0, result.stderr);
  }
  const revision = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).stdout.trim();
  return { id: 'fixture', repository: repo, revision,
    license: { spdx: 'MIT', files: ['LICENSE', 'NOTICE.md'], readme_declaration: false },
    skills: [{ name: 'design', path: 'skills/design', groups: ['web'], registry_ids: ['fixture/design'] }] };
}

test('supplemental notices accompany every target and repair same-revision installations', async (t) => {
  const root = workspace(t), source = sourceFixture(root);
  const parents = [join(root, 'project/.agents/skills'), join(root, 'profile/.agents/skills')];
  commitJobs((await prepareSpecialists([source], parents, join(root, 'old-installer'))).jobs);
  // A new notice requirement must upgrade an existing managed copy at the same upstream commit.
  source.license.bundled_files = ['licenses/apache-2.0.txt'];
  const upgraded = await prepareSpecialists([source], parents, join(root, 'upgrade'));
  assert.equal(upgraded.jobs.length, 2, 'same-revision copies missing new notices need upgrading');
  commitJobs(upgraded.jobs);
  const notice = 'design/.uiux-licenses/supplemental/licenses/apache-2.0.txt';
  const expected = readFileSync(new URL('../skills/uiux-orchestrator/legal/licenses/apache-2.0.txt', import.meta.url));
  for (const parent of parents) {
    assert.deepEqual(readFileSync(join(parent, notice)), expected);
    const provenance = JSON.parse(readFileSync(join(parent, 'design/.uiux-licenses/SOURCE.json')));
    assert.equal(provenance.supplemental_files[0].file, 'licenses/apache-2.0.txt');
    assert.match(provenance.supplemental_files[0].source, /^https:\/\/www.apache.org\//);
  }
  assert.equal((await prepareSpecialists([source], parents, join(root, 'unchanged'))).jobs.length, 0);
  writeFileSync(join(parents[0], notice), 'corrupted notice');
  const repaired = await prepareSpecialists([source], parents, join(root, 'repair'));
  assert.equal(repaired.jobs.length, 1);
  commitJobs(repaired.jobs);
  assert.deepEqual(readFileSync(join(parents[0], notice)), expected);
});

test('missing or escaping bundled notice paths block preparation without writing targets', async (t) => {
  const root = workspace(t), source = sourceFixture(root), parent = join(root, 'target');
  for (const file of ['licenses/missing.txt', '../LICENSE', '/LICENSE']) {
    await assert.rejects(prepareSpecialists([{ ...source, license: { ...source.license, bundled_files: [file] } }],
      [parent], join(root, 'bad-' + file.replaceAll('/', '-'))), /supplement|licen[cs]e|Unsafe/i);
    assert.equal(existsSync(parent), false);
  }
});

test('reviewed asset credit manifests are verified, retained and checked on reruns', async (t) => {
  const root = workspace(t), source = sourceFixture(root), parent = join(root, 'target');
  const file = 'skills/design/credits.json', bytes = readFileSync(join(source.repository, file));
  source.license.asset_manifests = [{ file, sha256: createHash('sha256').update(bytes).digest('hex') }];
  commitJobs((await prepareSpecialists([source], [parent], join(root, 'install'))).jobs);
  assert.deepEqual(readFileSync(join(parent, 'design/credits.json')), bytes);
  writeFileSync(join(parent, 'design/credits.json'), '{}');
  const repaired = await prepareSpecialists([source], [parent], join(root, 'repair'));
  assert.equal(repaired.jobs.length, 1, 'damaged attribution needs repair');
  commitJobs(repaired.jobs);
  assert.deepEqual(readFileSync(join(parent, 'design/credits.json')), bytes);
});

test('a missing or changed upstream asset credit manifest blocks installation', async (t) => {
  const root = workspace(t), source = sourceFixture(root), parent = join(root, 'target');
  for (const file of ['skills/design/credits.json', 'skills/design/missing-credits.json']) {
    await assert.rejects(prepareSpecialists([{ ...source, license: { ...source.license,
      asset_manifests: [{ file, sha256: '0'.repeat(64) }] } }], [parent], join(root, file.replaceAll('/', '-'))), /asset|credit|manifest/i);
    assert.equal(existsSync(parent), false);
  }
});

test('asset credit bytes survive a user Git autocrlf setting', (t) => {
  const root = workspace(t), source = sourceFixture(root), parent = join(root, 'target');
  const file = 'skills/design/credits.json', original = readFileSync(join(source.repository, file));
  source.license.asset_manifests = [{ file, sha256: createHash('sha256').update(original).digest('hex') }];
  const script = `import { prepareSpecialists } from ${JSON.stringify(new URL('../bin/lib/specialists.mjs', import.meta.url).href)};
    import { commitJobs } from ${JSON.stringify(new URL('../bin/lib/install.mjs', import.meta.url).href)};
    const [source, parent, temporary] = process.argv.slice(1);
    commitJobs((await prepareSpecialists([JSON.parse(source)], [parent], temporary)).jobs);`;
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', script, JSON.stringify(source), parent, join(root, 'downloads')], {
    encoding: 'utf8', env: { ...process.env, GIT_CONFIG_COUNT: '1', GIT_CONFIG_KEY_0: 'core.autocrlf', GIT_CONFIG_VALUE_0: 'true' },
  });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(readFileSync(join(parent, 'design/credits.json')), original);
});

test('fetches a pinned git source and retains original licence/NOTICE in every installed skill', async (t) => {
  const root = workspace(t), source = sourceFixture(root), parent = join(root, 'project/.agents/skills');
  const secondParent = join(root, 'project/.claude/skills');
  const prepared = await prepareSpecialists([source], [parent, secondParent], join(root, 'downloads'));
  commitJobs(prepared.jobs);
  const target = join(parent, 'design');
  assert.match(readFileSync(join(target, 'SKILL.md'), 'utf8'), /name: design/);
  assert.equal(readFileSync(join(target, '.uiux-licenses/LICENSE'), 'utf8'), 'MIT fixture licence and copyright\n');
  assert.equal(readFileSync(join(target, '.uiux-licenses/NOTICE.md'), 'utf8'), 'Original upstream attribution\n');
  assert.equal(readFileSync(join(secondParent, 'design/.uiux-licenses/NOTICE.md'), 'utf8'), 'Original upstream attribution\n');
  const again = await prepareSpecialists([source], [parent, secondParent], join(root, 'second-download'));
  assert.equal(again.jobs.length, 0);
  assert.equal(again.kept.length, 2);
  writeFileSync(join(target, '.uiux-licenses/LICENSE'), 'modified licence');
  const repaired = await prepareSpecialists([source], [parent], join(root, 'repair-download'));
  assert.equal(repaired.jobs.length, 1);
  commitJobs(repaired.jobs);
  assert.equal(readFileSync(join(target, '.uiux-licenses/LICENSE'), 'utf8'), 'MIT fixture licence and copyright\n');
});

test('preserves user-managed skills and fails a bad revision without writing destinations', async (t) => {
  const root = workspace(t), source = sourceFixture(root), parent = join(root, 'skills');
  mkdirSync(join(parent, 'design'), { recursive: true }); writeFileSync(join(parent, 'design/SKILL.md'), 'user copy');
  const kept = await prepareSpecialists([source], [parent], join(root, 'downloads'));
  assert.equal(kept.jobs.length, 0);
  assert.equal(readFileSync(join(parent, 'design/SKILL.md'), 'utf8'), 'user copy');
  const fresh = join(root, 'fresh');
  await assert.rejects(prepareSpecialists([{ ...source, revision: '0'.repeat(40) }], [fresh], join(root, 'bad-download')));
  assert.equal(existsSync(fresh), false);
});

test('missing licence or unexpected skill name blocks preparation before installation', async (t) => {
  const root = workspace(t), source = sourceFixture(root);
  await assert.rejects(prepareSpecialists([{ ...source, license: { ...source.license, files: ['MISSING-LICENSE'] } }],
    [join(root, 'target')], join(root, 'downloads')), /licen[cs]e/i);
  assert.equal(existsSync(join(root, 'target')), false);
  await assert.rejects(prepareSpecialists([{ ...source, skills: [{ ...source.skills[0], name: 'unexpected-name' }] }],
    [join(root, 'target')], join(root, 'wrong-name')), /Unexpected skill name/);
});

test('CLI previews global/all and project-specific selection without network or file changes', (t) => {
  const root = workspace(t), cli = new URL('../bin/uiux-orchestrator.mjs', import.meta.url).pathname;
  function plan(args) {
    const result = spawnSync(process.execPath, [cli, 'install', '--dry-run', '--agent', 'codex', ...args], { cwd: root, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr); return JSON.parse(result.stdout);
  }
  assert.equal(plan(['--global']).sources.length, 13);
  json(join(root, 'package.json'), { dependencies: { next: '1' } });
  const web = plan([]); assert.deepEqual(web.platforms, ['web']);
  assert.ok(web.sources.some(s => s.id === 'anthropic')); assert.ok(!web.sources.some(s => s.id === 'expo'));
  json(join(root, 'package.json'), { dependencies: { expo: '1' } });
  const mobile = plan([]); assert.deepEqual(mobile.platforms, ['mobile']);
  assert.ok(mobile.sources.some(s => s.id === 'expo')); assert.ok(!mobile.sources.some(s => s.id === 'taste'));
  assert.equal(existsSync(join(root, '.agents')), false);
});

test('unknown projects default to the full catalogue and accept an explicit platform', (t) => {
  const root = workspace(t), cli = new URL('../bin/uiux-orchestrator.mjs', import.meta.url).pathname;
  for (const args of [[], ['--project']]) {
    const result = spawnSync(process.execPath, [cli, 'install', '--agent', 'codex', '--dry-run', ...args], { cwd: root, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    const plan = JSON.parse(result.stdout);
    assert.equal(plan.scope, 'project');
    assert.deepEqual(plan.platforms, ['web', 'mobile']);
    assert.ok(plan.sources.some(s => s.id === 'taste'));
    assert.ok(plan.sources.some(s => s.id === 'expo'));
  }
  const explicit = spawnSync(process.execPath, [cli, 'install', '--platform', 'mobile', '--dry-run'], { cwd: root, encoding: 'utf8' });
  assert.equal(explicit.status, 0, explicit.stderr);
  assert.deepEqual(JSON.parse(explicit.stdout).platforms, ['mobile']);
  assert.equal(existsSync(join(root, '.agents')), false);
});

test('batch preparation failure leaves even a previously prepared valid source uninstalled', async (t) => {
  const root = workspace(t), source = sourceFixture(root), parent = join(root, 'target');
  await assert.rejects(prepareSpecialists([source, { ...source, id: 'broken', revision: '0'.repeat(40),
    skills: [{ ...source.skills[0], name: 'second-skill' }] }], [parent], join(root, 'downloads')));
  assert.equal(existsSync(parent), false);
});

test('commit preflight protects user copies before any staged installation is committed', (t) => {
  const root = workspace(t), source = join(root, 'source'), first = join(root, 'first'), occupied = join(root, 'occupied');
  mkdirSync(source); writeFileSync(join(source, 'SKILL.md'), 'new');
  mkdirSync(occupied); writeFileSync(join(occupied, 'SKILL.md'), 'user copy');
  assert.throws(() => commitJobs([{ source, destination: first }, { source, destination: occupied }]), /Refusing/);
  assert.equal(existsSync(first), false);
  assert.equal(readFileSync(join(occupied, 'SKILL.md'), 'utf8'), 'user copy');
});

test('rejects upstream symlinks that escape the pinned repository', async (t) => {
  const root = workspace(t), source = sourceFixture(root);
  const outside = join(root, 'private.txt'); writeFileSync(outside, 'must not be copied');
  symlinkSync(outside, join(source.repository, 'skills/design/leak.txt'));
  for (const args of [['add', '.'], ['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', '-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null', 'commit', '-qm', 'link']]) {
    assert.equal(spawnSync('git', args, { cwd: source.repository }).status, 0);
  }
  source.revision = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: source.repository, encoding: 'utf8' }).stdout.trim();
  await assert.rejects(prepareSpecialists([source], [join(root, 'target')], join(root, 'downloads')), /symlink escapes/);
  assert.equal(existsSync(join(root, 'target')), false);
});

test('pnpm workspaces detect both groups even without a final newline', (t) => {
  const root = workspace(t);
  writeFileSync(join(root, 'pnpm-workspace.yaml'), "packages:\n  - 'apps/*'");
  json(join(root, 'apps/web/package.json'), { dependencies: { vue: '1' } });
  json(join(root, 'apps/mobile/package.json'), { dependencies: { 'react-native': '1' } });
  assert.deepEqual(detectProject(root), ['web', 'mobile']);
});

test('workspace exclusions do not install skills for an excluded app', (t) => {
  const root = workspace(t);
  json(join(root, 'package.json'), { workspaces: ['apps/*', '!apps/mobile'] });
  json(join(root, 'apps/web/package.json'), { dependencies: { vue: '1' } });
  json(join(root, 'apps/mobile/package.json'), { dependencies: { expo: '1' } });
  assert.deepEqual(detectProject(root), ['web']);
});

test('partial-segment workspace globs and wildcard exclusions select the correct groups', (t) => {
  const root = workspace(t);
  json(join(root, 'package.json'), { workspaces: ['apps/web-*', 'apps/native-*'] });
  json(join(root, 'apps/web-store/package.json'), { dependencies: { next: '1' } });
  json(join(root, 'apps/native-demo/package.json'), { dependencies: { expo: '1' } });
  assert.deepEqual(detectProject(root), ['web', 'mobile']);
  json(join(root, 'package.json'), { workspaces: ['apps/web-*', 'apps/native-*', '!apps/native-*'] });
  assert.deepEqual(detectProject(root), ['web']);
});

test('missing Git fails a full install clearly before changing skill directories', (t) => {
  const root = workspace(t), cli = new URL('../bin/uiux-orchestrator.mjs', import.meta.url).pathname;
  const result = spawnSync(process.execPath, [cli, 'install', '--platform', 'web', '--agent', 'codex'], {
    cwd: root, env: { ...process.env, PATH: root }, encoding: 'utf8',
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Git is required/);
  assert.equal(existsSync(join(root, '.agents')), false);
});
