#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

# (a) manifest + skills validate
claude plugin validate .

# (b) nothing project-specific leaks into the plugin (this script is excluded so its own pattern doesn't match)
if grep -rniE 'loopy|betteryourads|lucentwooo|pnwnorqczyzqsxklaqbh|tryloopy' --exclude-dir=.git --exclude=check.sh .; then
  echo "check: leak found" >&2
  exit 1
fi

# (c) poteto-mode / pstack: names are fully renamed (README.md and UPSTREAM.md keep credit prose)
if grep -rnE 'poteto-mode|poteto-agent|pstack:' --exclude-dir=.git --exclude=UPSTREAM.md --exclude=README.md skills agents docs; then
  echo "check: stale pstack names found" >&2
  exit 1
fi

# (d) Claude models only: no Grok/GPT slugs in skills or agents
if grep -rniE 'grok|gpt-[0-9]' skills agents; then
  echo "check: non-Claude model slug found" >&2
  exit 1
fi

# (e) the user-report recipe exists and is registered
test -f skills/foreman/playbooks/user-report.md && grep -q 'user-report.md' skills/foreman/SKILL.md

echo "check: ok"
