"""Check full-design execution records, not the truth of the reported execution.

Usage: python3 -I check-orchestration.py <record.json>
       python3 -I check-orchestration.py --stdin
Exit 0: structurally eligible (possibly limited); exit 1: incomplete/invalid.
"""
import argparse
import json
from pathlib import Path
import re
import sys

PHASES = ['inspect', 'foundation', 'concept', 'direction', 'system', 'components', 'motion',
          'implement', 'validate', 'review']
SLOTS = {'foundation': ['research-foundation', 'ux-analysis'],
         'concept': ['design-reasoning'], 'direction': ['visual-direction'],
         'system': ['design-system'], 'components': ['component-reference'],
         'motion': ['motion-build'], 'validate': ['visual-validation'],
         'review': ['ux-critique', 'tech-audit']}
INPUTS = {'inspect': [], 'foundation': ['inspect'], 'concept': ['foundation'],
          'direction': ['concept'], 'system': ['foundation', 'direction'],
          'components': ['system'], 'motion': ['system', 'components'],
          'implement': ['direction', 'system', 'components', 'motion'],
          'validate': ['implement'],
          'review': ['foundation', 'concept', 'direction', 'system', 'validate']}
VISUAL_DIMENSIONS = {'brief-fit', 'creative-advance', 'composition', 'typography',
                     'palette-and-materials', 'boldness', 'product-identity', 'distinctiveness',
                     'finish', 'component-contract', 'responsive-craft'}
MOTION_DIMENSION = 'motion-smoothness'
MOTION_REVIEW = 'motion-review'
RECORD_ONLY_SYSTEM = 'impeccable/document'
UX_OWNER, RESEARCH_TOOL = 'impeccable/shape', 'uupm/search'
TASTE = 'taste/design-taste-frontend'


def registry():
    """Read only routing fields from the bundled registry; no third-party YAML dependency."""
    text = (Path(__file__).resolve().parents[1] / 'registry/skills.yaml').read_text()
    entries = {}
    def field(block, shared, key):
        for source in [block, shared]:
            m = re.search(r'(?:^|[\s{,])' + key + r':\s*(\[[^\]]*\]|[^,}\n]+)', source, re.M)
            if m:
                value = m.group(1).strip()
                return [v.strip().strip('\"\'') for v in value[1:-1].split(',') if v.strip()] if value.startswith('[') else value
        return []
    for provider in re.split(r'\n  - provider:', text.split('\nreferences:')[0])[1:]:
        shared = provider.split('\n    shared:')[1].split('\n    skills:')[0] if '\n    shared:' in provider else ''
        if '\n    skills:' not in provider:
            continue
        for block in re.split(r'\n      - (?=\{?\s*id:)', provider.split('\n    skills:')[1])[1:]:
            m = re.match(r'\{?\s*id:\s*([a-z0-9]+/[a-z0-9-]+)', block)
            if m:
                entries[m.group(1)] = {key: field(block, shared, key) for key in ['names', 'platforms', 'slots', 'specialist_slots', 'owns', 'role', 'invocation']}
    return entries


