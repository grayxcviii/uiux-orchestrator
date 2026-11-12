import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { decide, loadLibrary } from '../skills/uiux-orchestrator/scripts/direction.mjs'

const library = loadLibrary()
const { scenarios } = JSON.parse(readFileSync('tests/direction-scenarios.json', 'utf8'))
const ids = new Set(library.styles.map(s => s.id))

test('style library is internally consistent and uses only its own vocabulary', () => {
  assert.ok(library.styles.length >= 13)
  const families = new Set()
  for (const style of library.styles) {
    families.add(style.family)
    for (const field of ['id', 'name', 'family', 'label', 'persona', 'ambition', 'color_posture', 'motion', 'fit', 'pairs_with', 'clashes_with', 'treatments', 'accessibility', 'platform_notes']) {
      assert.ok(style[field] !== undefined, `${style.id}.${field}`)
    }
    for (const field of ['typography', 'color', 'layout', 'components', 'surface', 'motion', 'imagery']) assert.ok(style.treatments[field], `${style.id} treatment ${field}`)
    for (const other of [...style.pairs_with, ...style.clashes_with]) assert.ok(ids.has(other), `${style.id} references ${other}`)
    for (const other of style.pairs_with) assert.ok(library.styles.find(s => s.id === other).pairs_with.includes(style.id), `pairing ${style.id} ↔ ${other} is one-way`)
    for (const other of style.clashes_with) assert.ok(!library.styles.find(s => s.id === other).pairs_with.includes(style.id), `${other} pairs with ${style.id} but ${style.id} clashes with it`)
    assert.ok(Array.isArray(style.aliases), `${style.id}.aliases`)
    assert.deepEqual(style.pairs_with.filter(id => style.clashes_with.includes(id)), [], `${style.id} pairs and clashes with the same style`)
    for (const [dimension, levels] of Object.entries(style.fit)) {
      for (const values of Object.values(levels)) for (const v of values) assert.ok(library.vocabulary[dimension].includes(v), `${style.id} fit ${dimension}: ${v}`)
    }
    for (const rule of style.exclude_when) for (const v of rule.values) assert.ok(library.vocabulary[rule.dimension].includes(v), `${style.id} exclude ${v}`)
  }
  assert.ok(families.size >= 3)
  for (const mode of Object.values(library.page_modes)) assert.ok(library.vocabulary.surface_mode.includes(mode))
  for (const page of library.vocabulary.page_type) assert.ok(library.page_modes[page], `page mode for ${page}`)
  for (const id of library.default_order) assert.ok(ids.has(id))
  assert.equal(Object.values(library.weights).reduce((a, b) => a + b, 0), 100)
})

