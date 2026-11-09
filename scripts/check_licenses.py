#!/usr/bin/env python3
"""Offline release gate for bundled licences, provenance and approved plugin downloads."""
import hashlib
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
SKILL = ROOT / 'skills/uiux-orchestrator'
LEGAL = SKILL / 'legal'


def main():
    assert (ROOT / 'LICENSE').read_bytes() == (SKILL / 'LICENSE').read_bytes(), 'Installed MIT licence differs from root licence'
    assert (ROOT / 'THIRD_PARTY_NOTICES.md').is_file(), 'Missing package notices'
    assert (LEGAL / 'THIRD_PARTY_NOTICES.md').is_file(), 'Missing installed notices'
    sources = json.loads((LEGAL / 'sources.json').read_text())
    assert sources, 'No upstream licence provenance recorded'
    by_file = {entry['file']: entry for entry in sources}
    assert len(by_file) == len(sources), 'Duplicate licence provenance'
    assert (LEGAL / 'asset-usage.md').is_file(), 'Missing asset usage guidance'
    for entry in sources:
        path = (LEGAL / entry['file']).resolve()
        assert path.is_relative_to(LEGAL.resolve()), 'Licence path escapes legal directory'
        assert path.is_file(), f'Missing licence: {entry["file"]}'
        assert hashlib.sha256(path.read_bytes()).hexdigest() == entry['sha256'], f'Changed upstream licence: {entry["file"]}'
        assert entry['source'].startswith('https://'), 'Missing upstream source URL'
        if entry.get('delivery') == 'supplemental':
            assert re.search(r'/[a-f0-9]{40}/', entry['source']), 'Supplemental licence source is not pinned'
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
    audit = json.loads((LEGAL / 'install-audit.json').read_text())
    assert hashlib.sha256((ROOT / 'bin/specialists.json').read_bytes()).hexdigest() == audit['catalog_sha256'], 'Specialist catalogue changed; repeat the upstream installation/licence audit'
    assert hashlib.sha256((LEGAL / 'sources.json').read_bytes()).hexdigest() == audit['supplemental_sources_sha256'], 'Supplemental licence provenance changed; repeat the source review'
    catalog = json.loads((ROOT / 'bin/specialists.json').read_text())
    names, registry_ids, source_ids = set(), set(), set()
    for source in catalog['sources']:
        assert source['id'] not in source_ids, 'Duplicate specialist source'
        source_ids.add(source['id'])
        assert source['repository'].startswith('https://github.com/') and source['repository'].endswith('.git'), 'Unreviewed specialist source URL'
        assert len(source['revision']) == 40 and all(c in '0123456789abcdef' for c in source['revision']), 'Unpinned specialist source'
        assert source['license']['files'], 'Specialist source omits its licence/notice files'
        assert source['license']['spdx'] in ('MIT', 'Apache-2.0'), 'Unreviewed specialist licence'
        bundled = source['license'].get('bundled_files', [])
        assert 'asset-usage.md' in bundled, 'Specialist omits asset usage guidance'
        required = {entry['file'] for entry in sources if entry.get('delivery') == 'supplemental' and entry['provider'] == source['id']}
        assert required <= set(bundled), f'Missing supplemental notices for {source["id"]}'
        for file in bundled:
            path = (LEGAL / file).resolve()
            assert path.is_relative_to(LEGAL.resolve()) and path.is_file(), 'Missing or unsafe supplemental licence'
            assert file == 'asset-usage.md' or (file in by_file and by_file[file].get('delivery') == 'supplemental'
                                               and by_file[file]['provider'] == source['id']), 'Unaudited supplemental licence'
        assets = source['license'].get('asset_manifests', [])
        if source['id'] == 'taste':
            assert assets, 'Taste asset credit manifests need review'
        assert len({entry['file'] for entry in assets}) == len(assets), 'Duplicate asset credit manifest'
        for entry in assets:
            assert re.fullmatch(r'[a-f0-9]{64}', entry['sha256']), 'Invalid asset credit manifest hash'
            assert '..' not in entry['file'].split('/') and '\\' not in entry['file'], 'Unsafe asset credit manifest path'
            assert any(entry['file'].startswith(skill['path'] + '/') for skill in source['skills']), 'Asset credit manifest outside selected skill trees'
        if source['license']['readme_declaration']:
            assert source['id'] in ('swm', 'vercel'), 'New README-only licence needs review'
        for skill in source['skills']:
            assert skill['name'] not in names, 'Colliding specialist skill names'
            names.add(skill['name'])
            assert skill['groups'] and set(skill['groups']) <= {'web', 'mobile'}, 'Invalid specialist platform group'
            assert skill['registry_ids'] or (skill.get('support_for') and all(parent in {s['name'] for s in source['skills']} for parent in skill['support_for'])), 'Unmapped specialist needs an audited companion relationship'
            assert all(sid.split('/')[0] == source['id'] for sid in skill['registry_ids']), 'Specialist is mapped to the wrong registry provider'
            assert not (set(skill['registry_ids']) & registry_ids), 'Duplicate specialist registry mapping'
            registry_ids.update(skill['registry_ids'])
    active_ids = set(re.findall(r'^\s*-?\s*\{?\s*id:\s*([a-z0-9]+/[a-z0-9-]+)', (SKILL / 'registry/skills.yaml').read_text(), re.M))
    active_ids = {sid for sid in active_ids if not sid.startswith('ref/')}
    assert registry_ids == active_ids, 'Install catalogue does not match active registry'
    assert (ROOT / 'bin/licenses/MIT-terms.txt').read_text().split('Permission is hereby granted', 1)[1] == (ROOT / 'LICENSE').read_text().split('Permission is hereby granted', 1)[1], 'MIT permission terms changed'
    print(f'OK: {len(names)} installable specialists cover {len(registry_ids)} registry entries from {len(source_ids)} pinned sources')
    print(f'OK: {len(sources)} original licence/NOTICE files verified; {len(external)} approved automatic plugin dependency')
    print(f'OK: {sum(entry.get("delivery") == "supplemental" for entry in sources)} supplemental originals; asset credit manifests and guidance declared')


if __name__ == '__main__':
    main()
