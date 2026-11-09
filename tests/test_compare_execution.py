import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / 'scripts/compare_execution.py'


class ComparisonTests(unittest.TestCase):
    def records(self):
        common = dict(task_id='E01', repeat=1, model='test-model', agent='test-agent',
                      settings={'effort': 'standard'}, source_revision='fixture-sha',
                      tooling=['browser'], specialists=[], remaining_issues=0,
                      criteria={'reuse': True, 'states': True, 'scope': True},
                      evidence={'visual_observed': False, 'artifacts': []})
        return [dict(common, condition='baseline', duration_seconds=10, tokens=None),
                dict(common, condition='orchestrator', duration_seconds=15, tokens=120,
                     skill_version='1.2.0')]

    def run_comparison(self, records):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'observations.json'
            path.write_text(json.dumps(records))
            return subprocess.run([sys.executable, str(SCRIPT), str(path)],
                                  text=True, capture_output=True)

    def test_reports_real_time_delta_without_inventing_missing_tokens_or_visual_pass(self):
        result = self.run_comparison(self.records())
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn('+5.00 s', result.stdout)
        self.assertIn('unavailable', result.stdout)
        self.assertIn('unverified', result.stdout)

    def test_rejects_different_models_between_conditions(self):
        for field, value in [('model', 'different-model'), ('source_revision', 'other-snapshot'),
                             ('settings', {'effort': 'different'}), ('specialists', ['new-skill@1'])]:
            with self.subTest(field=field):
                records = self.records()
                records[1][field] = value
                result = self.run_comparison(records)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn(field, result.stderr)

    def test_rejects_missing_baseline_and_duplicate_condition(self):
        for records in [self.records()[1:], self.records() + self.records()[:1]]:
            with self.subTest(records=records):
                result = self.run_comparison(records)
                self.assertNotEqual(result.returncode, 0)

    def test_missing_criterion_is_not_counted_as_success(self):
        records = self.records()
        del records[1]['criteria']['scope']
        result = self.run_comparison(records)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('criteria', result.stderr)

    def test_rejects_claimed_visual_observation_without_artifact(self):
        records = self.records()
        records[1]['evidence'] = {'visual_observed': True, 'artifacts': []}
        result = self.run_comparison(records)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('artifact', result.stderr)

    def test_unknown_duration_does_not_become_zero_cost(self):
        records = self.records()
        records[1]['duration_seconds'] = None
        result = self.run_comparison(records)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('duration_seconds', result.stderr)

    def test_compares_observed_artifacts_and_real_token_counts(self):
        records = self.records()
        with tempfile.TemporaryDirectory() as folder:
            artifact = Path(folder) / 'observed-frame.txt'
            artifact.write_text('test artifact; not a measured UI screenshot')
            for run in records:
                run['evidence'] = {'visual_observed': True, 'artifacts': [str(artifact)]}
            records[0]['tokens'] = 100
            result = self.run_comparison(records)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn('observed → observed', result.stdout)
        self.assertIn('| +20 |', result.stdout)


if __name__ == '__main__':
    unittest.main()