for (const scenario of scenarios) {
  test(`${scenario.id}: ${scenario.prompt}`, () => {
    const r = decide(scenario.context, library)
    const e = scenario.expected
    const primary = r.direction.primary, secondary = r.direction.secondary[0] || null
    if (e.mode) assert.equal(r.design_decision.mode, e.mode)
    if ('ask' in e) assert.equal(r.clarification.required, e.ask, r.clarification.reason || 'no question')
    if (e.primary) assert.ok(e.primary.includes(primary), `primary ${primary}`)
    for (const id of e.primary_not || []) assert.notEqual(primary, id)
    if (e.secondary_in) assert.ok(e.secondary_in.includes(secondary), `secondary ${secondary}`)
    if (r.clarification.required && r.direction.primary) assert.match(r.clarification.default_if_unanswered, new RegExp(`\\(${r.direction.primary}\\)$`), 'the default answer is the chosen primary')
    if (r.clarification.options.length) {
      const labels = r.clarification.options.map(o => o.label)
      assert.equal(new Set(labels).size, labels.length, 'one option per label')
      assert.ok(r.clarification.options.some(o => o.style === primary), 'the leader is an option')
    }
    for (const id of e.secondary_not || []) assert.notEqual(secondary, id)
    for (const id of e.options_include || []) assert.ok(r.clarification.options.some(o => o.style === id), `option ${id}`)
    for (const d of e.unknown_include || []) assert.ok(r.unknown.includes(d), `unknown ${d}`)
    if (e.assumption_matches) assert.ok(r.assumptions.some(a => a.description.includes(e.assumption_matches)), JSON.stringify(r.assumptions))
    if (e.confidence) assert.equal(r.design_decision.confidence, e.confidence)
    if (e.confidence_in) assert.ok(e.confidence_in.includes(r.design_decision.confidence))
    for (const name of e.functional_present || []) assert.ok(r.direction.functional[name], `functional ${name}`)
    for (const [name, allowed] of Object.entries(e.functional || {})) assert.ok(allowed.includes(r.direction.functional[name]), `${name}: ${r.direction.functional[name]}`)
    if (e.ambition) assert.equal(r.direction.ambition, e.ambition)
    if (e.ambition_not) assert.notEqual(r.direction.ambition, e.ambition_not)
    for (const id of e.excluded_include || []) assert.ok(r.excluded.some(x => x.id === id), `excluded ${id}`)
    if (e.validation_warning) assert.ok(r.validation.checks.some(c => c.check === e.validation_warning && c.status === 'warning'))
    if (e.rationale_matches) assert.ok(r.rationale.some(line => line.includes(e.rationale_matches)))
    if (e.color_mode) assert.equal(r.direction.color_posture.mode, e.color_mode)
    if (e.motion_level) assert.equal(r.direction.motion.level, e.motion_level)
    if (e.question_matches) assert.match(r.clarification.question, new RegExp(e.question_matches))

    // Invariants for every scenario.
    assert.ok(r.direction.secondary.length <= 1, 'at most one secondary')
    assert.notEqual(r.validation.status, 'fail', JSON.stringify(r.validation))
    const distinct = new Set([primary, secondary, ...Object.values(r.direction.functional)].filter(Boolean))
    assert.ok(distinct.size <= 3, `too many styles: ${[...distinct]}`)
    for (const id of Object.values(r.direction.functional)) {
      const f = library.styles.find(s => s.id === id)
      for (const other of [primary, secondary].filter(Boolean)) assert.ok(id === other || !f.clashes_with.includes(other), `functional ${id} clashes with ${other}`)
    }
    if (secondary) {
      const p = library.styles.find(s => s.id === primary)
      assert.ok(p.pairs_with.includes(secondary) && !p.clashes_with.includes(secondary), 'secondary must be a listed pairing')
    }
    if (scenario.context.delegated || scenario.context.interactive === false || scenario.context.explicit_style || scenario.context.brand?.governing) {
      assert.equal(r.clarification.required, false, 'never ask when delegated, non-interactive, explicit or brand-governed')
    }
    if (r.clarification.required) assert.ok(r.clarification.default_if_unanswered, 'a question carries a recommended default')
    if (!r.clarification.required && r.unknown.some(d => ['audience', 'personality', 'positioning'].includes(d)) && !scenario.context.explicit_style && !scenario.context.brand?.governing) {
      assert.ok(r.assumptions.length, 'unknown context is disclosed as assumptions')
    }
    assert.deepEqual(decide(scenario.context, library), r, 'deterministic')
  })
}

test('explicit style is never replaced by ranking, even when it ranks low', () => {
  const r = decide({ explicit_style: 'Retro Modern', product_type: 'saas', page_type: 'dashboard', density: 'high', content: 'data' }, library)
  assert.equal(r.direction.primary, 'retro-modern')
  assert.notEqual(r.candidates[0].id, 'retro-modern')
})

test('the library is extensible without code changes', () => {
  const extended = structuredClone(library)
  extended.styles.push({ ...structuredClone(library.styles.find(s => s.id === 'warm-humanist')), id: 'soft-clay', name: 'Soft Clay', aliases: ['soft clay'],
    label: 'soft and tactile', fit: { ...structuredClone(library.styles.find(s => s.id === 'warm-humanist').fit), category: { strong: ['home-living'] }, product_type: { strong: ['ecommerce'] } } })
  const r = decide({ explicit_style: 'soft clay', product_type: 'ecommerce' }, extended)
  assert.equal(r.direction.primary, 'soft-clay')
})

test('platform changes adaptation notes, not the visual identity', () => {
  const base = { explicit_style: 'Editorial Luxury', category: 'fashion', page_type: 'landing' }
  const web = decide({ ...base, platform: 'web' }, library), mobile = decide({ ...base, platform: 'ios' }, library)
  assert.equal(web.direction.primary, mobile.direction.primary)
  assert.deepEqual(web.treatments.typography, mobile.treatments.typography)
  assert.ok(web.adaptation.web && mobile.adaptation.mobile)
})

