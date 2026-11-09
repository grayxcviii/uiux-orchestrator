#!/usr/bin/env python3
"""Compare paired, measured execution records; never infer missing measurements or visual quality."""
import argparse
import json
import math
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent


def require(condition, message):
    if not condition:
        raise ValueError(message)


def number(value, field, integer=False):
    require(type(value) in ([int] if integer else [int, float]) and math.isfinite(value) and value >= 0,
            f'{field} must be a nonnegative measured number')


def compare(path):
    cases = {case['id']: case for case in json.loads((ROOT / 'tests/comparison/cases.json').read_text())['cases']}
    records = json.loads(path.read_text())
    require(isinstance(records, list) and records, 'Provide a nonempty array of measured runs')
    pairs = {}
    comparable = ['model', 'agent', 'settings', 'source_revision', 'tooling', 'specialists']
    for run in records:
        task = run['task_id']
        require(task in cases, f'Unknown task_id: {task}')
        number(run['repeat'], 'repeat', integer=True)
        require(run['repeat'] >= 1, 'repeat starts at 1')
        mode = run['condition']
        require(mode in ['baseline', 'orchestrator'], 'Invalid condition')
        key = task, run['repeat']
        pair = pairs.setdefault(key, {})
        require(mode not in pair, f'Duplicate {mode} for {key}')
        for field in comparable:
            require(field in run, f'Missing matching metadata: {field}')
        for field in ['model', 'agent', 'source_revision']:
            require(isinstance(run[field], str) and run[field].strip(), f'Missing {field}')
        require(isinstance(run['settings'], dict), 'settings must record the model/tool configuration')
        for field in ['tooling', 'specialists']:
            require(isinstance(run[field], list) and all(isinstance(v, str) for v in run[field]), f'Invalid {field}')
            run[field] = sorted(run[field])
        if mode == 'orchestrator':
            require(isinstance(run.get('skill_version'), str) and run['skill_version'], 'Missing skill_version')
        number(run['duration_seconds'], 'duration_seconds')
        if run.get('tokens') is not None:
            number(run['tokens'], 'tokens', integer=True)
        number(run['remaining_issues'], 'remaining_issues', integer=True)
        criteria = run['criteria']
        require(isinstance(criteria, dict) and set(criteria) == set(cases[task]['criteria']), f'{task}: incomplete criteria')
        require(all(value is None or type(value) is bool for value in criteria.values()), 'criteria values must be true, false or null')
        evidence = run['evidence']
        require(type(evidence['visual_observed']) is bool, 'visual_observed must be boolean')
        artifacts = evidence['artifacts']
        require(isinstance(artifacts, list) and all(isinstance(v, str) and v for v in artifacts), 'Invalid artifacts')
        for artifact in artifacts:
            require((path.parent / artifact).is_file(), f'Missing evidence artifact: {artifact}')
        require(not evidence['visual_observed'] or artifacts, 'Visual observation requires an artifact')
        pair[mode] = run

    lines = ['# Paired execution observations', '',
             'Deltas are orchestrator minus baseline; positive time/token/issue deltas mean more cost or issues.',
             'Checks and visual observation are reported by evaluators, not independently verified by this script.',
             'Small samples do not establish a general quality or efficiency improvement.', '',
             '| Task / repeat | Checks: baseline → orchestrator | Visual: baseline → orchestrator | Time delta | Token delta | Issue delta |',
             '|---|---|---|---|---|---|']
    def checks(run):
        values = list(run['criteria'].values())
        unknown = values.count(None)
        return f'{sum(value is True for value in values)}/{len(values)}' + (f' ({unknown} ungraded)' if unknown else '')

    for (task, repeat), pair in sorted(pairs.items()):
        require(set(pair) == {'baseline', 'orchestrator'}, f'Unpaired observation: {task}/{repeat}')
        base, orch = pair['baseline'], pair['orchestrator']
        for field in comparable:
            require(base[field] == orch[field], f'{task}/{repeat}: mismatched {field}')
        visual = ['observed' if run['evidence']['visual_observed'] else 'unverified' for run in [base, orch]]
        tokens = (f'{orch["tokens"] - base["tokens"]:+d}' if base.get('tokens') is not None and orch.get('tokens') is not None else 'unavailable')
        lines.append(f'| {task} / {repeat} | {checks(base)} → {checks(orch)} | {visual[0]} → {visual[1]} | '
                     f'{orch["duration_seconds"] - base["duration_seconds"]:+.2f} s | {tokens} | '
                     f'{orch["remaining_issues"] - base["remaining_issues"]:+d} |')
    return '\n'.join(lines) + '\n'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('observations', type=Path)
    parser.add_argument('--out', type=Path)
    args = parser.parse_args()
    try:
        report = compare(args.observations.resolve())
    except (ValueError, KeyError, TypeError, OSError) as error:
        parser.exit(1, f'Invalid execution observations: {error}\n')
    if args.out:
        args.out.write_text(report)
    else:
        sys.stdout.write(report)


if __name__ == '__main__':
    main()
