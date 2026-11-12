#!/usr/bin/env node
// direction — deterministic design-direction decision for core/direction.md. Ranks the Style
// Library (registry/styles.json) against a design context record, decides whether one
// clarification question is needed, composes primary / secondary / functional directions and
// validates compatibility. Zero dependencies (Node 18+). The agent does the semantic part
// (prompt → context values from the library vocabulary); this script does the scoring.
//
// Usage:
//   node <skill-dir>/scripts/direction.mjs --context '<json>'
//   echo '<json>' | node <skill-dir>/scripts/direction.mjs
//   node <skill-dir>/scripts/direction.mjs --context context.json --library styles.json
//
// Options:
//   --context <json|file>   design context record (default: read stdin)
//   --library <file>        style library (default: ../registry/styles.json)
//   --vocabulary            print the vocabulary the context values must use, then exit
//   --help                  print this text
//
// Output: the design direction record as JSON (mode, confidence, context with sources,
// assumptions, ranked candidates, direction layers, treatments, constraints, clarification,
// validation). Scores are relative suitability for this context, not design quality.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const DIMENSIONS = ['product_type', 'category', 'page_type', 'surface_mode', 'business_goal', 'audience',
  'personality', 'positioning', 'content', 'platform', 'density']

export function loadLibrary(file = path.join(here, '..', 'registry', 'styles.json')) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

const norm = text => String(text).trim().toLowerCase().replace(/[\s_]+/g, '-')
const round = n => Math.round(n * 10) / 10

const SOURCES = ['explicit', 'inferred', 'default', 'unknown']
const MOTION_LEVELS = ['static', 'quiet', 'expressive']
const AMBITIONS = ['bold', 'confident', 'quiet']

// Accepts "value", ["a","b"] (explicit) or { value, source, confidence }. source "unknown"
// means the value is not known, so it is never scored.
function normalizeDimension(raw, name = 'dimension', warnings = []) {
  if (raw === undefined || raw === null || raw === '') return { value: [], source: 'unknown' }
  const entry = typeof raw === 'object' && !Array.isArray(raw) ? raw : { value: raw, source: 'explicit' }
  let source = entry.source || 'explicit'
  if (!SOURCES.includes(source)) { warnings.push(`${name} source "${source}" is not one of ${SOURCES.join(', ')}; treated as inferred.`); source = 'inferred' }
  const value = source === 'unknown' ? [] : (Array.isArray(entry.value) ? entry.value : entry.value == null ? [] : [entry.value]).map(norm).filter(Boolean)
  return { value, source: value.length ? source : 'unknown', ...(entry.confidence ? { confidence: entry.confidence } : {}) }
}

function findStyle(library, name) {
  if (!name) return null
  const key = norm(name)
  return library.styles.find(s => s.id === key || norm(s.name || '') === key || (s.aliases || []).some(a => norm(a) === key)) || null
}

function level(style, dimension, value, library) {
  const fit = style.fit[dimension] || {}
  if (fit.strong?.includes(value)) return { m: library.levels.strong, tag: 'strong' }
  if (fit.ok?.includes(value)) return { m: library.levels.ok, tag: 'ok' }
  if (fit.conflict?.includes(value)) return { m: library.levels.conflict, tag: 'conflict' }
  return { m: library.levels.neutral, tag: 'neutral' }
}

function scoreStyle(style, ctx, library) {
  const known = {}, strengths = [], conflicts = []
  let total = 0, knownWeight = 0
  for (const [group, dims] of Object.entries(library.groups)) {
    const parts = dims.filter(d => ctx[d].value.length).map(d => {
      const levels = ctx[d].value.map(v => ({ v, ...level(style, d, v, library) }))
      for (const l of levels) {
        if (l.tag === 'strong') strengths.push(`${d}: ${l.v}`)
        if (l.tag === 'conflict') conflicts.push(`${d}: ${l.v}`)
      }
      return levels.reduce((sum, l) => sum + l.m, 0) / levels.length
    })
    if (!parts.length) continue
    const m = parts.reduce((a, b) => a + b, 0) / parts.length
    known[group] = m
    total += library.weights[group] * m
    knownWeight += library.weights[group]
  }
  const excluded = (style.exclude_when || []).filter(rule => ctx[rule.dimension]?.value.some(v => rule.values.includes(v)))
    .map(rule => `${rule.dimension}: ${ctx[rule.dimension].value.filter(v => rule.values.includes(v)).join(', ')}`)
  return { id: style.id, style, raw: total, knownWeight, score: knownWeight ? round((total / knownWeight) * 100) : 0,
    groups: known, strengths, conflicts, excluded }
}

