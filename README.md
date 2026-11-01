# autofactory

An agentic software factory for Claude Code. One `foreman` skill routes every job through plan, build, review and ship.

## Install

```
/plugin marketplace add J3rey/autofactory
/plugin install autofactory@autofactory
```

## Start

```
/autofactory:foreman <job>
```

## How a run works

1. `/autofactory:foreman <job>` starts it. Foreman marks the run as `running` in `.claude/foreman/run.json` itself as its first action. A `UserPromptSubmit` hook does the same when the command is typed directly. A second run in the same folder is flagged as a clash, and foreman pauses for you instead of overwriting the first.
2. Foreman reads `<repo>/.claude/foreman.md` if the project has one (template: `skills/foreman/references/project-file-template.md`). It maps steps to the project's own skills and adds pause items, sizing rules and proof rules.
3. It matches the job to a recipe and copies the recipe's steps onto the task list.
4. It works the steps. Reversible calls it makes itself and logs. Always-pause items (production writes, deploys, real spend, product calls, new dependencies, plus the project's list) set the run to `paused` and wait for your answer.
5. A `Stop` hook sends a `running` session back to its task list instead of letting the turn end. It adopts an unowned run for the session that is working it. It lets go when the run is `paused` or `done`, after 25 pushes, or when the file is 6 hours stale.
6. The recipe ends by landing the work through the project's `land` step, then a plain report. The run is set to `done`.

Add `.claude/foreman/` to the project's `.gitignore`.

## What's in it

**Skills.** Start with `foreman`. It reads the others as a run needs them. Each can also be run directly as `/autofactory:<name>`.

- `foreman`: matches the job to a recipe, runs it to done, pauses only for big decisions.
- `how`: explains how a subsystem works before you change it.
- `why`: finds the reasons behind code, from git history, tickets, docs, chat, and incident data.
- `architect`: sketches types and module shape from several competing designs before code.
- `arena`: runs several candidates at one task, picks a base, grafts the best parts of the rest.
- `swarm`: fans out parallel workers and returns one report.
- `interrogate`: adversaries try to break a change, and only findings proven by a run survive.
- `tdd`: red-green test-first for bugs and features with a cheap test target.
- `benchmark-checklist`: vets a performance number before you report it.
- `show-me-your-work`: keeps a reviewable decision log for long or unattended runs.
- `figure-it-out`: designs a bespoke playbook when no recipe fits.
- `unslop`: cuts AI tells from writing.
- `bro`: restates the last message in plain words.

**Recipes** (`skills/foreman/playbooks/`). Feature, Bug fix, Refactoring, Perf issue, Hillclimb, Investigation, User report, Runtime forensics, Trace forensics, Prototype, Visual parity, Eval, Authoring a skill, Opening a PR, Autonomous run, Orchestrate, Multi-phase plan, Session pickup, Pause safely, Worktree cleanup.

**References** (`skills/foreman/references/`). The 24 engineering principles foreman cites and the project file template for `<repo>/.claude/foreman.md`.

**Hooks.** On `UserPromptSubmit`, starting foreman writes `.claude/foreman/run.json`. On `Stop`, a running foreman session is sent back to its task list instead of ending the turn.

**Agent.** `autofactory:foreman-agent` is the delegate foreman spawns for code-writing work.

## Credit

Built on [pstack](https://github.com/backnotprop/pstack) by Lauren Tan (poteto), mirrored from [cursor/plugins](https://github.com/cursor/plugins/tree/main/pstack). Copied at upstream commit `25abb38559ddbabec563646224d09eff9a250eca` (2026-11-01), then trimmed to what foreman uses and rewritten for Claude Code. To pull later upstream changes, diff against a newer upstream commit by hand. MIT licensed; see `LICENSE`.
