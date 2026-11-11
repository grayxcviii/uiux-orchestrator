#!/usr/bin/env python3
"""Score routing decisions against tests/scenarios.json. Python 3 stdlib only.

Usage:
  python3 scripts/score_routing.py RESULTS.json [...] [--label NAME] [--md OUT.md]
                                   [--key SCENARIOS.json] [--normalize-intents]

Each RESULTS file is a JSON array of decision objects (schema: tests/harness/README.md).
Skill references may be registry ids ("emil/animate") or installed names ("animate",
"impeccable critique", "gsap-scrolltrigger"); names are mapped to ids via the registry.
"""
import json
import pathlib
import re
import sys
from collections import defaultdict

ROOT = pathlib.Path(__file__).resolve().parent.parent
REGISTRY = ROOT / "skills" / "uiux-orchestrator" / "registry" / "skills.yaml"
SCENARIOS = ROOT / "tests" / "scenarios.json"
INTENT_ALIASES = {"review": "ui-review", "design": "new-ui-design", "improvement": "ui-improvement",
                  "bug-fix": "ui-bug-fix", "new-ui": "new-ui-design", "implementation": "ui-implementation"}
NORMALIZE = False  # --normalize-intents maps workflow-style words to intent ids
STATUS_RANK = {"passed": 0, "passed with limitations": 1, "needs review": 2, "failed": 3}
IMPECCABLE_CMDS = {
    "critique": "critique", "audit": "audit", "polish": "polish", "typeset": "typeset",
    "colorize": "colorize", "layout": "layout", "adapt": "adapt", "harden": "harden",
    "clarify": "clarify", "onboard": "onboard", "animate": "animate", "optimize": "optimize",
    "shape": "shape", "document": "document", "extract": "document", "live": "live",
    "generate": "live", "bolder": "tone", "quieter": "tone", "distill": "tone", "delight": "tone",
    "overdrive": "tone", "tone": "tone", "new-work": "new-work", "craft": "new-work", "init": "new-work",
}


def load_name_map():
    """Map installed names → registry ids by scanning the registry text (no YAML lib needed)."""
    text = REGISTRY.read_text()
    ids, name_map = set(), {}
    # block entries: "- id: x" followed (within a few lines) by "names: [...]"
    for m in re.finditer(r"id:\s*([a-z0-9]+/[a-z0-9-]+)(.*?)(?=\n\s*- (?:\{?\s*)?id:|\n  - provider:|\nreferences:|\Z)", text, re.S):
        sid, body = m.group(1), m.group(2)
        if sid.startswith("ref/"):
            continue
        ids.add(sid)
        nm = re.search(r"names:\s*\[([^\]]*)\]", body)
        if nm and not sid.startswith("impeccable/"):
            for n in nm.group(1).split(","):
                n = n.split("#")[0].strip().strip('"').strip("'")
                if n:
                    name_map.setdefault(n.lower(), sid)
    for sid in ids:
        name_map.setdefault(sid.split("/", 1)[1], sid)  # bare skill part, lowest priority
    # canonical installed names that differ from id suffix
    name_map.update({"ui-ux-pro-max": "uupm/search", "design-taste-frontend": "taste/design-taste-frontend",
                     "magic-ui": "magicui/components", "shadcn": "shadcn/ui", "emil-design-eng": "emil/design-eng"})
    return ids, name_map


IDS, NAME_MAP = load_name_map()


def to_id(ref):
    """Normalize one skill reference to a registry id (or 'unknown:<ref>')."""
    r = ref.strip().lower().lstrip("/")
    if r.startswith("apple-design"):
        return "dickwu/apple-design" if "dickwu" in r else "emil/apple-design"
    r = re.sub(r"\s*\(.*\)$", "", r)
    if r in IDS:
        return r
    if r.startswith("impeccable"):
        rest = re.split(r"[\s:/]+", r, maxsplit=1)
        cmd = rest[1].split()[0] if len(rest) > 1 and rest[1] else "new-work"
        return "impeccable/" + IMPECCABLE_CMDS.get(cmd, cmd)
    if r.startswith("ui-ux-pro-max") or r.startswith("uupm"):
        return "uupm/design-system" if "design-system" in r else "uupm/search"
    if r in NAME_MAP:
        return NAME_MAP[r]
    base = r.split(":")[-1].split()[0]
    return NAME_MAP.get(base, "unknown:" + ref)