// A secondary must be listed by the primary itself; functional-neutral styles adopt any primary's tokens.
const pairsWith = (primary, other) => primary.pairs_with.includes(other.id)
const clashes = (a, b) => a.clashes_with.includes(b.id) || b.clashes_with.includes(a.id)
const fitTag = (style, dimension, value) => style.fit[dimension]?.strong?.includes(value) ? 'strong'
  : style.fit[dimension]?.ok?.includes(value) ? 'ok' : style.fit[dimension]?.conflict?.includes(value) ? 'conflict' : 'neutral'
const KNOWN_KEYS = new Set([...DIMENSIONS, 'surfaces', 'explicit_style', 'explicit_visual', 'brand', 'delegated', 'interactive', 'request'])

function readSurfaces(raw, library, warnings) {
  if (raw === undefined || raw === null) return []
  if (!Array.isArray(raw)) { warnings.push('surfaces must be an array of { name, page_type, surface_mode?, density? }; ignored.'); return [] }
  const names = new Set(), out = []
  raw.forEach((entry, i) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) { warnings.push(`surfaces[${i}] is not an object; ignored.`); return }
    const pageType = entry.page_type ? norm(entry.page_type) : null
    const mode = entry.surface_mode ? norm(entry.surface_mode) : pageType ? library.page_modes[pageType] : null
    if (pageType && !library.page_modes[pageType]) warnings.push(`surfaces[${i}] page_type "${pageType}" is not in the vocabulary; map it to the closest page type.`)
    if (entry.surface_mode && !library.vocabulary.surface_mode.includes(mode)) warnings.push(`surfaces[${i}] surface_mode "${entry.surface_mode}" is not in the vocabulary.`)
    let name = String(entry.name || pageType || `surface ${i + 1}`)
    if (names.has(name)) name = `${name} (${i + 1})`
    names.add(name)
    out.push({ name, pageType, mode: library.vocabulary.surface_mode.includes(mode) ? mode : null, density: entry.density ? norm(entry.density) : null })
  })
  return out
}

