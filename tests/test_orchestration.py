"""Execution-contract regressions, not wording or visual-quality tests."""
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / 'skills/uiux-orchestrator/scripts/check-orchestration.py'


def node_probe(*versions):
    candidates = [dict(path=f'/runtimes/node-{major}/bin/node', version=f'v{major}.0.0',
                       major=major, source='test fixture', satisfies=major >= 22)
                  for major in versions]
    selected = next((c for c in candidates if c['satisfies']), None)
    return dict(runtime='node', minimum_major=22, available=selected is not None,
                selected=selected, candidates=candidates, errors=[],
                environment_changed=False, installation_performed=False)


def record():
    assignments = [
        ('foundation', 'ux-analysis', 'uupm/search', 'builder'),
        ('concept', 'design-reasoning', 'anthropic/frontend-design', 'builder'),
        ('direction', 'visual-direction', 'taste/design-taste-frontend', 'builder'),
        ('system', 'design-system', 'impeccable/document', 'builder'),
        ('motion', 'motion-build', 'emil/animate', 'builder'),
        ('review', 'ux-critique', 'impeccable/critique', 'reviewer-ux'),
        ('review', 'tech-audit', 'impeccable/audit', 'reviewer-tech'),
    ]
    stages = []
    for stage in ['inspect', 'foundation', 'concept', 'direction', 'system', 'components', 'motion',
                  'implement', 'validate', 'review']:
        stages.append(dict(id=stage, status='completed', output=f'{stage} output',
                           evidence=[f'tool:observed-{stage}'], accepted=True, coverage={}))
    data = dict(schema_version=2, profile='full-design', platform='web', driver='taste/design-taste-frontend',
                implementer='builder', motion_required=True, inventory=[], activations=[],
                stages=stages, evidence_levels=['L1', 'L2', 'L3', 'L4'],
                required_levels=['L1', 'L2', 'L3', 'L4'], gates=[dict(name='workflow', met=True)])
    for stage, slot, skill, executor in assignments:
        activation = 'run-' + slot
        data['inventory'].append(dict(skill=skill, status='available', evidence=['tool:availability']))
        data['activations'].append(dict(id=activation, skill=skill, method='skill-tool',
                                       source=skill, invocation=f'{skill} target', executor=executor,
                                       status='succeeded', evidence=['tool:invocation-result'],
                                       outputs=[f'{stage} artifact']))
        next(s for s in stages if s['id'] == stage)['coverage'][slot] = dict(
            source='skill', activation=activation)
    next(a for a in data['activations'] if a['skill'] == 'anthropic/frontend-design')['mode'] = 'design-reasoning'
    next(s for s in stages if s['id'] == 'foundation')['coverage']['research-foundation'] = dict(source='skill', activation='run-ux-analysis')
    dependencies = {'inspect': [], 'foundation': ['inspect'], 'concept': ['foundation'],
                    'direction': ['concept'], 'system': ['foundation', 'direction'],
                    'components': ['system'], 'motion': ['system', 'components'],
                    'implement': ['direction', 'system', 'components', 'motion'],
                    'validate': ['implement'], 'review': ['foundation', 'concept', 'direction', 'system', 'validate']}
    for item in stages:
        item['inputs'] = dependencies[item['id']]
    for stage, slot in [('components', 'component-reference'), ('validate', 'visual-validation')]:
        next(s for s in stages if s['id'] == stage)['coverage'][slot] = dict(
            source='project', reason='Existing components/tooling inspected', evidence=['tool:project'])
    data['routing'] = dict(surface='marketing', reason='Eligible marketing driver selected',
                          candidates=[dict(skill='taste/design-taste-frontend', eligible=True,
                                           reason='Actual skill inspected; photographic marketing brief fits',
                                           evidence=['tool:actual-skill-and-brief'], runtime_probe=node_probe(22))])
    data['visual_review'] = dict(activation='run-ux-critique', criteria=[
        dict(dimension=dimension, verdict='pass', observation=f'Rendered {dimension} assessed against the original brief',
             evidence=['render:390', 'render:1440'])
        for dimension in ['brief-fit', 'creative-advance', 'composition', 'typography',
                          'palette-and-materials', 'product-identity', 'distinctiveness',
                          'finish', 'responsive-craft']])
    return data


