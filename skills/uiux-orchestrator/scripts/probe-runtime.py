"""Observe installed Node runtimes without installing or changing the environment.

Usage: python3 -I probe-runtime.py --min-node 22
Prints JSON; exit 0 = a compatible binary was observed, 1 = none, 2 = invalid arguments.
Invoke the selected absolute path directly; no `nvm use` or PATH mutation is needed.
"""
import argparse
import json
import os
from pathlib import Path
import re
import subprocess


def probe_node(minimum_major=22, *, path_env=None, user_dir=None, env=None):
    if type(minimum_major) is not int or minimum_major < 1:
        raise ValueError('minimum Node major must be a positive integer')
    settings = os.environ if env is None else env
    search_path = settings.get('PATH', '') if path_env is None else path_env
    profile = Path.home() if user_dir is None else Path(user_dir)
    paths = []

    def add(path, source):
        path = Path(path).expanduser()
        if path.is_file() and os.access(path, os.X_OK):
            paths.append((path.resolve(), source))

    # Empty PATH entries must not execute an unrelated project-local "node".
    for directory in filter(None, search_path.split(os.pathsep)):
        for name in ('node', 'node.exe'):
            add(Path(directory) / name, 'PATH')
    managers = [
        (Path(settings.get('NVM_DIR') or profile / '.nvm'), 'versions/node/*/bin/node', 'nvm'),
        (Path(settings.get('NVM_HOME') or profile / '.nvm'), 'v*/node.exe', 'nvm-windows'),
        (Path(settings.get('VOLTA_HOME') or profile / '.volta'), 'tools/image/node/*/bin/node', 'volta'),
        (Path(settings.get('FNM_DIR') or profile / '.local/share/fnm'), 'node-versions/*/installation/bin/node', 'fnm'),
        (profile / 'Library/Application Support/fnm', 'node-versions/*/installation/bin/node', 'fnm'),
        (profile / '.fnm', 'node-versions/*/installation/bin/node', 'fnm'),
        (Path(settings.get('MISE_DATA_DIR') or profile / '.local/share/mise'), 'installs/node/*/bin/node', 'mise'),
        (Path(settings.get('ASDF_DATA_DIR') or profile / '.asdf'), 'installs/nodejs/*/bin/node', 'asdf'),
    ]
    for directory, pattern, source in managers:
        for path in sorted(directory.glob(pattern)):
            add(path, source)
    # Common system locations may not be on the calling agent's PATH.
    if user_dir is None:
        for path in ('/opt/homebrew/bin/node', '/usr/local/bin/node', '/usr/bin/node'):
            add(path, 'system')

    observed, errors, seen = [], [], set()
    for path, source in paths:
        if path in seen:
            continue
        seen.add(path)
        try:
            result = subprocess.run([str(path), '--version'], capture_output=True, text=True,
                                    timeout=5, check=False)
            version = result.stdout.strip()
            match = re.fullmatch(r'v(\d+)\.\d+\.\d+(?:[-+][\w.-]+)?', version)
            if result.returncode or not match:
                errors.append(dict(path=str(path), error='Node --version failed or returned an invalid version'))
                continue
            major = int(match[1])
            observed.append(dict(path=str(path), version=version, major=major, source=source,
                                 satisfies=major >= minimum_major))
        except (OSError, subprocess.TimeoutExpired, UnicodeError) as exc:
            errors.append(dict(path=str(path), error=type(exc).__name__))
    selected = next((item for item in observed if item['satisfies']), None)
    return dict(runtime='node', minimum_major=minimum_major, available=selected is not None,
                selected=selected, candidates=observed, errors=errors,
                environment_changed=False, installation_performed=False)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--min-node', type=int, default=22)
    args = parser.parse_args()
    if args.min_node < 1:
        parser.error('--min-node must be positive')
    result = probe_node(args.min_node)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result['available'] else 1


if __name__ == '__main__':
    raise SystemExit(main())