test('CLI reads stdin, prints the vocabulary and fails clearly on bad input', () => {
  const cli = 'skills/uiux-orchestrator/scripts/direction.mjs'
  const ok = spawnSync(process.execPath, [cli], { input: JSON.stringify(scenarios[0].context), encoding: 'utf8' })
  assert.equal(ok.status, 0, ok.stderr)
  assert.equal(JSON.parse(ok.stdout).clarification.required, true)
  const vocab = spawnSync(process.execPath, [cli, '--vocabulary'], { encoding: 'utf8' })
  assert.ok(JSON.parse(vocab.stdout).styles.includes('organic-tactile'))
  const bad = spawnSync(process.execPath, [cli, '--context', '{broken'], { encoding: 'utf8' })
  assert.notEqual(bad.status, 0)
  assert.match(bad.stderr, /direction:/)
  const warn = JSON.parse(spawnSync(process.execPath, [cli, '--context', '{"category":"fintech"}'], { encoding: 'utf8' }).stdout)
  assert.ok(warn.warnings.some(w => w.includes('fintech')))
})

test('a clear audience and personality without a product decide without asking', () => {
  const r = decide({ audience: 'children', personality: 'playful', page_type: 'app-home' }, library)
  assert.equal(r.design_decision.mode, 'inferred')
  assert.equal(r.clarification.required, false)
  assert.equal(r.direction.primary, 'playful-illustrated')
})

test('values marked unknown are not scored and bad sources are reported', () => {
  const unknown = decide({ product_type: 'saas', page_type: 'dashboard', audience: { value: 'children', source: 'unknown' } }, library)
  assert.ok(unknown.unknown.includes('audience'))
  assert.ok(!unknown.excluded.some(x => x.id === 'instrument'), 'an unknown audience must not exclude styles')
  const bad = decide({ product_type: { value: 'saas', source: 'guess' } }, library)
  assert.ok(bad.warnings.some(w => w.includes('source "guess"')))
  assert.throws(() => decide([], library), /JSON object/)
  assert.throws(() => decide(null, library), /JSON object/)
})

test('explicit motion and ambition levels apply without leaking into treatments', () => {
  const r = decide({ product_type: 'saas', page_type: 'landing', explicit_visual: { motion: 'expressive', ambition: 'quiet', typography: 'a serif display' } }, library)
  assert.equal(r.direction.motion.level, 'expressive')
  assert.equal(r.direction.ambition, 'quiet')
  assert.equal(r.treatments.ambition, undefined)
  assert.notEqual(r.treatments.motion.from, 'user')
  assert.deepEqual(r.treatments.typography, { value: 'a serif display', from: 'user' })
  const text = decide({ product_type: 'saas', explicit_visual: { motion: 'slow parallax', ambition: 'huge' } }, library)
  assert.equal(text.treatments.motion.from, 'user')
  assert.equal(text.warnings.length, 2)
})

test('generic adjectives are not style aliases', () => {
  for (const word of ['dark', 'colorful', 'minimal', 'playful', 'warm', 'natural']) {
    assert.equal(decide({ explicit_style: word, product_type: 'saas' }, library).direction.primary, `custom:${word}`, word)
  }
  assert.equal(decide({ explicit_style: 'brutalist' }, library).direction.primary, 'neo-brutalist')
})

test('functional surfaces never exceed three styles or clash with the secondary', () => {
  const surfaces = ['marketing-campaign', 'dashboard', 'settings', 'onboarding', 'product-listing', 'analytics', 'checkout']
    .flatMap(page => ['low', 'high', undefined].map(density => ({ page_type: page, density })))
  for (const style of library.styles) {
    const r = decide({ explicit_style: style.id, product_type: 'saas', personality: 'professional', page_type: 'homepage', surfaces }, library)
    const ids = new Set([r.direction.primary, ...r.direction.secondary, ...Object.values(r.direction.functional)])
    assert.ok(ids.size <= 3, `${style.id}: ${[...ids]}`)
    assert.notEqual(r.validation.status, 'fail', `${style.id}: ${JSON.stringify(r.validation.checks)}`)
  }
})