def validate(data):
    errors, limits = [], []
    def require(condition, message):
        if not condition:
            errors.append(message)
    def text(value):
        return isinstance(value, str) and bool(value.strip())
    def evidence(value):
        return isinstance(value, list) and bool(value) and all(text(v) for v in value)
    def unique(items, key, label):
        require(isinstance(items, list), label + ' must be a list')
        out = {}
        for item in items:
            require(isinstance(item, dict) and text(item.get(key)), label + ' requires ' + key)
            name = item.get(key)
            require(name not in out, label + ' duplicate ' + str(name))
            out[name] = item
        return out

    def node_probe(probe):
        require(isinstance(probe, dict), 'routing runtime exclusion/selection requires a Node probe')
        if not isinstance(probe, dict):
            return None
        minimum = probe.get('minimum_major')
        require(probe.get('runtime') == 'node' and type(minimum) is int and minimum == 22,
                'routing runtime probe must check Taste\'s actual Node22 minimum, not invent a higher requirement')
        rows = probe.get('candidates')
        require(isinstance(rows, list), 'routing runtime probe requires observed candidates')
        if not isinstance(rows, list) or type(minimum) is not int:
            return None
        compatible = []
        for item in rows:
            require(isinstance(item, dict), 'invalid routing runtime candidate')
            if not isinstance(item, dict):
                continue
            match = re.fullmatch(r'v(\d+)\.\d+\.\d+(?:[-+][\w.-]+)?', str(item.get('version', '')))
            require(bool(match) and text(item.get('path')), 'routing runtime candidate needs path and version')
            if not match:
                continue
            major = int(match[1])
            require(type(item.get('major')) is int and item['major'] == major,
                    'routing runtime major contradicts its version')
            require(item.get('satisfies') is (major >= minimum), 'routing runtime compatibility contradicts version')
            if major >= minimum:
                compatible.append(item)
        available = bool(compatible)
        require(probe.get('available') is available, 'routing runtime availability contradicts observed candidates')
        require(probe.get('selected') in compatible if available else probe.get('selected') is None,
                'routing runtime selected binary contradicts observed candidates')
        return available

    require(data.get('schema_version') == 2, 'schema_version must be 2; migrate legacy UX/direction records to foundation/concept/art-direction handoffs')
    require(data.get('profile') == 'full-design', 'profile must be full-design; scoped workflows use their own gates')
    require(text(data.get('implementer')), 'implementer is required')
    require(type(data.get('motion_required')) is bool, 'motion_required must be explicit')
    require(type(data.get('interactive', True)) is bool, 'interactive must be boolean')
    require(data.get('platform') in ['web', 'react-native', 'ios', 'android', 'flutter', 'unsupported'], 'platform is required')
    require(data.get('review_mode', 'independent') in ['independent', 'sequential'], 'invalid review_mode')
    if data.get('review_mode') == 'sequential':
        limits.append('declared sequential review')
    reg = registry()
    inventory = unique(data.get('inventory', []), 'skill', 'inventory')
    for name, item in inventory.items():
        require(item.get('status') in ['available', 'unavailable', 'incompatible', 'excluded', 'user-only'], 'invalid inventory status: ' + name)
        require(evidence(item.get('evidence')), 'inventory evidence missing: ' + name)
        if item.get('status') != 'available':
            require(text(item.get('reason')), 'inventory reason missing: ' + name)
        require(name in reg or (item.get('unregistered') is True and evidence(item.get('slots'))), 'unknown skill needs unregistered slots: ' + name)

    routing = data.get('routing')
    require(isinstance(routing, dict), 'routing decision is required; an inventory is not a driver decision')
    if isinstance(routing, dict):
        require(routing.get('surface') in ['marketing', 'operate', 'read', 'experience'], 'invalid routing surface')
        require(text(routing.get('reason')), 'routing requires the reason for the selected driver')
        candidates = unique(routing.get('candidates', []), 'skill', 'routing candidate')
        if data.get('driver'):
            require(candidates.get(data['driver'], {}).get('eligible') is True,
                    'selected driver requires an eligible routing candidate')
        for skill, item in candidates.items():
            require(skill in inventory, 'routing candidate absent from inventory: ' + skill)
            require(type(item.get('eligible')) is bool and text(item.get('reason')) and evidence(item.get('evidence')),
                    'routing candidate needs explicit eligibility, reason and evidence: ' + skill)
            if item.get('eligible') is True:
                require(inventory.get(skill, {}).get('status') == 'available', 'eligible routing candidate is not available: ' + skill)
            else:
                require(item.get('reason_code') in ['runtime', 'brief-conflict', 'not-installed', 'platform',
                                                   'authorization', 'user-excluded'], 'routing exclusion needs a reason_code: ' + skill)
                require(skill != data.get('driver'), 'selected driver was excluded by routing: ' + skill)
                if item.get('reason_code') == 'brief-conflict':
                    constraint = item.get('constraint', {})
                    require(isinstance(constraint, dict) and constraint.get('source') in ['user', 'project']
                            and text(constraint.get('description')) and evidence(constraint.get('evidence')),
                            'routing brief conflict requires a user/project constraint, not a self-imposed style')
            if skill == TASTE and (item.get('eligible') is True or item.get('reason_code') == 'runtime'):
                available = node_probe(item.get('runtime_probe'))
                if item.get('eligible') is True:
                    require(available is True, 'eligible Taste requires a compatible runtime')
                else:
                    require(available is False, 'runtime exclusion cannot ignore a compatible installed alternate')
        requested = routing.get('requested_driver')
        if requested is not None:
            require(isinstance(requested, dict) and requested.get('skill') == data.get('driver')
                    and evidence(requested.get('evidence')), 'routing requested driver needs matching user evidence')
        if data.get('platform') == 'web' and routing.get('surface') == 'marketing':
            require(TASTE in candidates, 'marketing routing must consider Taste before a fallback driver')
            if candidates.get(TASTE, {}).get('eligible') is True and requested is None:
                require(data.get('driver') == TASTE, 'eligible Taste cannot be skipped for a marketing surface')

    activations = unique(data.get('activations', []), 'id', 'activation')
    for name, item in activations.items():
        skill = item.get('skill')
        require(skill in inventory, 'activation absent from inventory: ' + name)
        require(item.get('method') in ['skill-tool', 'instructions'], 'activation method invalid: ' + name)
        require(text(item.get('source')) and text(item.get('invocation')), 'activation source/invocation missing: ' + name)
        require(text(item.get('executor')), 'activation executor missing: ' + name)
        require(item.get('status') in ['succeeded', 'failed'], 'activation status invalid: ' + name)
        require(evidence(item.get('evidence')), 'activation evidence missing: ' + name)
        names = reg.get(skill, {}).get('names') or inventory.get(skill, {}).get('names') or [str(skill).split('/')[-1]]
        if item.get('method') == 'skill-tool':
            source = item.get('source', '')
            require(source == skill or source in names or source.split(':')[-1] in [n.split(':')[-1] for n in names], 'tool source identity does not match skill: ' + name)
        if item.get('status') == 'succeeded':
            require(evidence(item.get('outputs')), 'activation outputs missing: ' + name)
            require(inventory.get(skill, {}).get('status') == 'available', 'activation skill not available: ' + name)
            meta = reg.get(skill, inventory.get(skill, {}))
            platforms = meta.get('platforms', [])
            if platforms:
                require(data.get('platform') in platforms or 'any' in platforms, 'activation platform mismatch: ' + str(skill))
            mode = item.get('mode')
            if mode:
                require(mode in meta.get('specialist_slots', []), 'unsupported activation mode: ' + name)
            elif meta.get('role') == 'driver':
                require(skill == data.get('driver'), 'second full driver activation is forbidden: ' + name)
        if item.get('method') == 'instructions' and item.get('status') == 'succeeded':
            source = Path(item.get('source', ''))
            require(source.is_file(), 'instructions source file missing: ' + name)
            if source.is_file():
                header = source.read_text().split('---', 2)
                match = re.search(r'^name:\s*(.+?)\s*$', header[1], re.M) if len(header) == 3 else None
                source_name = match.group(1).strip('\"\'') if match else None
                require(source_name in names, 'instructions source identity does not match skill: ' + name)
        if reg.get(skill, {}).get('invocation') == 'user':
            require(inventory.get(skill, {}).get('requested') is True, 'user-only skill not explicitly requested: ' + str(skill))

    stages = unique(data.get('stages', []), 'id', 'stage')
    actual_order = [s['id'] for s in data.get('stages', []) if s.get('id') in PHASES]
    require(actual_order == PHASES, 'required stage order: ' + ' -> '.join(PHASES))
    for phase in PHASES:
        require(phase in stages, 'missing stage: ' + phase)
        if phase not in stages:
            continue
        stage = stages[phase]
        inputs = stage.get('inputs', [])
        require(isinstance(inputs, list) and all(text(v) for v in inputs), 'invalid inputs: ' + phase)
        require(set(INPUTS[phase]).issubset(inputs), 'missing required inputs: ' + phase)
        require(all(v in PHASES[:PHASES.index(phase)] for v in inputs), 'inputs must reference prior known stages: ' + phase)
        status = stage.get('status')
        if phase == 'motion' and status == 'skipped':
            require(data.get('motion_required') is False and text(stage.get('reason')), 'motion skip requires no motion requirement and a reason')
            continue
        require(status in ['completed', 'reused'], 'stage not completed: ' + phase)
        require(text(stage.get('output')), 'stage output missing: ' + phase)
        require(evidence(stage.get('evidence')), 'stage evidence missing: ' + phase)
        require(stage.get('accepted') is True, 'handoff not accepted: ' + phase)
        coverage = stage.get('coverage', {})
        required_slots = set(SLOTS.get(phase, []))
        if phase == 'review' and data.get('motion_required') is True:
            required_slots.add(MOTION_REVIEW)
        for slot in sorted(required_slots | set(coverage)):
            require(slot in coverage, 'missing slot coverage: ' + slot)
            item = coverage.get(slot, {})
            source = item.get('source')
            if source in ['skill', 'driver']:
                activation = activations.get(item.get('activation'))
                require(activation is not None, 'missing activation for ' + slot)
                if activation is None:
                    continue
                skill = activation.get('skill')
                require(activation.get('status') == 'succeeded', 'activation must have succeeded: ' + slot)
                meta = reg.get(skill, inventory.get(skill, {}))
                platforms = meta.get('platforms', [])
                if platforms:
                    require(data.get('platform') in platforms or 'any' in platforms, 'skill platform mismatch: ' + str(skill))
                mode = activation.get('mode')
                if mode:
                    require(mode == slot and slot in meta.get('specialist_slots', []), 'scoped mode cannot cover ' + slot)
                if source == 'driver':
                    require(not mode, 'scoped mode cannot act as driver: ' + slot)
                    require(skill == data.get('driver') and meta.get('role') == 'driver' and slot in meta.get('owns', []), 'driver does not own ' + slot)
                else:
                    require(slot in meta.get('slots', []), 'skill cannot cover ' + slot + ': ' + str(skill))
                    if meta.get('role') == 'driver':
                        if slot in meta.get('specialist_slots', []) and skill != data.get('driver'):
                            require(mode == slot, 'bounded specialist mode required for ' + slot)
                        else:
                            require(skill == data.get('driver') and slot in meta.get('owns', []), 'driver must own ' + slot)
                if phase == 'review':
                    require(meta.get('role') != 'driver', 'driver cannot be its own reviewer: ' + slot)
                    if activation.get('executor') == data.get('implementer'):
                        if data.get('review_mode') == 'sequential':
                            limits.append('sequential review: ' + slot)
                        else:
                            errors.append('review must be independent: ' + slot)
            elif source in ['project', 'built-in']:
                require(text(item.get('reason')) and evidence(item.get('evidence')), 'reuse/fallback reason and evidence missing: ' + slot)
                if source == 'project':
                    require(phase in ['components', 'validate'] or status == 'reused', 'project coverage must be verified reuse: ' + slot)
                    require(phase != 'review', 'project truth is not a review: ' + slot)
                else:
                    if phase == 'review' and slot == 'tech-audit':
                        require(text(item.get('executor')), 'built-in technical review requires an executor')
                        require(item.get('executor') != data.get('implementer')
                                or data.get('review_mode') == 'sequential',
                                'built-in technical review must be independent or declared sequential')
                    expected = {name for name, meta in reg.items() if slot in meta.get('slots', [])
                                and (data.get('platform') in meta.get('platforms', []) or 'any' in meta.get('platforms', []))}
                    require(not (expected - inventory.keys()), 'unchecked fallback candidates for ' + slot + ': ' + ', '.join(sorted(expected - inventory.keys())))
                    candidates = [i for name, i in inventory.items() if slot in reg.get(name, i).get('slots', [])]
                    require(bool(candidates), 'fallback requires candidate availability checks: ' + slot)
                    require(not any(i.get('status') == 'available' for i in candidates), 'available specialist cannot be bypassed: ' + slot)
                    limits.append('built-in fallback: ' + slot)
            else:
                errors.append('invalid coverage source: ' + slot)

    def covered_skill(phase, slot):
        item = stages.get(phase, {}).get('coverage', {}).get(slot, {})
        act = activations.get(item.get('activation')) if item.get('source') in ['skill', 'driver'] else None
        return (act or {}).get('skill'), item.get('activation') if act else None

    system_skill, _ = covered_skill('system', 'design-system')
    require(system_skill != RECORD_ONLY_SYSTEM or stages.get('system', {}).get('status') == 'reused',
            'impeccable/document records a design system; it cannot create one')
    ux_skill, ux_run = covered_skill('foundation', 'ux-analysis')
    if ux_skill == RESEARCH_TOOL:
        require(inventory.get(UX_OWNER, {}).get('status') != 'available',
                'impeccable/shape is available and owns ux-analysis; research output is not UX analysis')
    _, concept_run = covered_skill('concept', 'design-reasoning')
    _, direction_run = covered_skill('direction', 'visual-direction')
    _, research_run = covered_skill('foundation', 'research-foundation')
    require(not concept_run or concept_run not in [direction_run, research_run, ux_run],
            'concept needs its own activation, separate from foundation and art direction')

    if data.get('driver'):
        require(data['driver'] in reg and reg[data['driver']].get('role') == 'driver', 'unregistered/non-driver cannot be selected as driver')
        platforms = reg.get(data['driver'], {}).get('platforms', [])
        require(data.get('platform') in platforms or 'any' in platforms, 'selected driver platform mismatch')
        require(any(a.get('skill') == data['driver'] and a.get('status') == 'succeeded' and not a.get('mode') for a in activations.values()), 'selected driver needs successful full driver activation')
    review_coverage = stages.get('review', {}).get('coverage', {})
    review_ids = [review_coverage.get(slot, {}).get('activation') for slot in ['ux-critique', 'tech-audit']]
    require(not review_ids[0] or review_ids[0] != review_ids[1], 'review capabilities require distinct activations')
    visual = data.get('visual_review')
    require(isinstance(visual, dict), 'visual_review is required; boolean gates do not establish visual quality')
    if isinstance(visual, dict):
        builtin_review = review_coverage.get('ux-critique', {}).get('source') == 'built-in'
        if builtin_review:
            require(visual.get('source') == 'built-in' and text(visual.get('executor'))
                    and text(visual.get('id')) and not visual.get('activation'),
                    'built-in visual_review needs an id and real executor, not a fictitious activation')
            require(visual.get('executor') != data.get('implementer') or data.get('review_mode') == 'sequential',
                    'built-in visual review must be independent or declared sequential')
        else:
            require(visual.get('activation') == review_ids[0] and visual.get('activation') in activations,
                    'visual_review must link to the actual UX/design reviewer activation')
        review_ref = visual.get('id') if builtin_review else visual.get('activation')
        previous_reviews = unique(visual.get('previous_reviews', []), 'id', 'previous visual review')
        require(review_ref not in previous_reviews, 'current visual review must not reuse a previous review id')
        for item in previous_reviews.values():
            require(item.get('source') in ['skill', 'built-in'] and text(item.get('executor'))
                    and text(item.get('summary')) and evidence(item.get('evidence')),
                    'previous visual review needs its source, executor, assessment and evidence')
        criteria = unique(visual.get('criteria', []), 'dimension', 'visual criterion')
        dimensions = VISUAL_DIMENSIONS | ({MOTION_DIMENSION} if data.get('motion_required') is True else set())
        require(dimensions.issubset(criteria), 'visual_review missing dimensions: ' + ', '.join(sorted(dimensions - criteria.keys())))
        for dimension, item in criteria.items():
            require(text(item.get('observation')) and evidence(item.get('evidence')),
                    'visual criterion needs an observation and rendered evidence: ' + dimension)
            require(item.get('verdict') == 'pass', 'visual criterion failed or unverified: ' + dimension)
        feedback = visual.get('user_feedback', {'status': 'not-received'})
        require(isinstance(feedback, dict), 'visual user feedback must be an object')
        if isinstance(feedback, dict):
            status = feedback.get('status')
            require(status in ['not-received', 'accepted', 'changes-requested'], 'invalid visual user feedback status')
            if status != 'not-received':
                require(evidence(feedback.get('evidence')), 'visual user feedback requires evidence')
            if status == 'changes-requested':
                resolution = feedback.get('resolution', {})
                previous = feedback.get('previous_review')
                if feedback.get('previous_activation') in activations:
                    previous = feedback['previous_activation']
                    prior = activations[previous]
                    prior_skill = prior.get('skill')
                    prior_meta = reg.get(prior_skill, inventory.get(prior_skill, {}))
                    require(prior.get('status') == 'succeeded'
                            and 'ux-critique' in prior_meta.get('slots', [])
                            and prior_meta.get('role') != 'driver'
                            and prior.get('mode') in [None, 'ux-critique'],
                            'previous activation must be a successful UX/design review')
                else:
                    require(previous in previous_reviews, 'negative user feedback needs the preserved previous review')
                require(isinstance(resolution, dict)
                        and resolution.get('review' if builtin_review else 'activation') == review_ref
                        and text(resolution.get('summary')) and evidence(resolution.get('evidence'))
                        and previous != review_ref,
                        'negative user feedback requires a new rendered review and resolution, not the earlier pass')
    def levels(field):
        values = data.get(field, [])
        valid = isinstance(values, list) and all(
            isinstance(v, str) and v in ['L0', 'L1', 'L2', 'L3', 'L4', 'L5'] for v in values)
        require(valid, field + ' must be an array of evidence levels L0 through L5')
        return set(values) if valid else set()

    required = levels('required_levels') | {'L1', 'L2', 'L4'}
    observed = levels('evidence_levels')
    if data.get('interactive', True):
        required.add('L3')
    for level in sorted(required):
        require(level in observed, 'missing evidence level: ' + level)
    gates = data.get('gates', [])
    require(bool(gates), 'workflow gates are required')
    for gate in gates:
        require(text(gate.get('name')) and gate.get('met') is True, 'unmet or invalid gate: ' + str(gate.get('name')))
    return {'scope': 'execution-record', 'eligible': not errors, 'status_ceiling': 'Needs review' if errors else ('Passed with limitations' if limits else 'Passed'),
            'errors': errors, 'limitations': sorted(set(limits)),
            'note': 'Record consistency is not proof of actual execution, truthful receipts, or visual quality.'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('record', nargs='?')
    parser.add_argument('--stdin', action='store_true')
    args = parser.parse_args()
    try:
        if args.stdin == bool(args.record):
            raise ValueError('provide exactly one record path or --stdin')
        data = json.load(sys.stdin) if args.stdin else json.loads(Path(args.record).read_text())
        if not isinstance(data, dict):
            raise ValueError('record must be an object')
        result = validate(data)
    except (ValueError, OSError, TypeError, KeyError, AttributeError) as exc:
        result = {'eligible': False, 'errors': ['Invalid record: ' + str(exc)]}
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result['eligible'] else 1


if __name__ == '__main__':
    sys.exit(main())
