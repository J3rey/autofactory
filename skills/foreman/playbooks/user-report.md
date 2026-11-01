### User report

**You own one complaint, from the user's words to a proven fix.** The input is a pasted user complaint ("X is broken"). One complaint is one fix. Project steps and lists come from `.claude/foreman.md` (the Project file section of foreman).

1. Restate the complaint as an observable repro: the screen, the input, the expected result, the actual result.
2. Reproduce it per `## Reproduce`. If you can't reproduce it: mark steps 3-9 `skip: not reproduced`, set `.claude/foreman/run.json` to `done`, and reply with what you tried. No speculative fix.
3. Branch via the Step map entry "start isolated work".
4. Write a test that fails on the base branch for this bug.
5. Fix the root cause. The test passes. If the fix needs a schema change, write the migration file and code on the branch, then pause. After the yes, apply it per the project's rules, verify, re-prove, then continue at step 6. Never land code that depends on an unapplied migration.
6. Size the change per `## Sizing`. A big change gets the Step map "code review", then the Step map "break-it check" in a fresh subagent. Fix the confirmed findings.
7. Prove it per `## Proof`. Proof must be able to fail. A test or screenshot that also passes on the base branch proves nothing.
8. Land via the Step map entry "land".
9. Reply with what the user hit, the cause, the fix, the proof, and the decision log.
