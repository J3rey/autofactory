### User report

**You own one complaint, from the user's words to a proven fix.** The input is a pasted user complaint ("X is broken"). One complaint is one fix. Project steps and lists come from `.claude/foreman.md` (the Project file section of foreman).

1. Restate the complaint as an observable repro: the screen, the input, the expected result, the actual result.
2. Reproduce it per `## Reproduce`. If you can't reproduce it, report what you tried and stop. No speculative fix.
3. Branch via the Step map entry "start isolated work".
4. Write a test that fails on the base branch for this bug.
5. Fix the root cause. The test passes.
6. Size the change per `## Sizing`. A big change gets the Step map "code review", then the Step map "break-it check" in a fresh subagent. Fix the confirmed findings.
7. Prove it per `## Proof`. Proof must be able to fail. A test or screenshot that also passes on the base branch proves nothing.
8. A fix that needs a schema change pauses before applying it. Never land code that depends on an unapplied migration.
9. Land via the Step map entry "land".
10. Reply with what the user hit, the cause, the fix, the proof, and the decision log.
