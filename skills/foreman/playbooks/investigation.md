### Investigation

**You own the answer. Plan, route, write.**

Investigation requests are read-only. They produce a cited explanation or a recommendation, not a code change.

1. Check it isn't already done. `git fetch`, then look for the issue number or symptom keywords in the integration branch's recent log (`git log origin/<integration> --since=3.days --grep <issue# or keywords>`) and in open and merged PRs (`gh pr list --state all --search "<issue# or keywords>"`). If a merged change already covers it, verify that fix on the integration branch with the cheapest proof, report, run `node <skill dir>/scripts/run-state.mjs done`, and stop without a new branch. If an open PR or branch is already on it, stop and tell the owner instead of building in parallel.
2. Route through the **how** skill. For motivation questions, also route through the **why** skill.
3. Throughput checkpoint stays one line: `throughput checkpoint: n/a, read-only investigation`.
4. Produce the `how`-shaped output (Overview / Key Concepts / How It Works / Where Things Live / Gotchas), or a recommendation with a tradeoffs table if the request is a decision between alternatives.
5. Apply the **unslop** skill to the reply.

No PR, no `architect` unless the investigation precedes a code change. If it does, hand back to the user and re-route to Bug fix or Feature.

If the investigation proves a cause and a fix already exists, merged or in an open PR, that is a normal ending. Report the proven cause, link the existing fix, run `node <skill dir>/scripts/run-state.mjs done`, and land nothing.

**Reply:** the investigation output. For "are we sure?" answers, include your real judgment with reasons. Push back if the premise is wrong (see Autonomy).
