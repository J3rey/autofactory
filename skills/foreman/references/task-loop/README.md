# Task loop

The build loop for multi-task work: a fresh implementer per task, a task review after each, a capped fix loop, one final review. Adapted from the subagent-driven-development skill in superpowers by Jesse Vincent (MIT, see `LICENSE`). The templates next to this file are the dispatch prompts. The controller is the chat running the playbook. It never writes the code or fixes findings itself.

**When.** Feature and Multi-phase plan steps that delegate code over two or more tasks, and big Bug fix changes. A single small task (the project's Sizing calls it small) skips the reviewer. Parallel slices go through the **swarm** skill instead.

**Files.** All under `.claude/foreman/` (gitignored): `tasks/task-N-brief.md` (the task text from the plan or the recipe's task list, with exact values), `tasks/task-N-report.md` (the implementer's report), `tasks/task-N-review.diff` (commit list, `git diff --stat`, `git diff -U10` for BASE..HEAD), and the ledger `progress.md`.

**Ledger.** First line `# Task loop ledger, plan: <plan path or job>`. One line per event: `Task N: dispatched, base <sha>`, `Task N: done, head <sha>, status <status>`, `Task N: fix round R/5 (<addressed>, <open>)`, `Task N: complete (<base7>..<head7>, review clean)`, `Ruling: <what> - <why> - <cost if wrong>`. After a compaction or restart, read the ledger and `git log` first. A task with a `complete` line is done, never re-dispatch it. A task whose last line is a fix round resumes at the next round.

## The loop

1. Take one task at a time. Batch tiny same-shape edits (the same change repeated across files) into one task with one brief listing every file and its change. Never run two implementers on the same checkout at once.
2. Write the brief file. Record BASE (`git rev-parse HEAD`) in the ledger. Dispatch `implementer-prompt.md` with `subagent_type: "autofactory:foreman-agent"`, model and effort per the Subagents section. The dispatch holds one line on where the task fits, the brief path, interfaces from earlier tasks, and the report path. Not the session's history.
3. Act on the status.
   - **DONE.** Write the review diff from BASE to HEAD and dispatch `task-reviewer-prompt.md`.
   - **DONE_WITH_CONCERNS.** Read the concerns. Correctness or scope doubts get settled before review. Observations go to the ledger and the review proceeds.
   - **NEEDS_CONTEXT.** Answer, then re-dispatch or continue the agent with `SendMessage`.
   - **BLOCKED.** Change something: more context, a more capable model (`opus`), a smaller task, or a ruling on a plan defect. Never retry unchanged.
4. Read the review. Done needs Spec compliant and Task quality approved. Treat each "cannot verify from diff" item yourself before closing the task. A confirmed gap counts as a failed spec check. Minor findings go to the ledger (`minor (deferred)`) and never enter the loop.
5. Fix loop, five rounds at most. A round is one fix dispatch plus one scoped `re-review-prompt.md` over the fix range. Rounds 1 to 3 go to the same implementer through `SendMessage` while it still runs, else a fresh implementer with the brief path, the report path and the findings pasted. Round 4 and later use a fresh `opus` implementer: "a prior implementer tried this N times, you own it now, read the report". The implementer appends its fix report (covering tests, command, output) before each re-review.
6. At round 5 with findings still open, stop dispatching. Pause the run per `playbooks/pause-safely.md` and tell the owner each open finding and what was tried. Do not rule it away.
7. Mark the task complete in the ledger, then the next task.
8. After the last task, run the final whole-branch review once. When the change is big per the project's Sizing, that is the Step map `Code review` (or the **interrogate** skill without one). Otherwise one `task-reviewer-prompt.md` pass over the whole branch diff (merge base to HEAD). Point it at the ledger's deferred minors. Findings go to one fix dispatch and one scoped re-review. Then land.

Never fix findings in the controller session. Never skip the task review for a task the Sizing doesn't call small. Reviewers don't re-run the suite. The implementer's report is the test evidence.
