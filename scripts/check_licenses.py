#!/usr/bin/env python3
"""Offline release gate for bundled licences, provenance and approved plugin downloads."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKILL = ROOT / 'skills/uiux-orchestrator'
LEGAL = SKILL / 'legal'


def main():
    assert (ROOT / 'LICENSE').read_bytes() == (SKILL / 'LICENSE').read_bytes(), 'Installed MIT licence differs from root licence'
    assert (ROOT / 'THIRD_PARTY_NOTICES.md').is_file(), 'Missing package notices'
    assert (LEGAL / 'THIRD_PARTY_NOTICES.md').is_file(), 'Missing installed notices'
    sources = json.loads((LEGAL / 'sources.json').read_text())
    assert sources, 'No upstream licence provenance recorded'
    for entry in sources:
        path = (LEGAL / entry['file']).resolve()
        assert path.is_relative_to(LEGAL.resolve()), 'Licence path escapes legal directory'
        assert path.is_file(), f'Missing licence: {entry["file"]}'
        assert hashlib.sha256(path.read_bytes()).hexdigest() == entry['sha256'], f'Changed upstream licence: {entry["file"]}'
        assert entry['source'].startswith('https://'), 'Missing upstream source URL'
    pkg = json.loads((ROOT / 'package.json').read_text())
    assert 'THIRD_PARTY_NOTICES.md' in pkg['files'], 'npm package excludes notices'
    assert 'skills/uiux-orchestrator/' in pkg['files'], 'npm package excludes installed legal files'
    plugin = json.loads((ROOT / '.claude-plugin/plugin.json').read_text())
    marketplace = json.loads((ROOT / '.claude-plugin/marketplace.json').read_text())
    audited = {entry['name']: entry for entry in json.loads((LEGAL / 'plugin-audit.json').read_text())}
    external = {entry['name']: entry for entry in marketplace['plugins'] if isinstance(entry['source'], dict)}
    for name, entry in external.items():
        audit = audited.get(name)
        assert audit and audit['automatic'] and audit['required_files'], f'Plugin {name} needs a licence audit before automatic distribution'
        assert entry['source'] == audit['source'], f'Plugin {name} source changed; repeat the licence audit'
    assert set(plugin.get('dependencies', [])) <= external.keys(), 'Unaudited plugin dependency'
    assert 'provider: dickwu' not in (SKILL / 'registry/skills.yaml').read_text(), 'Unlicensed provider remains in active routing'
    print(f'OK: {len(sources)} original licence/NOTICE files verified; {len(external)} approved automatic plugin dependency')


if __name__ == '__main__':
    main()