export function decide(input, library = loadLibrary()) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('context must be a JSON object')
  const ctx = {}, warnings = []
  const t = library.thresholds
  const labelOf = style => style.label || style.name || style.id
  const nameOf = style => style.name || style.id
  for (const key of Object.keys(input)) if (!KNOWN_KEYS.has(key)) warnings.push(`Unknown context field "${key}" ignored.`)
  for (const d of DIMENSIONS) ctx[d] = normalizeDimension(input[d], d, warnings)
  let visual = input.explicit_visual || {}
  if (typeof visual !== 'object' || Array.isArray(visual)) { warnings.push('explicit_visual must be an object such as { "color": "...", "motion": "quiet" }; ignored.'); visual = {} }
  if (visual.motion && !MOTION_LEVELS.includes(visual.motion)) warnings.push(`explicit_visual.motion "${visual.motion}" is kept as a motion treatment; use ${MOTION_LEVELS.join(', ')} to set the level.`)
  if (visual.ambition && !AMBITIONS.includes(visual.ambition)) warnings.push(`explicit_visual.ambition "${visual.ambition}" ignored; use ${AMBITIONS.join(', ')}.`)
  for (const d of DIMENSIONS) {
    const vocab = library.vocabulary[d]
    for (const v of ctx[d].value) if (vocab && !vocab.includes(v)) warnings.push(`${d} "${v}" is not in the library vocabulary; scored as neutral. Map it to the closest term.`)
  }
  if (!ctx.surface_mode.value.length && ctx.page_type.value.length) {
    const modes = [...new Set(ctx.page_type.value.map(p => library.page_modes[p]).filter(Boolean))]
    if (modes.length) ctx.surface_mode = { value: modes, source: ctx.page_type.source === 'explicit' ? 'inferred' : ctx.page_type.source }
  }
  const surfaces = readSurfaces(input.surfaces, library, warnings)
  const delegated = Boolean(input.delegated)
  const interactive = input.interactive !== false
  const brand = Boolean(input.brand?.governing)
  let explicitName = input.explicit_style ?? null
  if (explicitName !== null && typeof explicitName !== 'string') { warnings.push('explicit_style must be a style name string; ignored.'); explicitName = null }
  if (explicitName !== null && !explicitName.trim()) explicitName = null
  const explicit = findStyle(library, explicitName)
  const deferred = explicitName && !explicit ? library.deferred.find(d => d.id === norm(explicitName) || norm(d.name) === norm(explicitName)) : null

  const ranked = library.styles.map(s => scoreStyle(s, ctx, library))
  const order = id => {
    const i = library.default_order.indexOf(id)
    return i === -1 ? library.default_order.length + library.styles.findIndex(s => s.id === id) : i
  }
  ranked.sort((a, b) => b.score - a.score || order(a.id) - order(b.id))
  const eligible = ranked.filter(r => !r.excluded.length)
  const totalWeight = Object.values(library.weights).reduce((a, b) => a + b, 0)
  const knownWeight = ranked[0]?.knownWeight || 0
  const coverage = round((knownWeight / totalWeight) * 100) / 100
  const productKnown = ctx.product_type.value.length || ctx.category.value.length
  const enough = coverage >= t.min_coverage
  const mode = explicitName ? 'explicit' : brand ? 'brand' : enough ? 'inferred' : 'default'
  const leader = explicit ? ranked.find(r => r.id === explicit.id) : eligible[0]
  const groupKnown = g => library.groups[g].some(d => ctx[d].value.length)

  // Clarification: ask only when unknown decisive dimensions could flip the primary to a style
  // of another family that is already a close, product-relevant contender, on surfaces where
  // brand expression drives the direction, and only when asking is allowed at all.
  const unknownDecisive = library.decisive_groups.filter(g => !groupKnown(g))
  const unknownWeight = unknownDecisive.reduce((sum, g) => sum + library.weights[g], 0)
  const expressive = !ctx.surface_mode.value.length || ctx.surface_mode.value.some(m => t.clarify_modes.includes(m))
  // A contender must be relevant to what is known about the product: an ok or strong fit for the
  // category when it is known, else for the product type.
  const relevantDim = ctx.category.value.length ? 'category' : ctx.product_type.value.length ? 'product_type' : null
  const relevant = r => !relevantDim || ctx[relevantDim].value.some(v => ['strong', 'ok'].includes(fitTag(r.style, relevantDim, v)))
  let divergent = []
  if (leader && unknownWeight && expressive) {
    const expected = leader.raw + library.levels.neutral * unknownWeight
    divergent = eligible.filter(r => r.id !== leader.id && r.style.family !== leader.style.family && relevant(r)
        && r.score >= leader.score - t.ask_gap && r.raw + unknownWeight > expected + t.flip_margin)
      .sort((a, b) => b.score - a.score || order(a.id) - order(b.id))
  }
  const mayAsk = interactive && !delegated && !explicitName && !brand
  let clarification = { required: false, question: null, options: [], default_if_unanswered: null, reason: null }
  if (mayAsk && !productKnown && !enough && unknownDecisive.length) {
    clarification = { required: true, question: 'What is the product, and who is it for?', options: [],
      default_if_unanswered: leader ? `${labelOf(leader.style)} (${leader.id})` : null,
      reason: 'The product and the brand character are unknown, so no direction can be inferred.' }
  } else if (mayAsk && divergent.length) {
    // Options: the leader, the contenders that could take over, then the closest remaining
    // candidates; one option per label, ordered by current score.
    const picks = [leader]
    const add = r => { if (picks.length < t.max_options && !picks.some(p => p === r || labelOf(p.style) === labelOf(r.style))) picks.push(r) }
    divergent.forEach(add)
    eligible.filter(r => relevant(r) && r.score >= leader.score - t.ask_gap).forEach(add)
    const options = picks.sort((a, b) => b.score - a.score || order(a.id) - order(b.id))
    const category = ctx.category.value[0]
    const subject = category ? `${library.category_labels?.[category] || category.replace(/-/g, ' ')} brand` : 'product'
    const list = options.map(o => labelOf(o.style))
    clarification = { required: true,
      question: `What kind of ${subject} is this: ${list.slice(0, -1).join(', ')} or ${list.at(-1)}?`,
      options: options.map(o => ({ style: o.id, label: labelOf(o.style) })),
      default_if_unanswered: `${labelOf(leader.style)} (${leader.id})`,
      reason: `Unknown ${unknownDecisive.map(g => library.group_labels?.[g] || g).join(' and ')} could change the primary direction to ${divergent.map(d => d.id).join(', ')}.` }
  }

  const assumptions = []
  for (const d of DIMENSIONS) {
    if (['inferred', 'default'].includes(ctx[d].source)) assumptions.push({ description: `${d.replace(/_/g, ' ')} ${ctx[d].source}: ${ctx[d].value.join(', ')}`, confidence: ctx[d].confidence || 'medium' })
  }
  if (leader && unknownDecisive.length && !clarification.required && !explicitName && !brand) {
    assumptions.push({ description: `Unknown ${unknownDecisive.map(g => library.group_labels?.[g] || g).join(' and ')}; assumed a ${labelOf(leader.style)} direction (${leader.id}).` +
      (divergent.length ? ` Alternatives: ${divergent.slice(0, 3).map(d => `${labelOf(d.style)} (${d.id})`).join('; ')}.` : ''), confidence: 'low' })
  }
  if (mode === 'default') assumptions.push({ description: 'Too little product context to infer a direction; using the best fit for the known surface and platform, ties broken by the library default order.', confidence: 'low' })

  // Composition.
  const rationale = [], validation = []
  let primary = leader || null, secondary = null
  if (explicitName && !explicit) {
    primary = null
    rationale.push(deferred ? `"${explicitName}" was requested explicitly. It is deferred in the library (${deferred.reason}) and is honored as a custom direction.`
      : `"${explicitName}" was requested explicitly and is not in the library; honored as a custom direction described by the user.`)
  }
  if (primary) {
    const why = primary.strengths.slice(0, 4).join('; ')
    rationale.push(explicit ? `${nameOf(primary.style)} was requested explicitly; internal ranking does not replace it.`
      : brand ? `${nameOf(primary.style)} is the closest library match to the governing brand; brand identity, tokens and components still win.`
      : `${nameOf(primary.style)} fits best (${primary.score}/100 on the known dimensions${why ? `; strong on ${why}` : ''}).`)
    if (explicit) {
      if (primary.excluded.length) validation.push({ check: 'explicit-style-fit', status: 'warning', note: `${nameOf(primary.style)} is normally excluded for ${primary.excluded.join('; ')}. Kept because the user asked for it; adapt treatments.` })
      if (primary.conflicts.length) validation.push({ check: 'explicit-style-fit', status: 'warning', note: `${nameOf(primary.style)} conflicts with ${primary.conflicts.join('; ')}. Kept; mitigate in treatments.` })
    }
    // A secondary needs known brand character (otherwise it is speculation), a listed pairing,
    // no clash and no fit conflict with the known context.
    const characterKnown = (t.secondary_requires || []).every(groupKnown)
    if (characterKnown) {
      const pool = eligible.filter(r => r.id !== primary.id && r.style.as_secondary !== false && pairsWith(primary.style, r.style)
        && !clashes(r.style, primary.style) && !r.conflicts.length
        && r.score >= t.secondary_min && (explicit || r.score >= primary.score - t.secondary_gap))
      secondary = pool[0] || null
      if (secondary) rationale.push(`${nameOf(secondary.style)} complements it (${secondary.score}/100; listed as a compatible pairing).`)
    } else rationale.push('No secondary direction: brand personality is unknown, so a second style would be speculative.')
    const runnersUp = eligible.filter(r => r !== primary && r !== secondary).slice(0, 2)
    for (const r of runnersUp) rationale.push(`${nameOf(r.style)} (${r.score}) not chosen: ${clashes(r.style, primary.style) ? 'clashes with the primary' : r.conflicts.length ? `conflicts with ${r.conflicts.slice(0, 2).join('; ')}` : 'lower overall fit'}.`)
    for (const r of ranked.filter(r => r.excluded.length && r !== primary).slice(0, 3)) rationale.push(`${nameOf(r.style)} excluded for ${r.excluded.join('; ')}.`)
  }

  // Functional directions per extra surface. A style "fits" a surface when its surface-mode fit is
  // strong or ok and its density fit is not a conflict; "fits well" when the mode is strong and the
  // density (if given) is strong. Order: primary that fits well; a functional-neutral helper for
  // Operate surfaces or densities the primary does not fit well (Native Clean before Instrument
  // by default order); an already chosen style that fits (best fit first); a new compatible style
  // that fits well; else the primary. New styles are added only while the total stays ≤ max_styles.
  const functional = {}
  const chosen = () => [primary, secondary, ...Object.values(functional).map(id => ranked.find(r => r.id === id))].filter(Boolean)
  const distinctCount = () => new Set(chosen().map(r => r.id)).size
  const safeWith = s => [primary, secondary].filter(Boolean).every(c => c.id === s.id || !clashes(s, c.style))
  for (const surface of primary ? surfaces : []) {
    if (!surface.mode) { functional[surface.name] = primary.id; continue }
    const modeTag = s => fitTag(s, 'surface_mode', surface.mode)
    const densityTag = s => surface.density ? fitTag(s, 'density', surface.density) : 'strong'
    const fits = s => ['strong', 'ok'].includes(modeTag(s)) && densityTag(s) !== 'conflict'
    const fitsWell = s => modeTag(s) === 'strong' && densityTag(s) === 'strong'
    const quality = s => (modeTag(s) === 'strong' ? 2 : 1) + (densityTag(s) === 'strong' ? 1 : 0)
    const canAdd = s => chosen().some(r => r.id === s.id) || distinctCount() < t.max_styles
    const candidates = library.styles.filter(s => s.id !== primary.id && safeWith(s) && fitsWell(s)
      && !scoreStyle(s, ctx, library).excluded.length && canAdd(s))
    const neutralHelper = candidates.filter(s => s.functional_neutral).sort((a, b) => order(a.id) - order(b.id))[0]
    const reuse = chosen().map(r => r.style).filter((s, i, all) => all.indexOf(s) === i && fits(s)).sort((a, b) => quality(b) - quality(a))[0]
    const compatible = candidates.filter(s => pairsWith(primary.style, s)).map(s => ranked.find(r => r.id === s.id))
      .filter(r => r && r.score >= t.functional_min).sort((a, b) => b.score - a.score || order(a.id) - order(b.id))[0]?.style
    let pick
    if (fitsWell(primary.style)) pick = primary.style
    else if ((surface.mode === 'operate' || densityTag(primary.style) !== 'strong') && neutralHelper) pick = neutralHelper
    else pick = reuse || compatible || primary.style
    functional[surface.name] = pick.id
  }

  const distinct = new Set([primary?.id, secondary?.id, ...Object.values(functional)].filter(Boolean))
  validation.push({ check: 'style-count', status: distinct.size <= t.max_styles ? 'pass' : 'fail', note: `${distinct.size} distinct styles (limit ${t.max_styles}).` })
  if (secondary) validation.push({ check: 'compatibility', status: clashes(secondary.style, primary.style) ? 'fail' : 'pass', note: `${primary.id} + ${secondary.id}` })
  for (const [name, id] of Object.entries(functional)) {
    if (id === primary?.id || id === secondary?.id) continue
    const s = library.styles.find(x => x.id === id)
    validation.push({ check: 'functional-compatibility', status: safeWith(s) ? 'pass' : 'fail',
      note: `${name}: ${id} inherits ${primary.id} color and type tokens; changes density, layout and components only.` })
  }

  // Treatments: identity (typography, color) always from the primary; the secondary may lend
  // layout, surface and imagery. Explicit user visual preferences override both.
  const treatments = {}
  if (primary) {
    for (const [field, value] of Object.entries(primary.style.treatments)) treatments[field] = { value, from: primary.id }
    if (secondary) for (const field of ['layout', 'surface', 'imagery']) treatments[field] = { value: `${treatments[field].value}; with ${secondary.style.treatments[field]}`, from: `${primary.id} + ${secondary.id}` }
  }
  for (const [field, value] of Object.entries(visual)) {
    if (!value || field === 'ambition' || (field === 'motion' && MOTION_LEVELS.includes(value))) continue
    treatments[field] = { value, from: 'user' }
  }

  const operateDense = ctx.surface_mode.value.includes('operate') && ctx.density.value.includes('high')
  const ambition = (AMBITIONS.includes(visual.ambition) && visual.ambition) || (operateDense ? 'quiet' : brand && primary?.style.ambition === 'bold' ? 'confident' : primary?.style.ambition || 'confident')
  const colorPosture = visual.color ? { mode: 'user', rule: visual.color }
    : brand ? { mode: 'brand', rule: 'governing brand colors and tokens' }
    : primary ? primary.style.color_posture : explicitName ? { mode: 'user', rule: `as described for ${explicitName}` } : { mode: 'monochrome', archetypes: [] }
  const base = primary ? primary.style.motion : { level: 'quiet', character: 'per motion-principles §0' }
  const motion = visual.motion === 'static' ? { level: 'static', character: 'requested by the user' }
    : MOTION_LEVELS.includes(visual.motion) ? { level: visual.motion, character: `${visual.motion}, requested by the user; ${base.character}` } : base

  const constraints = ['accessibility floors (core/conflict-resolution.md rung 2)', 'usability over decoration',
    'responsive / adaptive layout', 'platform conventions', 'no AI-generated color or motion signatures unless the user or brand requires them']
  if (brand) constraints.push('governing brand identity, tokens and components win over style treatments')
  for (const s of [primary, secondary].filter(Boolean)) for (const a of s.style.accessibility || []) constraints.push(`${s.id}: ${a}`)

  const margin = eligible[1] && leader ? round(leader.score - eligible[1].score) : 100
  const confidence = explicitName ? 'high' : mode === 'default' || clarification.required ? 'low'
    : coverage >= t.high_confidence_coverage && margin >= t.high_confidence_margin && !unknownDecisive.length ? 'high'
    : coverage >= t.medium_confidence_coverage ? 'medium' : 'low'

  const families = library.platform_families || {}
  const platformFamily = Object.keys(families).find(f => ctx.platform.value.some(p => families[f].includes(p))) || null
  const notes = primary?.style.platform_notes || {}
  return {
    design_decision: { mode, confidence, coverage, delegated, interactive },
    context: Object.fromEntries(DIMENSIONS.map(d => [d, { value: ctx[d].value.length ? ctx[d].value : 'unknown', source: ctx[d].source }])),
    unknown: DIMENSIONS.filter(d => !ctx[d].value.length),
    assumptions,
    candidates: eligible.slice(0, 5).map(r => ({ id: r.id, score: r.score, strengths: r.strengths.slice(0, 4), conflicts: r.conflicts })),
    excluded: ranked.filter(r => r.excluded.length).map(r => ({ id: r.id, reason: r.excluded })),
    direction: { primary: primary?.id || (explicitName ? `custom:${norm(explicitName)}` : null), secondary: secondary ? [secondary.id] : [],
      functional, ambition, color_posture: colorPosture, motion },
    treatments,
    adaptation: platformFamily && notes[platformFamily] ? { [platformFamily]: notes[platformFamily] } : notes,
    rationale,
    constraints,
    clarification,
    validation: { status: validation.some(v => v.status === 'fail') ? 'fail' : validation.some(v => v.status === 'warning') ? 'warnings' : 'pass', checks: validation },
    warnings,
  }
}

function readContext(arg) {
  if (!arg) return JSON.parse(fs.readFileSync(0, 'utf8'))
  return JSON.parse(arg.trim().startsWith('{') ? arg : fs.readFileSync(arg, 'utf8'))
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2)
  const value = flag => { const i = argv.indexOf(flag); return i === -1 ? undefined : argv[i + 1] }
  try {
    if (argv.includes('--help')) {
      console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1).filter(l => l.startsWith('//')).map(l => l.slice(3)).join('\n'))
    } else {
      const library = loadLibrary(value('--library'))
      if (argv.includes('--vocabulary')) console.log(JSON.stringify({ ...library.vocabulary, styles: library.styles.map(s => s.id), deferred: library.deferred.map(d => d.id) }, null, 2))
      else console.log(JSON.stringify(decide(readContext(value('--context')), library), null, 2))
    }
  } catch (error) {
    console.error(`direction: ${error.message}`)
    process.exitCode = 1
  }
}
