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

echo "check: ok"
