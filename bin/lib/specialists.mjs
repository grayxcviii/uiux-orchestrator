import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existing, managed } from './install.mjs';

const bundledLegal = fileURLToPath(new URL('../../skills/uiux-orchestrator/legal/', import.meta.url));
const sha256 = path => createHash('sha256').update(readFileSync(path)).digest('hex');

function inside(root, path) {
  if (isAbsolute(path) || path.split(/[\\/]/).includes('..')) throw new Error(`Unsafe upstream path: ${path}`);
  const full = resolve(root, path);
  if (full !== resolve(root) && !full.startsWith(resolve(root) + sep)) throw new Error(`Unsafe upstream path: ${path}`);
  return full;
}
function safeTree(path, root, ancestors = new Set()) {
  const resolved = realpathSync(path);
  if (resolved !== root && !resolved.startsWith(root + sep)) throw new Error(`Upstream symlink escapes repository: ${path}`);
  if (ancestors.has(resolved)) throw new Error(`Cyclic upstream symlink: ${path}`);
  if (lstatSync(resolved).isDirectory()) {
    const next = new Set(ancestors).add(resolved);
    for (const name of readdirSync(resolved)) safeTree(join(resolved, name), root, next);
  }
}
function git(args, cwd) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn('git', ['-c', 'core.hooksPath=/dev/null', '-c', 'core.fsmonitor=false', '-c', 'core.autocrlf=false', ...args], {
      cwd, env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GIT_LFS_SKIP_SMUDGE: '1', GIT_TRACE: '0', GIT_TRACE_CURL: '0' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '', errors = '';
    child.stdout.on('data', data => { output = (output + data).slice(-16000); });
    child.stderr.on('data', data => { errors = (errors + data).slice(-16000); });
    const timer = setTimeout(() => child.kill('SIGTERM'), 120000);
    child.on('error', error => { clearTimeout(timer); reject(new Error(`Git is required to install specialists: ${error.message}`)); });
    child.on('close', code => { clearTimeout(timer); code === 0 ? resolvePromise(output.trim()) : reject(new Error(`git ${args[0]} failed: ${errors || `exit ${code}`}`)); });
  });
}

async function checkout(source, root) {
  if (!/^[a-z0-9-]+$/.test(source.id) || !(isAbsolute(source.repository) || /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\.git$/.test(source.repository))) {
    throw new Error('Invalid specialist source');
  }
  if (!/^[a-f0-9]{40}$/.test(source.revision)) throw new Error(`Source ${source.id} is not pinned to a commit`);
  mkdirSync(root, { recursive: true });
  await git(['init', '-q'], root);
  await git(['fetch', '-q', '--depth=1', '--filter=blob:none', source.repository, source.revision], root);
  await git(['sparse-checkout', 'init', '--no-cone'], root);
  const patterns = [...source.skills.map(skill => { inside(root, skill.path); return `/${skill.path}/`; }),
    ...source.license.files.map(file => { inside(root, file); return `/${file}`; })];
  await git(['sparse-checkout', 'set', '--no-cone', ...patterns], root);
  await git(['checkout', '-q', '--detach', 'FETCH_HEAD'], root);
  if (await git(['rev-parse', 'HEAD'], root) !== source.revision) throw new Error(`Revision mismatch for ${source.id}`);
}

function supplementalFiles(source) {
  const origins = JSON.parse(readFileSync(join(bundledLegal, 'sources.json'), 'utf8'));
  return (source.license.bundled_files || []).map(file => {
    const path = inside(bundledLegal, file);
    if (!existsSync(path) || !lstatSync(path).isFile()) throw new Error(`Missing supplemental licence: ${file}`);
    const hash = sha256(path), origin = origins.find(entry => entry.file === file);
    if ((!origin && file !== 'asset-usage.md') || (origin && hash !== origin.sha256)) {
      throw new Error(`Unverified supplemental licence: ${file}`);
    }
    return { file, path, sha256: hash, source: origin?.source || null };
  });
}

function assetManifests(source, skill) {
  return (source.license.asset_manifests || []).filter(entry => entry.file.startsWith(skill.path + '/'));
}

function currentInstallation(destination, source, skill, previous, supplements) {
  if (previous.revision !== source.revision || previous.path !== skill.path || !existsSync(join(destination, 'SKILL.md'))) return false;
  try {
    const legal = join(destination, '.uiux-licenses');
    const provenance = JSON.parse(readFileSync(join(legal, 'SOURCE.json'), 'utf8'));
    return source.license.files.every(file => {
      const entry = provenance.files.find(entry => entry.file === file);
      return entry && createHash('sha256').update(readFileSync(inside(legal, file))).digest('hex') === entry.sha256;
    }) && (!source.license.readme_declaration || sha256(join(legal, 'MIT-terms.txt')) === sha256(fileURLToPath(new URL('../licenses/MIT-terms.txt', import.meta.url))))
      && supplements.every(entry => {
        const recorded = provenance.supplemental_files?.find(item => item.file === entry.file);
        return recorded?.sha256 === entry.sha256 && sha256(inside(join(legal, 'supplemental'), entry.file)) === entry.sha256;
      })
      && assetManifests(source, skill).every(entry => sha256(inside(destination, entry.file.slice(skill.path.length + 1))) === entry.sha256);
  } catch { return false; }
}