test('malformed fields are reported, not crashed on or misread', () => {
  for (const surfaces of [{ page_type: 'checkout' }, 'checkout', [null], [42]]) {
    const r = decide({ product_type: 'saas', surfaces }, library)
    assert.deepEqual(r.direction.functional, {})
    assert.ok(r.warnings.some(w => w.includes('surfaces')))
  }
  const visual = decide({ product_type: 'saas', explicit_visual: 'dark' }, library)
  assert.deepEqual(Object.keys(visual.treatments).filter(k => /^\d+$/.test(k)), [])
  assert.ok(visual.warnings.some(w => w.includes('explicit_visual')))
  const style = decide({ product_type: 'saas', explicit_style: { name: 'x' } }, library)
  assert.notEqual(style.design_decision.mode, 'explicit')
  assert.ok(style.warnings.some(w => w.includes('explicit_style')))
  const typo = decide({ product_type: 'saas', goal: 'conversion' }, library)
  assert.ok(typo.warnings.some(w => w.includes('"goal"')))
  const surfaces = decide({ product_type: 'saas', page_type: 'homepage', surfaces: [{ page_type: 'cart' }, { name: 'a', page_type: 'settings' }, { name: 'a', surface_mode: 'Operate' }] }, library)
  assert.deepEqual(Object.keys(surfaces.direction.functional), ['cart', 'a', 'a (3)'])
  assert.ok(surfaces.warnings.some(w => w.includes('"cart"')))
})

test('a style added without aliases still works', () => {
  const extended = structuredClone(library)
  const base = structuredClone(library.styles.find(s => s.id === 'modern-minimal'))
  delete base.aliases
  extended.styles.push({ ...base, id: 'quiet-paper', name: 'Quiet Paper', pairs_with: [], clashes_with: [] })
  assert.equal(decide({ explicit_style: 'Quiet Paper', product_type: 'saas' }, extended).direction.primary, 'quiet-paper')
  assert.equal(decide({ explicit_style: 'quiet-paper' }, extended).direction.primary, 'quiet-paper')
})

test('questions stay rare outside brand-expressive gaps', () => {
  let asked = 0, total = 0
  for (const product_type of library.vocabulary.product_type) for (const category of library.vocabulary.category) {
    total++
    const base = { product_type, category, page_type: 'landing' }
    if (decide(base, library).clarification.required) asked++
    for (const variant of [{ delegated: true }, { interactive: false }, { personality: 'calm', audience: 'adults' }, { page_type: 'dashboard' }]) {
      assert.equal(decide({ ...base, ...variant }, library).clarification.required, false, JSON.stringify({ ...base, ...variant }))
    }
  }
  // Landing pages with unknown audience and personality are the case the question exists for;
  // the threshold guards against the engine asking for every one of them.
  assert.ok(asked < total, `${asked}/${total}`)
})

test('CLI works when the skill is reached through a symlink', async () => {
  const { mkdtempSync, symlinkSync, rmSync } = await import('node:fs')
  const { tmpdir } = await import('node:os')
  const { join, resolve } = await import('node:path')
  const dir = mkdtempSync(join(tmpdir(), 'uiux-link-'))
  try {
    symlinkSync(resolve('skills/uiux-orchestrator'), join(dir, 'skill'))
    const out = spawnSync(process.execPath, [join(dir, 'skill/scripts/direction.mjs'), '--vocabulary'], { encoding: 'utf8' })
    assert.equal(out.status, 0, out.stderr)
    assert.ok(JSON.parse(out.stdout).styles.length >= 13)
  } finally { rmSync(dir, { recursive: true, force: true }) }
})

test('brand accepts the documented and the value/source shapes, and warns otherwise', () => {
  for (const brand of [{ governing: true }, true, { value: true, source: 'explicit' }]) {
    assert.equal(decide({ product_type: 'saas', brand }, library).design_decision.mode, 'brand', JSON.stringify(brand))
  }
  const odd = decide({ product_type: 'saas', brand: 'yes please' }, library)
  assert.notEqual(odd.design_decision.mode, 'brand')
  assert.ok(odd.warnings.some(w => w.includes('brand must be')))
  assert.equal(decide({ product_type: 'saas', brand: { governing: false } }, library).warnings.length, 0)
})
