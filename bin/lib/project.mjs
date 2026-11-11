import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { isAbsolute, join, relative, resolve } from 'node:path';

const ignored = new Set(['node_modules', '.git', '.agents', '.claude', 'dist', 'build', '.next']);

function folders(root) {
  return readdirSync(root, { withFileTypes: true }).filter(d => d.isDirectory() && !ignored.has(d.name)).map(d => d.name);
}

function expand(root, pattern) {
  if (typeof pattern !== 'string' || pattern.startsWith('!') || isAbsolute(pattern) || pattern.split(/[\\/]/).includes('..')) return [];
  if (/[\[\]{}()]/.test(pattern)) throw new Error(`Unsupported workspace pattern ${pattern}; use --platform web, mobile or all`);
  const parts = pattern.replace(/\/$/, '').split('/');
  function walk(dir, index, depth) {
    if (index === parts.length) return [dir];
    if (depth > 6 || !existsSync(dir)) return [];
    if (parts[index] === '**') return [...walk(dir, index + 1, depth), ...folders(dir).flatMap(name => walk(join(dir, name), index, depth + 1))];
    if (/[*?]/.test(parts[index])) {
      const expression = new RegExp('^' + parts[index].replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
      return folders(dir).filter(name => expression.test(name)).flatMap(name => walk(join(dir, name), index + 1, depth + 1));
    }
    const candidate = join(dir, parts[index]);
    return folders(dir).includes(parts[index]) ? walk(candidate, index + 1, depth + 1) : [];
  }
  return walk(root, 0, 0);
}

export const stackIds = ['expo', 'react-native', 'ios-native', 'android-native', 'flutter'];

// Groups decide web/mobile; stacks narrow mobile specialists to the frameworks actually present.
export function detectProfile(directory) {
  const root = resolve(directory), visited = new Set(), groups = new Set(), stacks = new Set();
  function inspect(dir) {
    if (visited.has(dir) || relative(root, dir).startsWith('..')) return;
    visited.add(dir);
    const packagePath = join(dir, 'package.json');
    let pkg = {};
    if (existsSync(packagePath)) {
      try { pkg = JSON.parse(readFileSync(packagePath, 'utf8')); }
      catch (error) { throw new Error(`Cannot read ${packagePath}: ${error.message}`); }
    }
    const deps = { ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies };
    const native = 'react-native' in deps || 'expo' in deps;
    if (native) { groups.add('mobile'); stacks.add('react-native'); }
    if ('expo' in deps) stacks.add('expo');
    const web = ['next', 'vite', 'vue', 'nuxt', 'svelte', '@sveltejs/kit', 'astro', '@angular/core', 'react-dom', 'react-native-web'];
    if (web.some(name => name in deps) || (!native && 'react' in deps) || existsSync(join(dir, 'index.html'))) groups.add('web');
    if (existsSync(join(dir, 'pubspec.yaml')) && /^\s*flutter\s*:/m.test(readFileSync(join(dir, 'pubspec.yaml'), 'utf8'))) { groups.add('mobile'); stacks.add('flutter'); }
    if (readdirSync(dir).some(name => /\.(xcodeproj|xcworkspace)$/.test(name))) { groups.add('mobile'); stacks.add('ios-native'); }
    for (const file of ['build.gradle', 'build.gradle.kts', 'app/build.gradle', 'app/build.gradle.kts', 'Package.swift']) {
      const path = join(dir, file);
      if (existsSync(path) && /com\.android|android\.application|android\.library|\.iOS|SwiftUI|UIKit/.test(readFileSync(path, 'utf8'))) {
        groups.add('mobile'); stacks.add(file === 'Package.swift' ? 'ios-native' : 'android-native');
      }
    }
    let patterns = Array.isArray(pkg.workspaces) ? pkg.workspaces : pkg.workspaces?.packages || [];
    if (!Array.isArray(patterns)) throw new Error(`Invalid workspaces in ${packagePath}`);
    const pnpm = join(dir, 'pnpm-workspace.yaml');
    if (existsSync(pnpm)) {
      let inPackages = false;
      for (const line of readFileSync(pnpm, 'utf8').split(/\r?\n/)) {
        if (/^packages:\s*$/.test(line)) { inPackages = true; continue; }
        if (inPackages && /^[^\s#]/.test(line)) break;
        const match = inPackages && line.match(/^\s*-\s*["']?([^"'\s]+)["']?\s*$/);
        if (match) patterns.push(match[1]);
      }
    }
    const excluded = new Set(patterns.filter(p => typeof p === 'string' && p.startsWith('!')).flatMap(p => expand(dir, p.slice(1))));
    for (const pattern of patterns) for (const child of expand(dir, pattern)) if (!excluded.has(child)) inspect(child);
  }
  inspect(root);
  return { groups: ['web', 'mobile'].filter(group => groups.has(group)), stacks: stackIds.filter(stack => stacks.has(stack)) };
}

export function detectProject(directory) {
  return detectProfile(directory).groups;
}

// Without `stacks` (global, explicit --platform, or nothing detected) every skill in the groups is kept.
export function selectSources(catalog, groups, stacks) {
  const fits = skill => skill.groups.some(group => groups.includes(group))
    && (!stacks || !skill.stacks || skill.stacks.some(stack => stacks.includes(stack)));
  return catalog.sources.map(source => ({ ...source, skills: source.skills.filter(fits) }))
    .filter(source => source.skills.length);
}

// Project/home markers that show an agent is in use. AGENTS.md and .agents/ map to the shared .agents/skills folder.
export const agentMarkers = {
  'claude-code': { project: ['.claude', 'CLAUDE.md'], home: ['.claude'] },
  codex: { project: ['.codex', '.agents', 'AGENTS.md'], home: ['.codex', '.agents'] },
  cursor: { project: ['.cursor', '.cursorrules'], home: ['.cursor'] },
  'gemini-cli': { project: ['.gemini', 'GEMINI.md'], home: ['.gemini'] },
  'github-copilot': { project: ['.github/copilot-instructions.md'], home: ['.copilot'] },
  opencode: { project: ['.opencode', 'opencode.json', 'opencode.jsonc'], home: ['.config/opencode'] },
  windsurf: { project: ['.windsurf', '.windsurfrules'], home: ['.codeium/windsurf'] },
};

export function detectAgents(directory, scope, env = {}) {
  return Object.entries(agentMarkers).filter(([agent, markers]) => {
    if (scope === 'project') return markers.project.some(marker => existsSync(join(directory, marker)));
    if (agent === 'claude-code' && env.CLAUDE_CONFIG_DIR && existsSync(env.CLAUDE_CONFIG_DIR)) return true;
    if (agent === 'codex' && env.CODEX_HOME && existsSync(env.CODEX_HOME)) return true;
    if (agent === 'opencode' && env.XDG_CONFIG_HOME && existsSync(join(env.XDG_CONFIG_HOME, 'opencode'))) return true;
    return markers.home.some(marker => existsSync(join(directory, marker)));
  }).map(([agent]) => agent);
}