export async function prepareSpecialists(sources, parents, tempRoot, log = () => {}) {
  const jobs = [], kept = [];
  for (const source of sources) {
    const supplements = supplementalFiles(source);
    const pending = [];
    for (const skill of source.skills) {
      if (!/^[a-z0-9][a-z0-9-]*$/.test(skill.name)) throw new Error(`Invalid skill name: ${skill.name}`);
      for (const parent of parents) {
        const destination = join(parent, skill.name), previous = managed(destination);
        if (existing(destination)) {
          if (!previous || (previous.name && previous.name !== skill.name) || (previous.repository && previous.repository !== source.repository)) {
            kept.push({ name: skill.name, destination, reason: 'existing user-managed skill; not modified or verified' }); continue;
          }
          if (currentInstallation(destination, source, skill, previous, supplements)) {
            kept.push({ name: skill.name, destination, reason: 'already installed at the pinned revision' }); continue;
          }
        }
        pending.push({ skill, destination });
      }
    }
    if (!pending.length) continue;
    const checkoutRoot = join(tempRoot, source.id, 'repository');
    log(`Fetching ${source.id} @ ${source.revision.slice(0, 12)}`);
    await checkout(source, checkoutRoot);
    const licencePaths = source.license.files.map(file => {
      const path = inside(checkoutRoot, file);
      if (!existsSync(path) || !lstatSync(path).isFile()) throw new Error(`Missing upstream licence/notice: ${source.id}/${file}`);
      return { file, path };
    });
    if (source.license.readme_declaration && !/^#{1,6}\s+Licen[cs]e\s*\n[\s\S]{0,500}\bMIT\b/im.test(readFileSync(licencePaths[0].path, 'utf8'))) {
      throw new Error(`Unverified MIT licence declaration for ${source.id}`);
    }
    for (const entry of source.license.asset_manifests || []) {
      if (!source.skills.some(skill => entry.file.startsWith(skill.path + '/'))) continue;
      const path = inside(checkoutRoot, entry.file);
      if (!existsSync(path) || !lstatSync(path).isFile() || !/^[a-f0-9]{64}$/.test(entry.sha256) || sha256(path) !== entry.sha256) {
        throw new Error(`Missing or changed asset credit manifest: ${source.id}/${entry.file}`);
      }
      safeTree(path, realpathSync(checkoutRoot));
    }
    const prepared = new Map();
    for (const { skill, destination } of pending) {
      if (!prepared.has(skill.name)) {
        const path = inside(checkoutRoot, skill.path);
        if (!existsSync(join(path, 'SKILL.md'))) throw new Error(`Missing upstream skill: ${source.id}/${skill.path}`);
        safeTree(path, realpathSync(checkoutRoot));
        const name = readFileSync(join(path, 'SKILL.md'), 'utf8').match(/^name:\s*["']?([a-z0-9-]+)/m)?.[1];
        if (name !== skill.name) throw new Error(`Unexpected skill name: ${source.id}/${skill.path}`);
        const ready = join(tempRoot, source.id, 'ready', skill.name);
        mkdirSync(dirname(ready), { recursive: true }); cpSync(path, ready, { recursive: true, dereference: true });
        if (existsSync(join(ready, '.uiux-licenses'))) throw new Error(`Reserved licence directory in ${skill.name}`);
        const legal = join(ready, '.uiux-licenses'); mkdirSync(legal);
        const provenance = [];
        for (const { file, path: licencePath } of licencePaths) {
          const target = inside(legal, file); mkdirSync(dirname(target), { recursive: true }); cpSync(licencePath, target);
          provenance.push({ file, sha256: createHash('sha256').update(readFileSync(licencePath)).digest('hex') });
        }
        for (const entry of supplements) {
          const target = inside(join(legal, 'supplemental'), entry.file);
          mkdirSync(dirname(target), { recursive: true }); cpSync(entry.path, target);
        }
        if (source.license.readme_declaration) cpSync(fileURLToPath(new URL('../licenses/MIT-terms.txt', import.meta.url)), join(legal, 'MIT-terms.txt'));
        writeFileSync(join(legal, 'SOURCE.json'), JSON.stringify({ repository: source.repository, revision: source.revision,
          path: skill.path, license: source.license.spdx, readme_declaration: source.license.readme_declaration, files: provenance,
          supplemental_files: supplements.map(({ path, ...entry }) => entry), asset_manifests: assetManifests(source, skill) }, null, 2) + '\n');
        prepared.set(skill.name, ready);
      }
      jobs.push({ source: prepared.get(skill.name), destination, metadata: { name: skill.name, repository: source.repository,
        revision: source.revision, path: skill.path, licenses: source.license.files } });
    }
  }
  return { jobs, kept };
}
