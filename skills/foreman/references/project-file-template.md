# Foreman project file

Copy this to `<repo>/.claude/foreman.md` and fill it in. Foreman reads it at the start of every task. Delete any section you don't need.

## Step map

Foreman step to the project skill that does it. An entry here overrides the plugin skill for that step.

| Foreman step | Project skill |
|---|---|
| start isolated work | `new-worktree-branch` |
| code review | `code-review` |
| break-it check | `adversarial-verification` |
| land | `finalize-worktree` |

## Sizing

A change is big if it touches anything on the big list. Everything else is small. Big changes get a code review and a break-it check in a fresh subagent before landing.

- Big: auth or permissions, anything touching money, schema changes, a new API route, a change too wide to hold in your head.
- Small: copy, styling, a helper tweak, a bug fix inside one function, config bumps.

## Proof

Where the change is observable, and the proof that counts.

| Change observable in | Proof |
|---|---|
| UI | A screenshot of the fixed screen, taken on the real app. |
| API route | A request and its response, run against the local server. |
| Pure logic | A unit test that fails on the base branch and passes on the fix. |

## Always pause

Added to the plugin's always-pause list. Foreman asks one question and ends the turn before doing any of these.

- Applying a database migration.
- Spending on a paid third-party API.

## Reproduce

Where a repro may run and what it may read. Anything outside this list pauses first.

- Run: the local dev server with a seeded test account.
- Read: local files and the dev database. Never production data.

**Gitignore.** Foreman keeps per-run state in `.claude/foreman/`. Add this line to the project's `.gitignore`:

```
.claude/foreman/
```
