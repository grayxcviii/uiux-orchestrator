"""Exercise the release gate on damaged distributions, without network access."""
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parent.parent


class LicenseGateTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory(prefix='uiux-license-gate-')
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        for directory in ['bin', '.claude-plugin', 'skills/uiux-orchestrator/legal']:
            shutil.copytree(ROOT / directory, self.root / directory)
        for file in ['LICENSE', 'THIRD_PARTY_NOTICES.md', 'package.json', 'scripts/check_licenses.py',
                     'skills/uiux-orchestrator/LICENSE', 'skills/uiux-orchestrator/SKILL.md',
                     'skills/uiux-orchestrator/registry/skills.yaml']:
            destination = self.root / file
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(ROOT / file, destination)
        self.legal = self.root / 'skills/uiux-orchestrator/legal'
        self.catalog = self.root / 'bin/specialists.json'
        self.bind_catalog()

    def bind_catalog(self):
        path = self.legal / 'install-audit.json'
        audit = json.loads(path.read_text())
        audit['catalog_sha256'] = hashlib.sha256(self.catalog.read_bytes()).hexdigest()
        path.write_text(json.dumps(audit))

    def run_gate(self):
        return subprocess.run([sys.executable, '-I', str(self.root / 'scripts/check_licenses.py')],
                              capture_output=True, text=True)

    def test_valid_distribution_passes(self):
        result = self.run_gate()
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_catalog_cannot_silently_omit_reviewed_supplement(self):
        catalog = json.loads(self.catalog.read_text())
        taste = next(source for source in catalog['sources'] if source['id'] == 'taste')
        taste['license']['bundled_files'].remove('licenses/taste-lucide-license')
        self.catalog.write_text(json.dumps(catalog))
        self.bind_catalog()
        result = self.run_gate()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('supplement', result.stderr.lower())

    def test_invalid_asset_manifest_hash_blocks_release(self):
        catalog = json.loads(self.catalog.read_text())
        taste = next(source for source in catalog['sources'] if source['id'] == 'taste')
        taste['license']['asset_manifests'][0]['sha256'] = 'not-a-hash'
        self.catalog.write_text(json.dumps(catalog))
        self.bind_catalog()
        result = self.run_gate()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('asset', result.stderr.lower())

    def test_missing_asset_guidance_blocks_release(self):
        (self.legal / 'asset-usage.md').unlink()
        result = self.run_gate()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('asset', result.stderr.lower())

    def test_changed_original_notice_blocks_release(self):
        (self.legal / 'licenses/taste-lucide-license').write_text('replacement permission text')
        result = self.run_gate()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Changed upstream licence', result.stderr)
