### Merge batch

**You own the landing, not the code. Work out how the PRs depend on each other, check each one, and land the passing ones on the integration branch one at a time, in order.** The PRs are finished work by someone else. Your job is to get the good ones landed safely and to say plainly why the rest are not.

Starting this recipe on a named batch is the owner's yes to rebase each batch branch, push it with `--force-with-lease`, land it, and delete it, as the `land` step does. That yes covers only the batch branches. If a lease check fails, the author pushed again. Stop that PR and re-check it at its new head.

Keep the batch state in `.claude/foreman/merge-batch.md`: each PR's number, head SHA, relationship, verdict, and outcome. Update it after every step so a restart can pick up from it.

1. List the batch. Take the PR numbers the owner named, or the open PRs that match the owner's filter, such as an author or a label (`gh pr list --state open --author <login> --json number,title,headRefName,baseRefName,headRefOid,isDraft,body`). Drop any PR whose changes are already on the integration branch (`git cherry origin/<integration> <head>` shows no `+` lines) and record it as already landed. A draft PR is not ready. Record it as skipped and leave it alone. Before you start, check that no other session or open run is landing the same PRs.
2. Map how the PRs relate. For each PR, record one of three relationships, with the evidence beside it.
   - **Stacked.** Its base branch is another batch PR's head branch, or its commits include another batch PR's commits (`git merge-base --is-ancestor <other head> <this head>`).
   - **Depends.** The author's PR text says so ("needs #12", "after #12"), or it fails the project typecheck or tests when rebased onto the integration branch alone and passes with the other PR applied first. Run this check in a throwaway worktree.
   - **Independent.** It passes against the integration branch alone. Note which other batch PRs touch the same files (`gh pr view <n> --json files`) and which hit conflicts (`git merge-tree --write-tree origin/<integration> <head>`). Shared files change the landing order, not the relationship.
   When the evidence does not settle a relationship, pause and ask the owner. Never guess an order. Write the result as an ordered list of chains and loose PRs, parents first.
3. Check each PR on its own, in its own throwaway worktree, with at most three subagents at a time (`subagent_type: "autofactory:foreman-agent"`, `model: "sonnet"`). Each check rebases a copy of the PR onto the integration branch, or onto its parent for a stacked or dependent PR, and never pushes. It runs the project's typecheck and tests, sizes the change per `## Sizing`, and proves it per `## Proof`. A big change also gets the Step map's code review and break-it check. Each check returns PASS or FAIL with the reason and the head SHA it judged. A verdict covers that SHA only.
4. Handle each failure. A fix that is small and obvious, with its cause proven, goes on the PR branch as its own commit with a message that names the cause, then the PR is checked again. Log the fix via **show-me-your-work**. Any other failure stays failed, and every PR that depends on it is blocked. A PR whose change needs a schema migration, a paid service, or a product call pauses per Autonomy.
5. Land, one PR at a time, in the order from step 2. Never land two at once.
   - Land the next PR with the Step map's `land` entry. Without one, `gh pr merge <n> --rebase --delete-branch`. When the PR's big-change review already ran in step 3 at this head, tell the `land` skill so it does not review again.
   - Before landing, check that the PR's head SHA still matches its verdict. A new head needs a new check.
   - After each landing, rebase the next PR onto the new integration tip. A stacked child that still carries its old parent's commits rebases with `git rebase --onto origin/<integration> <old parent tip> <child>`. Re-run its typecheck and tests when the rebase had conflicts or touched files the landed PR changed.
   - A failed PR stops only its own chain. Independent PRs keep landing.
6. Report. Write the final state into `.claude/foreman/merge-batch.md`. For each PR not landed, draft a short note to its author in plain words: what failed, the evidence, and what would fix it. Leave posting the note to the owner.

The production branch never moves in this recipe. Landing stops at the integration branch.

**Reply:** what landed, with each PR link and the landing order. Then what failed and why, which PRs that blocked, what was skipped, and the decisions waiting on the owner. Link the batch file.
