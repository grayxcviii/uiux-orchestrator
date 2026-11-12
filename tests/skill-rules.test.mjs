import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, normalize, relative } from 'node:path'
import test from 'node:test'

const SKILL = 'skills/uiux-orchestrator'
const walk = dir => readdirSync(dir).flatMap(name => {
  const path = join(dir, name)
  return statSync(path).isDirectory() ? (name === 'legal' ? [] : walk(path)) : path.endsWith('.md') ? [path] : []
})
const files = walk(SKILL)
const text = Object.fromEntries(files.map(f => [f, readFileSync(f, 'utf8')]))

test('every inventoried rule is still present in the skill', () => {
  const { rules } = JSON.parse(readFileSync('tests/rule-inventory.json', 'utf8'))
  assert.equal(new Set(rules.map(r => r.id)).size, rules.length, 'duplicate rule ids')
  const corpus = Object.values(text).join('\n')
  const missing = rules.filter(r => !new RegExp(r.pattern, 'i').test(corpus)).map(r => r.id)
  assert.deepEqual(missing, [], `rules lost from the skill: ${missing.join(', ')}`)
})

test('every skill Markdown file is reachable from SKILL.md through links', () => {
  const seen = new Set(), queue = [join(SKILL, 'SKILL.md')]
  while (queue.length) {
    const file = normalize(queue.pop())
    if (seen.has(file) || !text[file]) continue
    seen.add(file)
    for (const [, target] of text[file].matchAll(/\]\(([^)#\s]+\.md)(?:#[^)]*)?\)/g)) {
      if (!/^[a-z]+:/.test(target)) queue.push(join(dirname(file), target))
    }
  }
  const unreachable = files.map(normalize).filter(f => !seen.has(f)).map(f => relative(SKILL, f))
  assert.deepEqual(unreachable, [], `not linked from SKILL.md: ${unreachable.join(', ')}`)
})

test('every Markdown anchor link in the skill points at an existing heading', () => {
  const slug = h => h.trim().toLowerCase().replace(/[`*_]/g, '').replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s/g, '-')
  const anchors = file => new Set([...text[file].matchAll(/^#{1,6}\s+(.+)$/gm)].map(m => slug(m[1])))
  const broken = []
  for (const file of files) {
    for (const [, target, anchor] of text[file].matchAll(/\]\(([^)#\s]*\.md)?#([^)\s]+)\)/g)) {
      const dest = normalize(target ? join(dirname(file), target) : file)
      if (!text[dest]) continue
      if (!anchors(dest).has(anchor)) broken.push(`${relative(SKILL, file)} → ${relative(SKILL, dest)}#${anchor}`)
    }
  }
  assert.deepEqual(broken, [], broken.join('\n'))
})
