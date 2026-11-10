"""New scenarios must be loadable by the real scorer, not hidden in change notes."""
import importlib.util
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class RoutingRegressionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        data = json.loads((ROOT / 'tests/scenarios.json').read_text())
        cls.scenarios = {row['id']: row for row in data['scenarios']}
        spec = importlib.util.spec_from_file_location('routing_score', ROOT / 'scripts/score_routing.py')
        cls.scorer = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(cls.scorer)

    def decision(self, driver):
        return dict(platform='web', intents=['new-ui-design'], workflow='design', fast_path=False,
                    mutation='allowed', driver=driver, selected_skills=[driver, 'uupm/search'],
                    asks_user=False, best_status='Passed')

    def test_alternate_runtime_case_is_routable_and_accepts_eligible_taste(self):
        result, _, violations, _ = self.scorer.score_one(
            self.scenarios['S40'], self.decision('taste/design-taste-frontend'), True)
        self.assertTrue(all(result.values()), result)
        self.assertEqual(violations, [])

    def test_alternate_runtime_case_rejects_silently_skipping_taste(self):
        result, _, _, _ = self.scorer.score_one(
            self.scenarios['S40'], self.decision('anthropic/frontend-design'), True)
        self.assertFalse(result['driver'])
        self.assertFalse(result['skills'])

    def test_explicit_visual_constraint_case_accepts_compatible_fallback(self):
        result, _, violations, _ = self.scorer.score_one(
            self.scenarios['S41'], self.decision('impeccable/new-work'), True)
        self.assertTrue(all(result.values()), result)
        self.assertEqual(violations, [])

    def test_explicit_visual_constraint_case_rejects_forcing_taste(self):
        result, _, violations, _ = self.scorer.score_one(
            self.scenarios['S41'], self.decision('taste/design-taste-frontend'), True)
        self.assertFalse(result['driver'])
        self.assertIn('taste/design-taste-frontend', violations)


if __name__ == '__main__':
    unittest.main()
