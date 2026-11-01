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

**Recipes** (`skills/foreman/playbooks/`). Feature, Bug fix, Refactoring, Perf issue, Hillclimb, Investigation, User report, Runtime forensics, Trace forensics, Prototype, Visual parity, Eval, Authoring a skill, Babysit, Shipping, Opening a PR, Autonomous run, Orchestrate, Autopilot-full, Multi-phase plan, Session pickup, Pause safely, Worktree cleanup.

**References** (`skills/foreman/references/`). The 24 engineering principles foreman cites, the review-bot triage rubric, and the project file template for `<repo>/.claude/foreman.md`.

**Hooks.** On `UserPromptSubmit`, starting foreman writes `.claude/foreman/run.json`. On `Stop`, a running foreman session is sent back to its task list instead of ending the turn.

**Agent.** `autofactory:foreman-agent` is the delegate foreman spawns for code-writing work.

## Credit

Built on [pstack](https://github.com/backnotprop/pstack) by Lauren Tan (poteto), mirrored from [cursor/plugins](https://github.com/cursor/plugins/tree/main/pstack). MIT licensed; see `LICENSE` and `UPSTREAM.md`.
