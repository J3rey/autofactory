### User report

**You own one complaint, from the user's words to a proven fix.** The input is a pasted user complaint ("X is broken"). One complaint is one fix. Project steps and lists come from `.claude/foreman.md` (the Project file section of foreman).

1. Check it isn't already done. `git fetch`, then look for the issue number or symptom keywords in the integration branch's recent log (`git log origin/<integration> --since=3.days --grep <issue# or keywords>`) and in open and merged PRs (`gh pr list --state all --search "<issue# or keywords>"`). If a merged change already covers it, verify that fix on the integration branch with the cheapest proof, report, run `node <skill dir>/scripts/run-state.mjs done`, and stop without a new branch. Also check local work: `git worktree list` and `git branch -a --list '*<issue#>*'`, and, if a tool that lists the owner's other Claude sessions is available (find it with tool search if deferred), whether another live session is on this issue. If an open PR, branch, worktree or live session is already on it, stop and tell the owner instead of building in parallel.
2. Restate the complaint as an observable repro: the screen, the input, the expected result, the actual result.
3. Reproduce it per `## Reproduce`. If you can't reproduce it: mark steps 4-10 `skip: not reproduced`, run `node <skill dir>/scripts/run-state.mjs done`, and reply with what you tried. No speculative fix.
4. Branch via the Step map entry "start isolated work", unless the session already sits in a fresh worktree (see Project file in foreman).
5. Write a test that fails on the base branch for this bug.
6. Fix the root cause. The test passes. If the fix needs a schema change, write the migration file and code on the branch, then pause. After the yes, apply it per the project's rules, verify, re-prove, then continue at step 7. Never land code that depends on an unapplied migration.
7. Size the change per `## Sizing`. A big change gets the Step map "code review", then the Step map "break-it check" in a fresh subagent. Fix the confirmed findings.
8. Prove it per `## Proof`. Proof must be able to fail. A test or screenshot that also passes on the base branch proves nothing.
9. Land via the Step map entry "land".
10. Reply with what the user hit, the cause, the fix, the proof, and the decision log.
