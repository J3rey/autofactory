# autofactory

An agentic software factory for Claude Code. One `foreman` skill routes every job through plan, build, review and ship.

**New here?** Read the [guide](docs/guide.md).

## Install

```
/plugin marketplace add J3rey/autofactory
/plugin install autofactory@autofactory
```

## Start

```
/autofactory:foreman <job>
```

## What's in it

**Skills.** Start with `foreman`. It reads the others as a run needs them. Each can also be run directly as `/autofactory:<name>`.

- `foreman`: matches the job to a recipe, runs it to done, pauses only for big decisions. Big features get a written task plan built from the `architect` sketch (files, test first or not, done check per task). Multi-task builds run a task loop: an implementer per task, a task review after each, a capped fix loop, a resume ledger.
- `how`: explains how a subsystem works before you change it.
- `why`: finds the reasons behind code, from git history, tickets, docs, chat, and incident data.
- `shape`: shapes a fuzzy feature ask into an agreed spec, one question at a time; adapted from superpowers brainstorming.
- `architect`: sketches the types and module shape before code.
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

**Run state, hooks and the progress band** are explained in the [guide](docs/guide.md).

**Agent.** `autofactory:foreman-agent` is the delegate foreman spawns for code-writing work.

## Credit

Built on [pstack](https://github.com/backnotprop/pstack) by Lauren Tan (poteto), mirrored from [cursor/plugins](https://github.com/cursor/plugins/tree/main/pstack). Copied at upstream commit `25abb38559ddbabec563646224d09eff9a250eca` (2026-11-01), then trimmed to what foreman uses and rewritten for Claude Code. To pull later upstream changes, diff against a newer upstream commit by hand. MIT licensed; see `LICENSE`.

The `shape` skill and foreman's task loop are adapted from the brainstorming and subagent-driven-development skills in [superpowers](https://github.com/obra/superpowers) by Jesse Vincent. MIT licensed, Copyright (c) 2025 Jesse Vincent; the notice ships in `skills/shape/LICENSE` and `skills/foreman/references/task-loop/LICENSE`.