def stage(data, name):
    return next(s for s in data['stages'] if s['id'] == name)


def activation(data, name):
    return next(a for a in data['activations'] if a['id'] == name)


def use_frontend_driver(data):
    data['driver'] = 'anthropic/frontend-design'
    data['routing']['candidates'].append(dict(
        skill=data['driver'], eligible=True, reason='Compatible web driver',
        evidence=['tool:frontend-driver-inspected']))
    data['activations'].remove(activation(data, 'run-visual-direction'))
    activation(data, 'run-design-reasoning').pop('mode')
    stage(data, 'direction')['coverage']['visual-direction'] = dict(
        source='driver', activation='run-design-reasoning')


def use_builtin_design_review(data, executor='manual-reviewer'):
    inventory = next(i for i in data['inventory'] if i['skill'] == 'impeccable/critique')
    inventory.update(status='unavailable', reason='No installed reviewer after directory search')
    data['activations'].remove(activation(data, 'run-ux-critique'))
    stage(data, 'review')['coverage']['ux-critique'] = dict(
        source='built-in', reason='No compatible installed reviewer', evidence=['tool:directory-search'])
    data['visual_review'].pop('activation')
    data['visual_review'].update(id='manual-review', source='built-in', executor=executor)


class OrchestrationTests(unittest.TestCase):
    def check(self, data):
        return subprocess.run([sys.executable, '-I', str(SCRIPT), '--stdin'],
                              input=json.dumps(data), text=True, capture_output=True)

    def rejected(self, data, word):
        result = self.check(data)
        self.assertNotEqual(result.returncode, 0, result.stdout)
        self.assertIn(word, result.stdout + result.stderr)

    def test_accepts_well_formed_record_with_distinct_roles_and_handoffs(self):
        result = self.check(record())
        self.assertEqual(result.returncode, 0, result.stderr + result.stdout)
        self.assertIn('eligible', result.stdout)
        self.assertIn('not proof', result.stdout)

    def test_selected_driver_requires_eligibility_on_every_surface(self):
        for surface in ['marketing', 'operate', 'read', 'experience']:
            with self.subTest(surface=surface):
                data = record()
                data['routing'].update(surface=surface, candidates=[])
                self.rejected(data, 'selected driver')

    def test_selected_taste_requires_runtime_probe_outside_marketing(self):
        data = record()
        data['routing']['surface'] = 'experience'
        del data['routing']['candidates'][0]['runtime_probe']
        self.rejected(data, 'runtime')

    def test_evidence_level_fields_reject_wrong_types_and_unknown_levels(self):
        for field in ['required_levels', 'evidence_levels']:
            for value in ['L1 L2 L3 L4', {'L1': True, 'L2': True, 'L3': True, 'L4': True},
                          None, ['L1', 'L2', 'L3', 'L4', 'L99'],
                          ['L1', 'L2', 'L3', 'L4', True]]:
                with self.subTest(field=field, value=value):
                    data = record()
                    data[field] = value
                    result = self.check(data)
                    self.assertEqual(result.returncode, 1, result.stdout)
                    self.assertFalse(json.loads(result.stdout)['eligible'])
                    self.assertIn(field, result.stdout)
                    self.assertNotIn('Traceback', result.stderr)

    def test_optional_required_levels_can_be_omitted(self):
        data = record()
        del data['required_levels']
        self.assertEqual(self.check(data).returncode, 0)

    def builtin_technical_review(self):
        data = record()
        data['activations'].remove(activation(data, 'run-tech-audit'))
        next(i for i in data['inventory'] if i['skill'] == 'impeccable/audit').update(
            status='unavailable', reason='No installed reviewer')
        data['inventory'].append(dict(
            skill='vercel/web-design-guidelines', status='unavailable',
            reason='No installed reviewer', evidence=['tool:directory-search']))
        stage(data, 'review')['coverage']['tech-audit'] = dict(
            source='built-in', reason='No compatible installed reviewer',
            evidence=['tool:technical-review'], executor='builder')
        return data

    def test_builtin_technical_self_review_requires_sequential_mode(self):
        data = self.builtin_technical_review()
        self.rejected(data, 'independent')
        data['review_mode'] = 'sequential'
        result = self.check(data)
        self.assertEqual(result.returncode, 0, result.stdout)
        self.assertEqual(json.loads(result.stdout)['status_ceiling'], 'Passed with limitations')

    def test_builtin_technical_review_requires_an_executor(self):
        data = self.builtin_technical_review()
        del stage(data, 'review')['coverage']['tech-audit']['executor']
        self.rejected(data, 'executor')

    def test_independent_builtin_technical_review_remains_limited(self):
        data = self.builtin_technical_review()
        stage(data, 'review')['coverage']['tech-audit']['executor'] = 'manual-tech-reviewer'
        result = self.check(data)
        self.assertEqual(result.returncode, 0, result.stdout)
        self.assertEqual(json.loads(result.stdout)['status_ceiling'], 'Passed with limitations')

    def test_names_in_plan_without_execution_cannot_count_as_used(self):
        data = record()
        data['activations'] = []
        self.rejected(data, 'activation')

    def test_missing_ux_system_or_review_cannot_be_hidden_by_driver(self):
        for stage in ['foundation', 'concept', 'system', 'review']:
            with self.subTest(stage=stage):
                data = record()
                data['stages'] = [s for s in data['stages'] if s['id'] != stage]
                self.rejected(data, stage)

    def test_driver_cannot_cover_a_slot_it_does_not_own(self):
        data = record()
        stage(data, 'foundation')['coverage']['ux-analysis'] = dict(source='driver', activation='run-visual-direction')
        self.rejected(data, 'own')

    def test_driver_owned_concept_still_needs_accepted_output(self):
        data = record()
        stage(data, 'direction')['coverage']['visual-direction']['source'] = 'driver'
        stage(data, 'direction')['output'] = ''
        self.rejected(data, 'output')

    def test_failed_activation_is_not_completed_execution(self):
        data = record()
        data['activations'][0]['status'] = 'failed'
        self.rejected(data, 'succeeded')

    def test_no_skill_tool_can_use_real_instructions_and_execution_evidence(self):
        data = record()
        activation = data['activations'][0]
        activation['method'] = 'instructions'
        activation['invocation'] = 'Read instructions, run prescribed steps; tool:actual-output'
        with tempfile.TemporaryDirectory() as folder:
            source = Path(folder) / 'SKILL.md'
            source.write_text('---\nname: ui-ux-pro-max\ndescription: Test-only instructions\n---\n')
            activation['source'] = str(source)
            result = self.check(data)
        self.assertEqual(result.returncode, 0, result.stderr + result.stdout)
        activation['evidence'] = []
        self.rejected(data, 'evidence')

    def test_reading_orchestrator_does_not_count_as_executing_another_skill(self):
        data = record()
        data['activations'][0].update(method='instructions', source=str(ROOT / 'skills/uiux-orchestrator/SKILL.md'))
        self.rejected(data, 'source identity')

    def test_available_specialist_cannot_be_replaced_by_self_assessment(self):
        data = record()
        stage(data, 'foundation')['coverage']['ux-analysis'] = dict(
            source='built-in', reason='I can do this', evidence=['tool:self'])
        self.rejected(data, 'available')

    def test_genuine_unavailability_is_explicit_limited_fallback(self):
        data = record()
        data['inventory'][0]['status'] = 'unavailable'
        data['inventory'][0]['reason'] = 'No installed copy after directory search'
        for skill in ['impeccable/shape', 'impeccable/onboard']:
            data['inventory'].append(dict(skill=skill, status='unavailable',
                                          reason='No installed copy', evidence=['tool:search']))
        data['activations'] = [a for a in data['activations'] if a['id'] != 'run-ux-analysis']
        for slot in ['research-foundation', 'ux-analysis']:
            stage(data, 'foundation')['coverage'][slot] = dict(
                source='built-in', reason='No compatible installed candidate', evidence=['tool:search'])
        result = self.check(data)
        self.assertEqual(result.returncode, 0, result.stderr + result.stdout)
        self.assertIn('Passed with limitations', result.stdout)

    def test_builder_self_review_cannot_claim_independence(self):
        data = record()
        for a in data['activations']:
            if a['skill'] == 'impeccable/critique':
                a['executor'] = 'builder'
        self.rejected(data, 'independent')

    def test_sequential_review_discloses_its_limit(self):
        data = record()
        data['review_mode'] = 'sequential'
        for a in data['activations']:
            if a['skill'] in ['impeccable/critique', 'impeccable/audit']:
                a['executor'] = 'builder'
        result = self.check(data)
        self.assertEqual(result.returncode, 0, result.stderr + result.stdout)
        self.assertIn('Passed with limitations', result.stdout)

    def test_concept_cannot_be_written_after_implementation(self):
        data = record()
        data['stages'][2], data['stages'][7] = data['stages'][7], data['stages'][2]
        self.rejected(data, 'order')

    def test_missing_visual_evidence_or_failed_gate_rejects_completion(self):
        data = record()
        data['evidence_levels'].remove('L4')
        self.rejected(data, 'L4')
        data = record()
        data['gates'][0]['met'] = False
        self.rejected(data, 'gate')

    def test_requested_motion_cannot_be_skipped(self):
        data = record()
        stage(data, 'motion').update(status='skipped', reason='No time')
        self.rejected(data, 'motion')

    def test_unused_motion_can_be_deliberately_static(self):
        data = record()
        data['motion_required'] = False
        stage(data, 'motion').update(status='skipped', reason='Static composition; no transitions requested', coverage={})
        data['activations'] = [a for a in data['activations'] if a['id'] != 'run-motion-build']
        result = self.check(data)
        self.assertEqual(result.returncode, 0, result.stderr + result.stdout)

    def test_bad_json_is_a_clean_failure(self):
        result = subprocess.run([sys.executable, '-I', str(SCRIPT), '--stdin'],
                                input='{', text=True, capture_output=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertNotIn('Traceback', result.stderr)

    def test_fallback_cannot_hide_unchecked_registered_alternatives(self):
        data = record()
        data['inventory'][0].update(status='unavailable', reason='Missing')
        data['activations'] = [a for a in data['activations'] if a['id'] != 'run-ux-analysis']
        for slot in ['research-foundation', 'ux-analysis']:
            stage(data, 'foundation')['coverage'][slot] = dict(
                source='built-in', reason='Not found', evidence=['tool:partial-search'])
        self.rejected(data, 'unchecked')

    def test_declared_sequential_review_always_has_limited_ceiling(self):
        data = record()
        data['review_mode'] = 'sequential'
        result = self.check(data)
        self.assertEqual(result.returncode, 0, result.stdout)
        self.assertIn('Passed with limitations', result.stdout)

    def test_two_review_roles_need_distinct_activations(self):
        data = record()
        data['inventory'].append(dict(skill='local/reviewer', unregistered=True,
                                      slots=['ux-critique', 'tech-audit'],
                                      status='available', evidence=['tool:reviewer-check']))
        activation = data['activations'][-1]
        activation.update(skill='local/reviewer', source='reviewer', executor='reviewer')
        for slot in ['ux-critique', 'tech-audit']:
            data['stages'][-1]['coverage'][slot] = dict(source='skill', activation=activation['id'])
        self.rejected(data, 'distinct')

    def test_tool_source_cannot_be_another_skill(self):
        data = record()
        data['activations'][0].update(source='uiux-orchestrator', invocation='uiux-orchestrator target')
        self.rejected(data, 'source identity')

    def test_unregistered_skill_cannot_become_a_driver(self):
        data = record()
        data['driver'] = 'local/driver'
        data['inventory'].append(dict(skill='local/driver', unregistered=True, role='driver',
                                      slots=['visual-direction'], owns=['visual-direction'],
                                      status='available', evidence=['tool:available']))
        activation(data, 'run-visual-direction').update(skill='local/driver', source='driver')
        stage(data, 'direction')['coverage']['visual-direction']['source'] = 'driver'
        self.rejected(data, 'unregistered')

    def test_interactive_must_be_boolean_not_a_way_to_suppress_l3(self):
        data = record()
        data.update(interactive=[], evidence_levels=['L1', 'L2', 'L4'], required_levels=['L1', 'L2', 'L4'])
        self.rejected(data, 'interactive')


    def test_legacy_record_cannot_silently_skip_new_architecture(self):
        data = record()
        data['schema_version'] = 1
        self.rejected(data, 'schema_version')

    def test_foundation_is_a_separate_required_capability(self):
        data = record()
        del stage(data, 'foundation')['coverage']['research-foundation']
        self.rejected(data, 'research-foundation')

    def test_frontend_concept_adapter_needs_explicit_scoped_mode(self):
        data = record()
        del activation(data, 'run-design-reasoning')['mode']
        self.rejected(data, 'mode')

    def test_concept_adapter_cannot_take_over_art_direction(self):
        data = record()
        stage(data, 'direction')['coverage']['visual-direction'] = dict(source='skill', activation='run-design-reasoning')
        self.rejected(data, 'mode')

    def test_bounded_activation_does_not_prove_full_driver_execution(self):
        data = record()
        data['driver'] = 'anthropic/frontend-design'
        stage(data, 'direction').update(status='reused', coverage={
            'visual-direction': dict(source='project', reason='Supplied exact visual specification', evidence=['tool:spec'])})
        self.rejected(data, 'full driver activation')

    def test_web_only_concept_adapter_is_rejected_on_native(self):
        data = record()
        data['platform'] = 'ios'
        self.rejected(data, 'platform')

    def test_extra_successful_activation_cannot_add_a_second_full_driver(self):
        data = record()
        data['inventory'].append(dict(skill='impeccable/new-work', status='available', evidence=['tool:available']))
        extra = dict(activation(data, 'run-visual-direction'))
        extra.update(id='second-driver', skill='impeccable/new-work', source='impeccable', invocation='impeccable new-work target')
        data['activations'].append(extra)
        self.rejected(data, 'second full driver')

    def test_optional_coverage_cannot_expand_a_bounded_adapter(self):
        data = record()
        stage(data, 'implement')['coverage']['visual-direction'] = dict(source='skill', activation='run-design-reasoning')
        self.rejected(data, 'mode')

    def test_reused_direction_cannot_hide_an_incompatible_selected_driver(self):
        data = record()
        data['platform'] = 'ios'
        data['inventory'].extend([
            dict(skill='impeccable/shape', status='available', evidence=['tool:native-concept']),
            dict(skill='impeccable/animate', status='available', evidence=['tool:native-motion'])])
        activation(data, 'run-design-reasoning').update(skill='impeccable/shape', source='impeccable', invocation='impeccable shape target')
        activation(data, 'run-design-reasoning').pop('mode')
        activation(data, 'run-motion-build').update(skill='impeccable/animate', source='impeccable', invocation='impeccable animate target')
        stage(data, 'direction').update(status='reused', coverage={
            'visual-direction': dict(source='project', reason='Exact supplied specification', evidence=['tool:spec'])})
        self.rejected(data, 'platform')

    def test_system_must_consume_foundation_and_final_art_direction(self):
        data = record()
        stage(data, 'system')['inputs'] = ['foundation']
        self.rejected(data, 'inputs')

    def test_handoff_cannot_reference_a_future_or_unknown_stage(self):
        data = record()
        stage(data, 'concept')['inputs'] = ['foundation', 'system']
        self.rejected(data, 'inputs')

    def test_native_pipeline_does_not_require_web_only_adapter(self):
        data = record()
        data['platform'] = 'ios'
        data['driver'] = 'impeccable/new-work'
        data['routing'] = dict(surface='operate', reason='Native visual driver', candidates=[dict(
            skill='impeccable/new-work', eligible=True, reason='Compatible native driver',
            evidence=['tool:native-driver'])])
        data['inventory'].append(dict(skill='impeccable/shape', status='available', evidence=['tool:compatible-native']))
        data['inventory'].append(dict(skill='impeccable/new-work', status='available', evidence=['tool:native-driver']))
        activation(data, 'run-design-reasoning').update(skill='impeccable/shape', source='impeccable', invocation='impeccable shape target')
        activation(data, 'run-design-reasoning').pop('mode')
        activation(data, 'run-visual-direction').update(skill='impeccable/new-work', source='impeccable', invocation='impeccable new-work target')
        data['inventory'].append(dict(skill='impeccable/animate', status='available', evidence=['tool:native-motion']))
        activation(data, 'run-motion-build').update(skill='impeccable/animate', source='impeccable', invocation='impeccable animate target')
        result = self.check(data)
        self.assertEqual(result.returncode, 0, result.stderr + result.stdout)


    def test_documented_input_matrix_matches_checker(self):
        import importlib.util, re
        spec = importlib.util.spec_from_file_location('checker', SCRIPT)
        checker = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(checker)
        doc = (ROOT / 'skills/uiux-orchestrator/core/orchestration.md').read_text()
        rows = dict(re.findall(r'^\| `([a-z]+)` \| ((?:`[a-z]+`(?:, )?)+|—) \|$', doc, re.M))
        documented = {k: re.findall(r'`([a-z]+)`', v) for k, v in rows.items()}
        self.assertEqual(documented, checker.INPUTS)

    def test_marketing_driver_cannot_skip_an_eligible_taste(self):
        data = record()
        use_frontend_driver(data)
        self.rejected(data, 'eligible Taste')

    def test_user_can_explicitly_choose_another_eligible_driver(self):
        data = record()
        use_frontend_driver(data)
        data['routing']['requested_driver'] = dict(skill=data['driver'], evidence=['user:use frontend-design'])
        self.assertEqual(self.check(data).returncode, 0)

    def test_user_requested_3d_can_exclude_a_photo_only_driver(self):
        data = record()
        use_frontend_driver(data)
        data['routing']['candidates'][0].update(
            eligible=False, reason_code='brief-conflict', reason='Actual driver restricts scenes on non-tech pages',
            constraint=dict(source='user', description='Interactive 3D landmark explicitly requested',
                            evidence=['user:interactive landmark scene']))
        self.assertEqual(self.check(data).returncode, 0)

    def test_self_imposed_effect_is_not_a_reason_to_exclude_a_driver(self):
        data = record()
        use_frontend_driver(data)
        data['routing']['candidates'][0].update(
            eligible=False, reason_code='brief-conflict', reason='I decided every tourism page needs 3D',
            constraint=dict(source='agent', description='My preferred scene', evidence=['agent:concept']))
        self.rejected(data, 'self-imposed')

    def test_real_runtime_unavailability_still_allows_a_compatible_fallback(self):
        data = record()
        use_frontend_driver(data)
        data['routing']['candidates'][0].update(
            eligible=False, reason_code='runtime', reason='Observed all installed runtimes below22',
            runtime_probe=node_probe(20))
        self.assertEqual(self.check(data).returncode, 0)

    def test_runtime_exclusion_cannot_ignore_an_installed_alternate(self):
        data = record()
        candidate = data['routing']['candidates'][0]
        candidate.update(eligible=False, reason_code='runtime', reason='PATH Node is only 20',
                         runtime_probe=node_probe(20, 24))
        self.rejected(data, 'runtime')

    def test_runtime_exclusion_requires_a_probe_not_a_prose_claim(self):
        data = record()
        candidate = data['routing']['candidates'][0]
        candidate.update(eligible=False, reason_code='runtime', reason='Only Node20 installed')
        del candidate['runtime_probe']
        self.rejected(data, 'runtime')

    def test_runtime_probe_cannot_contradict_its_recorded_candidates(self):
        data = record()
        probe = data['routing']['candidates'][0]['runtime_probe']
        probe['available'] = False
        probe['selected'] = None
        self.rejected(data, 'runtime')

    def test_runtime_exclusion_cannot_invent_a_higher_minimum_than_the_skill(self):
        data = record()
        use_frontend_driver(data)
        probe = node_probe(24)
        probe.update(minimum_major=99, available=False, selected=None)
        probe['candidates'][0]['satisfies'] = False
        data['routing']['candidates'][0].update(
            eligible=False, reason_code='runtime', reason='Node99 is not installed', runtime_probe=probe)
        self.rejected(data, 'runtime')

    def test_marketing_record_needs_an_explicit_driver_decision(self):
        data = record()
        del data['routing']
        self.rejected(data, 'routing')

    def test_boolean_gates_cannot_replace_a_visual_assessment(self):
        data = record()
        del data['visual_review']
        self.rejected(data, 'visual_review')

    def test_visual_assessment_requires_observed_evidence(self):
        data = record()
        data['visual_review']['criteria'][0]['evidence'] = []
        self.rejected(data, 'visual')

    def test_visual_rejection_cannot_be_overruled_by_a_green_workflow_gate(self):
        data = record()
        data['visual_review']['criteria'][0]['verdict'] = 'fail'
        self.rejected(data, 'visual')

    def test_unverified_visual_dimension_cannot_count_as_passed(self):
        data = record()
        data['visual_review']['criteria'][-1]['verdict'] = 'unverified'
        self.rejected(data, 'visual')

    def test_technical_auditor_cannot_stand_in_for_the_visual_reviewer(self):
        data = record()
        data['visual_review']['activation'] = 'run-tech-audit'
        self.rejected(data, 'visual')

    def test_unavailable_design_reviewer_can_use_an_explicit_limited_builtin_assessment(self):
        data = record()
        use_builtin_design_review(data)
        result = self.check(data)
        self.assertEqual(result.returncode, 0, result.stdout)
        self.assertIn('Passed with limitations', result.stdout)

    def test_builtin_visual_self_review_cannot_claim_independence(self):
        data = record()
        use_builtin_design_review(data, executor='builder')
        self.rejected(data, 'independent')
        data['review_mode'] = 'sequential'
        self.assertEqual(self.check(data).returncode, 0)

    def test_negative_feedback_can_be_resolved_by_a_fresh_builtin_review(self):
        data = record()
        use_builtin_design_review(data)
        visual = data['visual_review']
        visual['previous_reviews'] = [dict(
            id=visual['id'], source='built-in', executor=visual['executor'],
            summary='Earlier assessment before user criticism', evidence=['review:before'])]
        visual['id'] = 'manual-review-after-fix'
        visual['user_feedback'] = dict(
            status='changes-requested', evidence=['user:the composition misses the brief'],
            previous_review='manual-review', resolution=dict(
                review=visual['id'], summary='Revised composition and observed new renders',
                evidence=['render:after']))
        result = self.check(data)
        self.assertEqual(result.returncode, 0, result.stdout)
        self.assertIn('Passed with limitations', result.stdout)

        visual['id'] = 'manual-review'
        visual['user_feedback']['resolution']['review'] = visual['id']
        self.rejected(data, 'review')

    def test_negative_user_feedback_reopens_an_otherwise_green_record(self):
        data = record()
        data['visual_review']['user_feedback'] = dict(
            status='changes-requested', evidence=['user:generic look, weak motion and color'])
        self.rejected(data, 'user feedback')

    def test_no_user_approval_is_required_when_no_feedback_was_received(self):
        data = record()
        data['visual_review']['user_feedback'] = dict(status='not-received')
        self.assertEqual(self.check(data).returncode, 0)

    def test_negative_feedback_can_be_resolved_by_a_new_review_without_another_approval_gate(self):
        data = record()
        previous = activation(data, 'run-ux-critique')
        renewed = dict(previous, id='new-rendered-review', evidence=['render:after-fix'])
        data['activations'].append(renewed)
        stage(data, 'review')['coverage']['ux-critique']['activation'] = renewed['id']
        data['visual_review'].update(
            activation=renewed['id'], user_feedback=dict(
                status='changes-requested', evidence=['user:weak contrast and identity'],
                previous_activation=previous['id'], resolution=dict(
                    activation=renewed['id'], summary='Changed direction and inspected fresh renders',
                    evidence=['render:after-fix'])))
        self.assertEqual(self.check(data).returncode, 0)

    def test_negative_feedback_cannot_reference_an_unrelated_or_failed_activation(self):
        for previous_id in ['run-motion-build', 'failed-ux-review']:
            with self.subTest(previous_id=previous_id):
                data = record()
                data['activations'].append(dict(
                    activation(data, 'run-ux-critique'), id='failed-ux-review', status='failed'))
                data['visual_review']['user_feedback'] = dict(
                    status='changes-requested', evidence=['user:composition rejected'],
                    previous_activation=previous_id, resolution=dict(
                        activation='run-ux-critique', summary='Reusing original review',
                        evidence=['render:original']))
                self.rejected(data, 'previous')


if __name__ == '__main__':
    unittest.main()