def score_one(exp, dec, with_skill):
    e = exp["expected"]
    res = {}
    plats = [e["platform"]] + e.get("platform_alternatives", [])
    got_p = dec.get("platform")
    res["platform"] = all(x in plats for x in got_p) if isinstance(got_p, list) and got_p else got_p in plats
    intents = [INTENT_ALIASES.get(str(i).lower(), str(i).lower()) for i in (dec.get("intents") or [])] if NORMALIZE else (dec.get("intents") or [])
    res["intent"] = bool(intents) and intents[0] in e["intent"]
    res["workflow"] = dec.get("workflow") in e["workflow"]
    if with_skill and e.get("fast_path") is not None:
        res["fast_path"] = bool(dec.get("fast_path")) == e["fast_path"]
    res["mutation"] = dec.get("mutation") == e["mutation"]
    sel = sorted({to_id(s) for s in dec.get("selected_skills") or []})
    must_ok = all(any(g in sel for g in group) for group in e["must_select"])
    violations = [s for s in sel if s in e["must_not_select"]]
    allowed = {g for group in e["must_select"] for g in group} | set(e["may_select"])
    unnecessary = [s for s in sel if s not in allowed]
    res["skills"] = must_ok and not violations
    rec = {to_id(s) for s in dec.get("recommended_to_user") or []}
    if e.get("must_recommend"):
        res["recommend"] = all(r in rec for r in e["must_recommend"])
    exp_driver = e.get("driver")
    got_driver = to_id(dec["driver"]) if dec.get("driver") else None
    if exp_driver is None:
        res["driver"] = got_driver is None
    else:
        allowed_drivers = exp_driver if isinstance(exp_driver, list) else [exp_driver]
        res["driver"] = got_driver in allowed_drivers
    if e.get("must_ask") is not None:
        res["ask"] = bool(dec.get("asks_user")) == e["must_ask"]
    st = STATUS_RANK.get(str(dec.get("best_status", "")).strip().lower())
    res["status"] = st is not None and st >= STATUS_RANK[e["max_status"].lower()]
    if e.get("mode"):
        res["mode"] = dec.get("mode") in e["mode"]
    return res, sel, violations, unnecessary


def main():
    global NORMALIZE, SCENARIOS
    args = sys.argv[1:]
    label, md_out, files = "run", None, []
    i = 0
    while i < len(args):
        if args[i] == "--label":
            label = args[i + 1]; i += 2
        elif args[i] == "--normalize-intents":
            NORMALIZE = True; i += 1
        elif args[i] == "--key":
            SCENARIOS = pathlib.Path(args[i + 1]); i += 2
        elif args[i] == "--md":
            md_out = args[i + 1]; i += 2
        else:
            files.append(args[i]); i += 1
    scenarios = {s["id"]: s for s in json.loads(SCENARIOS.read_text())["scenarios"]}
    decisions = []
    for f in files:
        for d in json.loads(pathlib.Path(f).read_text()):
            decisions.append(d)
    with_skill = any("skill_files_consulted" in d for d in decisions)

    totals = defaultdict(lambda: [0, 0])
    sel_total = unnecessary_total = 0
    failures = []
    files_counts, registry_full = [], 0
    seen = defaultdict(int)
    for d in decisions:
        sid = d.get("id")
        if sid not in scenarios:
            failures.append(f"{sid}: unknown scenario id")
            continue
        seen[sid] += 1
        res, sel, viol, unnec = score_one(scenarios[sid], d, with_skill)
        for k, ok in res.items():
            totals[k][0] += int(ok)
            totals[k][1] += 1
        sel_total += len(sel)
        unnecessary_total += len(unnec)
        bad = [k for k, ok in res.items() if not ok]
        if bad or unnec:
            e = scenarios[sid]["expected"]
            failures.append(
                f"{sid}: failed {bad or '-'}; selected={sel}; must={e['must_select']}; "
                f"violations={viol}; unnecessary={unnec}; got platform={d.get('platform')} "
                f"workflow={d.get('workflow')} intents={d.get('intents')} fast_path={d.get('fast_path')} "
                f"driver={d.get('driver')} status={d.get('best_status')} mode={d.get('mode')}")
        if "skill_files_consulted" in d:
            files_counts.append(len(d["skill_files_consulted"]))
            registry_full += int(bool(d.get("registry_read_fully")))
    missing = [s for s in scenarios if seen[s] == 0]

    names = {"platform": "1. Platform detection", "intent": "2. Intent classification",
             "workflow": "3. Workflow selection", "skills": "4. Skill selection (must ∧ ¬must-not)",
             "fast_path": "Fast-path decision", "mutation": "Mutation permission", "driver": "Driver choice",
             "recommend": "Recommendations (user-invoked / install hints)", "ask": "Ask-user decision",
             "status": "Status honesty (≤ best reachable)", "mode": "Execution mode"}
    lines = [f"## {label}", "", f"Decisions scored: {len(decisions)} (scenarios: {len(seen)}; missing: {missing or 'none'})", "",
             "| Metric | Correct | Total | Rate |", "|---|---|---|---|"]
    for k in ["platform", "intent", "workflow", "skills", "fast_path", "mutation", "driver", "recommend", "ask", "status", "mode"]:
        if totals[k][1]:
            c, t = totals[k]
            lines.append(f"| {names[k]} | {c} | {t} | {100 * c / t:.0f}% |")
    rate = (100 * unnecessary_total / sel_total) if sel_total else 0.0
    lines.append(f"| 5. Unnecessary skill invocations | {unnecessary_total} | {sel_total} selected | {rate:.0f}% |")
    if files_counts:
        avg = sum(files_counts) / len(files_counts)
        lines.append(f"| Skill files consulted per scenario (avg) | — | {len(files_counts)} | {avg:.1f} files |")
        lines.append(f"| Registry read in full | {registry_full} | {len(files_counts)} | {100 * registry_full / len(files_counts):.0f}% |")
    lines += ["", "### Mismatches", ""] + ([f"- {x}" for x in failures] or ["- none"])
    out = "\n".join(lines) + "\n"
    print(out)
    if md_out:
        pathlib.Path(md_out).write_text(out)


if __name__ == "__main__":
    main()
