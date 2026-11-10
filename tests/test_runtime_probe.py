"""Runtime discovery regressions: an older PATH binary is not proof of unavailability."""
import importlib.util
import os
from pathlib import Path
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / 'skills/uiux-orchestrator/scripts/probe-runtime.py'


@unittest.skipIf(os.name == 'nt', 'POSIX fake executables; production discovery also supports Windows paths')
class RuntimeProbeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        spec = importlib.util.spec_from_file_location('runtime_probe', SCRIPT)
        cls.module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(cls.module)

    def node(self, location, version):
        location.parent.mkdir(parents=True, exist_ok=True)
        location.write_text(f'#!/bin/sh\nprintf "%s\\n" "{version}"\n')
        location.chmod(0o755)
        return location

    def test_finds_nvm24_when_path_only_resolves_node20_without_changing_environment(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            self.node(root / 'path/node', 'v20.19.0')
            alternate = self.node(root / '.nvm/versions/node/v24.18.0/bin/node', 'v24.18.0')
            before = dict(os.environ)
            result = self.module.probe_node(22, path_env=str(root / 'path'), user_dir=root, env={})
            self.assertTrue(result['available'])
            self.assertEqual(result['selected']['path'], str(alternate.resolve()))
            self.assertEqual({c['major'] for c in result['candidates']}, {20, 24})
            self.assertEqual(dict(os.environ), before)
            self.assertFalse(result['environment_changed'])
            self.assertFalse(result['installation_performed'])

    def test_prefers_a_sufficient_path_runtime(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            current = self.node(root / 'path/node', 'v22.1.0')
            self.node(root / '.nvm/versions/node/v24.18.0/bin/node', 'v24.18.0')
            result = self.module.probe_node(22, path_env=str(root / 'path'), user_dir=root, env={})
            self.assertEqual(result['selected']['path'], str(current.resolve()))

    def test_old_only_is_unavailable_with_actual_version_observations(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            self.node(root / 'path/node', 'v20.19.0')
            result = self.module.probe_node(22, path_env=str(root / 'path'), user_dir=root, env={})
            self.assertFalse(result['available'])
            self.assertIsNone(result['selected'])
            self.assertEqual(result['candidates'][0]['version'], 'v20.19.0')

    def test_honors_nonstandard_nvm_dir_with_spaces(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            alternate = self.node(root / 'custom node/versions/node/v24/bin/node', 'v24.18.0')
            result = self.module.probe_node(22, path_env='', user_dir=root,
                                            env={'NVM_DIR': str(root / 'custom node')})
            self.assertEqual(result['selected']['path'], str(alternate.resolve()))

    def test_rejects_invalid_version_output_instead_of_guessing(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            self.node(root / 'path/node', 'not a Node version')
            result = self.module.probe_node(22, path_env=str(root / 'path'), user_dir=root, env={})
            self.assertFalse(result['available'])
            self.assertEqual(result['candidates'], [])
            self.assertTrue(result['errors'])

    def test_empty_path_does_not_execute_a_project_local_node(self):
        with tempfile.TemporaryDirectory() as folder:
            result = self.module.probe_node(22, path_env='', user_dir=Path(folder), env={})
            self.assertFalse(result['available'])
            self.assertEqual(result['candidates'], [])


if __name__ == '__main__':
    unittest.main()
