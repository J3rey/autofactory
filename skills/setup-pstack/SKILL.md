---
name: setup-pstack
description: Configure which models pstack uses per role and at what reasoning budget. Detects your available models and writes an always-applied rule that overrides the skill defaults. Use for /setup-pstack, "configure pstack models", "pstack budget", or changing pstack's model choices.
---

# Setup pstack

Write pstack's model settings, one model per role:

- **Cursor:** `~/.cursor/rules/pstack-models.mdc`, an always-applied rule.
- **Claude Code:** `~/.claude/rules/pstack-models.md`. Claude Code loads every file in `~/.claude/rules/` into each new session.
- **Every other harness** (Codex, Pi, OpenCode, and others): `~/.agents/pstack-models.md`. These harnesses don't load it on their own, so pstack skills read this file when they pick a model.

"The settings file" below means the file for your harness. In Claude Code, if that file is missing, read `~/.agents/pstack-models.md` instead, where older versions of this skill wrote it.

## Steps

### 1. Detect available models

Enumerate the Claude models you can pass to a subagent in this session (Cursor `Task`, Claude Code `Agent`, OpenCode `task`, Codex `spawn_agent`). That is the dependable source. If your harness also has a command that lists the user's models, prefer it for completeness (for example `opencode models` or `pi --list-models`). If you cannot detect any, ask the user to paste the slugs they have access to. Pstack uses Claude models only. Write a model as `<model> <effort>`, such as `opus xhigh` or `sonnet high`, with `<model>` one of the detected models (in Claude Code: `opus`, `sonnet`, `haiku`, `fable`) and `<effort>` one of `low`, `medium`, `high`, `xhigh`, `max`. Never write a real model you have not confirmed is available. The aliases `inherit-parent` and `auto` are always valid even though they are not detected slugs.

### 2. Load current state

The default role-to-model mapping is the rule shape shown in step 5 below. If the settings file already exists, read it and treat its `# budget` line and its role values as the current choices. Otherwise start from those defaults. A line whose role is not in step 5, such as `how critics`, is from a retired role. Drop it.

### 3. Budget, map, and confirm

**(a) Ask for a budget.** Prefer your structured-question tool (`AskQuestion` in Cursor, `AskUserQuestion` in Claude Code, `question` in OpenCode) over free text. Offer these four options with these exact labels, and name the current budget when the rule records one. With no rule, say that `large` matches the skill defaults.

- `unlimited — max reasoning`
- `large — xhigh reasoning`
- `medium — high reasoning`
- `small — medium reasoning`

**(b) Apply it.** Build the working table from the skill defaults, and on a re-run keep any role you changed by model, list, or alias (`inherit-parent`, `auto`). `unlimited`, `medium`, and `small` set the effort token of every real model, panel entries included, to `max`, `high`, or `medium`. `large` keeps the skill defaults as they are. The effort token is the last token on the ladder `max` > `xhigh` > `high` > `medium` > `low`. If the result is not a detected model and effort, use the same model at the highest detected effort at or below the target, else mark the role as needing a choice. `inherit-parent` and `auto` do not change. So `unlimited` turns `opus xhigh` into `opus max` and `sonnet high` into `sonnet max`. `large` keeps `opus xhigh` and `sonnet high`. `medium` turns `opus xhigh` into `opus high` and keeps `sonnet high`. `small` turns them into `opus medium` and `sonnet medium`.

**(c) Show the roles and confirm.** Show every role with its model, marking any real model not in the detected set as needing a choice. Also list each line step 2 dropped. Ask whether to accept as-is or change specific roles, offering the detected models plus `inherit-parent` and `auto` (both mean: this role runs on the parent chat model, which is how Auto users stay on Auto) as the options. Prefer your structured-question tool over free text. For panel roles (arena runners, architect runners, interrogate reviewers) the value is a list, and one subagent runs per entry, alias entries included, so the list length sets the count. `arena cross-judge pool` is also a list, but Arena runs one judge. It tries only values whose model differs from the parent's, in list order, so order it by preference. An `inherit-parent` or `auto` value never judges. `swarm workers` is the default model for every worker unless a race or comparison assigns another model per arm.

### 4. Validate

Every real model written must be in the detected set. `inherit-parent` and `auto` always pass. If a chosen real model is not available, stop and ask again.

### 5. Write the rule

Write the settings file with a `# budget` line with the chosen label and its target effort, and one line per role, using the same labels foreman uses. In Cursor, include the frontmatter below with `alwaysApply: true`. In other harnesses, write the settings file without the frontmatter (start at the first `#` line). Overwrite the whole file so re-runs stay idempotent. Shape:

```
---
description: pstack per-role model choices (overrides skill defaults)
alwaysApply: true
---
# pstack model configuration. One line per role. Delete a line to fall back to the skill default.
# `inherit-parent` or `auto` as a value: the role runs on the parent chat model (omit the subagent `model`). Alias entries in a panel list still count toward its fan-out.
# budget: large (xhigh)
feature, refactoring: sonnet high
bug-fix: sonnet high
perf-issue: sonnet high
hillclimb: sonnet high
judgment and prose: opus xhigh
hardest tasks: opus xhigh
how explorer: sonnet high
how explainer: opus xhigh
why investigators: sonnet high
why synthesizer: opus xhigh
reflect tooling: sonnet high
reflect judgment, divergent, synthesizer: opus xhigh
arena runners: opus xhigh, sonnet high
arena cross-judge pool: opus xhigh, sonnet high
swarm workers: sonnet high
architect runners: opus xhigh, sonnet high
interrogate reviewers: opus xhigh, sonnet high
```

### 6. Confirm

Tell the user which file was written. In Cursor and Claude Code, it applies to new sessions. In other harnesses, pstack skills read `~/.agents/pstack-models.md` when they pick a model. Re-running this skill updates it.

### 7. Offer a verification skill (optional)

Check whether the project has a way to drive the real app for proof (a `verify-*` skill, or an existing harness). If not, offer once: "want a project-local verification skill, so agents can drive the app the way a user does and prove changes work? I can generate one with /create-verification-skill." On yes, invoke `/create-verification-skill` (resolves wherever pstack is installed: workspace, user, or plugin). On no, move on without pushing.

### 8. Offer a formal verification skill (optional)

Check whether the project already has a formal verification skill (a project skill that runs a model checker, a proof, or another verifier against the code). If not, offer once: "want a formal verification skill, so agents can prove a key property of your code holds in every case in scope, not only the cases tests reach? I can generate one with /create-formal-verification-skill." On yes, invoke `/create-formal-verification-skill` (resolves wherever pstack is installed: workspace, user, or plugin). On no, move on without pushing.
