### Feature

**You own the design. Plan, review, verify.** Delegate implementation. Stay in the lead.

1. Check it isn't already done. `git fetch`, then look for the issue number or symptom keywords in the integration branch's recent log (`git log origin/<integration> --since=3.days --grep <issue# or keywords>`) and in open and merged PRs (`gh pr list --state all --search "<issue# or keywords>"`). If a merged change already covers it, verify that fix on the integration branch with the cheapest proof, report, set the run `done`, and stop without a new branch. If an open PR or branch is already on it, stop and tell the owner instead of building in parallel.
2. `how` over the affected subsystem.
3. Shape: if the ask is unclear (it doesn't say who it's for, what done looks like, or which screen or surface), run the **shape** skill, or the project's Step map entry for `Shape` if it names one. Skip when the job is already specific, and log the skip.
4. `architect` to sketch the design.
5. Write the throughput checkpoint as four task-list items. A dimension that genuinely does not apply (single file, no fan-out) keeps its item with `n/a: <reason>` rather than being dropped:
   - **Blocking first steps.** Gates run before fan-out.
   - **Independent workstreams.** Disjoint files, services, or layers parallelize. Shared writes serialize.
   - **Shared mutable state.** Default to splitting the target (the **Separate Before Serializing Shared State** principle). Serialize only for real invariants.
   - **Smallest safe decomposition.** If one worker is best, name why.
6. Delegate code-writing to a subagent using `model: "sonnet"`, `effort: "high"` (the code-delegate default) with a specific scope (file paths, named data shape and its organizing structure per **Model the Domain**, a state machine over scattered booleans, a table/registry over branching, a typed model over repeated shape assumptions, chosen before the delegate writes logic, and success criteria). Pick each subagent's reasoning level for the job, per the Subagents section. No "standing by" reply that waits on a nested agent. Comments per **Comments**. Surgical edits, re-ground against the source for upstream-derived files. Port shared-primitive improvements to all consumers and verify each. Commit liberally, unless the project sets its own commit granularity.
7. Verify on the matching surface. "Inconclusive" or wrong-surface is not a pass. Flag it.
8. Unless the project sets its own commit granularity, rebase into small, ordered commits. Stack follow-ups.
   Use the **Sequence Work into Verifiable Units** principle, building, verifying, and committing each small unit before the next.
9. Run **Opening a PR**.

Code-coupled work (one feature, one migration) goes to a single owner with the checkpoint inline. That owner fans out internally after the blocking phase. Parent-level fan-out is for slices that produce independent artifacts (audits, cross-subsystem investigations, competing experiments). Rewrite the checkpoint at phase boundaries. Spawn a fresh owner rather than chaining interrupts.

**Reply:** what you built, what you chose and why, the throughput checkpoint, open decisions. Tables for design alternatives.
