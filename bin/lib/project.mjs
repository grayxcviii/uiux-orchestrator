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

export function detectProject(directory) {
  const root = resolve(directory), visited = new Set(), groups = new Set();
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
    if (native) groups.add('mobile');
    const web = ['next', 'vite', 'vue', 'nuxt', 'svelte', '@sveltejs/kit', 'astro', '@angular/core', 'react-dom', 'react-native-web'];
    if (web.some(name => name in deps) || (!native && 'react' in deps) || existsSync(join(dir, 'index.html'))) groups.add('web');
    if (existsSync(join(dir, 'pubspec.yaml')) && /^\s*flutter\s*:/m.test(readFileSync(join(dir, 'pubspec.yaml'), 'utf8'))) groups.add('mobile');
    if (readdirSync(dir).some(name => /\.(xcodeproj|xcworkspace)$/.test(name))) groups.add('mobile');
    for (const file of ['build.gradle', 'build.gradle.kts', 'app/build.gradle', 'app/build.gradle.kts', 'Package.swift']) {
      const path = join(dir, file);
      if (existsSync(path) && /com\.android|android\.application|android\.library|\.iOS|SwiftUI|UIKit/.test(readFileSync(path, 'utf8'))) groups.add('mobile');
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
  return ['web', 'mobile'].filter(group => groups.has(group));
}

export function selectSources(catalog, groups) {
  return catalog.sources.map(source => ({ ...source, skills: source.skills.filter(skill => skill.groups.some(group => groups.includes(group))) }))
    .filter(source => source.skills.length);
}
