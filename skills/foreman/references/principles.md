# Principles

One section per principle. The index in `../SKILL.md` names when each applies. Read the section for any principle you apply, and cite only principles whose section you read this session.

## Laziness Protocol

**Applies when** refactoring, sizing a diff, or tempted to add abstractions, layers, or signal threading.

- **Consolidate decisions.** Do not repeat the same choice in several places. Put it behind one source of truth and pass the result as a simple flag.
- **Minimize the diff.** Make the smallest change that solves the problem. Fewer lines beat "elegant" boilerplate.

## Foundational Thinking

**Applies when** before writing logic: core types and data structures, scaffold-vs-feature sequencing, what concurrent actors share.

Get the data shape right before writing logic. Define core types early, trace every access pattern, and choose structures that match the dominant paths. DRY the structure, not every line.

Before sharing state between actors, ask what happens if another actor modifies it concurrently. If the answer is not "nothing", isolate.

Scaffold first. Whatever helps every later phase (CI, tests, shared types) goes first, after removing dead code. Keep commits small and single-purpose.

## Redesign from First Principles

**Applies when** integrating a new requirement into an existing design.

Don't bolt the change onto the existing design. Redesign as if the requirement had been foundational from day one. Read all affected files and understand the current design. Ask what you would build if you were writing this from scratch with the new requirement. Propagate the change through every reference (types, docs, examples, rationale sections). Think about the whole redesign, then deliver it incrementally.

## Attack the Premise

**Applies when** two or more fixes that share one premise have failed the same gate.

When two or more fixes that share one premise have failed the same gate, suspect the premise, not the fixes.

- Write the premise down: the one sentence every failed fix assumed.
- Test it before the next fix. Find an observation that would come out differently if the premise were false, and make it. Look at how the failures are distributed, not only at how large they are.
- If the evidence contradicts the premise, look for what the failures share that it did not predict. If one part always lands on the losing side, change what puts it there instead of adding a mechanism that cleans up after it.

Do not start the next fix before the premise is written down and tested.

## Subtract Before You Add

**Applies when** sequencing an addition, refactor, or rewrite.

Remove dead weight first, then build on the simpler base. Default to subtraction, and leave the design slightly simpler and more capable behind the same or smaller surface than you found it. Sequence removal before construction. Cut before you polish. Design for observed usage, not speculative edge cases. Add no speculative validators, parsers, or guards beyond what the spec demands. Simplify prompts by removing redundant instructions and excessive templates. When a reference has no novel content, delete it rather than leaving a stub.

## Minimize Reader Load

**Applies when** reviewing or shaping code that's hard to trace.

Reader load is the work a reader must do to understand code. It has two independent axes: layers to trace between the question and the answer, and hidden or mutable state to hold in their head. Guard both.

- Collapse layers that only forward: wrappers with one caller, adapters with no second implementation, pass-through methods. Inline them.
- Shrink state scope: returns over mutations, locals over fields, fields over module state, module state over globals. Derive instead of sync.
- Name an invariant once at the boundary, not in every consumer.

The test: can a new reader answer "where does X come from?" and "what can change X?" in under 30 seconds? If not, cut layers or cut state.

## Outcome-Oriented Execution

**Applies when** planned rewrites and migrations have explicit phase boundaries.

Optimize for the intended, verifiable end state, not for smooth intermediate states. Keeping every step stable often creates temporary compatibility code that becomes long-lived debt. Intermediate breakage is acceptable when it is planned, scoped, and reversible. Declare where temporary breakage is acceptable. Keep high-signal checks on the areas you touch while migrating. Require full static and runtime verification at plan completion.

## Experience First

**Applies when** product, UX, or feature-scope tradeoffs.

When implementation convenience conflicts with user delight, choose delight. Justify every feature, control, and option. Ship less and ship better: a polished experience with three features beats a rough one with ten. Prototype before committing, because design decisions are cheaper in throwaway HTML than in production code. Get the details right: transitions, alignment, spacing, feedback, error states. Every feature should serve the central workflow or get out of the way.

The user is whoever consumes the work: the end user for a UI, the colleague who imports it for a library or internal API. The engineer who maintains the code next is a user too. Explain impact from their perspective. Foundational Thinking governs the sequence of work. This principle governs the target.

## Exhaust the Design Space

**Applies when** a novel UI interaction or architectural decision has no precedent in the codebase.

It also applies to product design decisions where user experience depends on feel, not logic.

## Build the Lever

**Applies when** any non-trivial work.

When the work isn't trivial, build the tool that does it (a codemod, script, generator, or rerunnable check) instead of doing it by hand. The bar is triviality, not repetition. Skip the tool only for a couple of obvious edits.

- Do the first unit by hand, then build the tool and prove it by rerunning it on that unit. Make it safe to rerun.
- A deterministic tool beats fan-out. When you do fan out, write the recipe, the verification contract, and the fences as one skill the delegates read and cannot edit.
- Applying this produces a file. No script, codemod, generator, or delegate skill in the diff means you didn't apply it. Commit it when the work outlives the session.
- Build the smallest script that does or proves the job, never a framework.

## Model the Domain

**Applies when** writing stateful logic, or code that branches a lot or repeats a shape assumption across files.

Encode the domain in a data structure instead of scattering it across conditionals. The right structure makes invalid states unrepresentable and deletes branches.

Reach for a state machine instead of scattered booleans or phase checks, a typed model instead of loose parameters, a map, registry, or discriminated union instead of branching spread across files, a reducer instead of ad hoc mutations, and an index, queue, or normalized collection where the access pattern calls for it.

Do not force it. Keep boring code when the shape is clear, local, and unlikely to grow, and distrust an abstraction that adds indirection without removing branches or invalid states.

The sign that you skipped this: a feature that grows an if/else chain by one more branch, or a second boolean that must stay in sync with the first.

## Boundary Discipline

**Applies when** wiring validation, error handling, or framework adapters.

Validate, narrow types, and handle errors where data crosses a system boundary (CLI args, config files, external APIs, network). Inside, trust the types: no re-validation and no redundant nil checks. Parse raw data into domain types at the boundary, and keep transport and framework types out of the public surface. Business logic lives in pure functions with no framework dependencies. The shell that calls them is thin.

Two tests. Is this data crossing a boundary right now? If not, the validation is redundant. Can this be a pure function the shell just calls? If yes, extract it.

## Type System Discipline

**Applies when** designing types or a signature in any typed language.

Make the compiler reject impossible states, mismatched primitives, and unhandled variants.

- **Brand semantic primitives.** If two arguments share a primitive type but mean different things, give each its own type. Validate once at creation.
- **External data is untyped until parsed.** JSON, RPC payloads, CLI args, config, environment variables, and database rows go through a parse function at the boundary that returns the typed model.
- **Derive types from authoritative schemas.** When a schema file owns a shape, derive the type from it instead of hand-rolling a parallel one.

## Make Operations Idempotent

**Applies when** designing commands, lifecycle steps, or loops that run amid crashes and retries.

Design every state-changing operation to converge to the correct state however many times it runs and wherever the previous run stopped.

Derive each step from the state that exists, not from what the previous run meant to do. Read the current state, compare it to the goal, and apply only the difference.

Anything a run leaves behind (a lock, a temporary file, a half-written record, a claimed job) must be recognizable as stale by the next run, by evidence that holds wherever the previous run could have stopped. Write to a temporary path and rename it into place.

The test: what happens if this runs twice? What if the previous run crashed at every possible point? If the answer depends on what was left behind, add a reconciliation step.

## Migrate Callers Then Delete Legacy APIs

**Applies when** introducing a new internal API while old callers exist.

- Update tests to assert the new contract, and delete tests that only protect pre-refactor implementation details

**When this applies:**
- No external users depend on backward compatibility
- The project can absorb coordinated breaking changes
- The new API is part of a simplification or refactor initiative

## Separate Before Serializing Shared State

**Applies when** concurrent actors might write the same file, branch, key, or object.

When concurrent actors might write the same file, branch, key, or object, first ask whether they need one shared object or are publishing independent facts. Default to giving each actor its own file, key, branch, or state directory, and merge only where the state is read. Two workers writing their own field into one `state.json` is still shared mutation.

Only when one shared write target is a real invariant, serialize access structurally (a lockfile, a single writer, sequential phases, compare-and-swap). Instructions are not concurrency control, and "we need a lock" is a smell to check first.

## Prove It Works

**Applies when** after a task, before declaring done.

Verify every output by checking the real thing directly: run the feature, read the actual value, inspect the diff. Proxies (file mtimes, self-reports, cached output, "it compiles") do not count. When a check fails, suspect the observation method before the system.

Script the check when you can. A deterministic script that reruns the comparison beats a one-time look. Keep its output where the human can see it, and commit it only when the trail must be auditable later.

## Fix Root Causes

**Applies when** debugging.

Fix the fault, not the place where it surfaced. The root cause is the first place the system did something it should not do, or failed to handle a state it should handle.

- Reproduce first. Ask "why" until the answer is a wrong decision in the code. When stuck, instrument and read the actual state.
- Ask whether the state that triggered the symptom is legitimate. If it is, handle it where the code broke. If it should never exist, a check there hides the bug, so find what produced it. Guards, retries, swallowed errors, clamped values, and discarded state are the usual ways to hide a bug.
- Fix the pattern, not the instance. Find every place with the same fault.
- If the deciding fact took a deep dig, propose the cheap, always-on signal that would have shown it at first look.

## Sequence Work into Verifiable Units

**Applies when** multi-step work (sweeps, migrations, runs of similar edits) and how you stack commits and PRs.

Order work as small units that each end in a state you can check, and do not advance until the current one is green.

In a sweep, migration, or run of similar edits, each unit is a bracket: known-good state, one change, run the check, proceed. Run the per-unit check even when a tool does the edits.

Deliver in the order that proves the work: the failing test first, then the fix. The subtraction before the reshape. The baseline before the treatment. Each commit lands on its own.

## Test Behavior, Not Implementation

**Applies when** writing, changing, or keeping a test.

A test is a claim about what users of the code can observe through its interface: return values, errors, state they can read back, and effects on outside systems. Private helpers, internal call order, and intermediate data are implementation.

Judge each test against two imagined edits:

- **Break the behavior** (a wrong value, a skipped or doubled effect). If the test still passes, it proves nothing. The usual causes are a loose assertion, an expected value computed by the code under test, and an assertion on data the test built itself.
- **Change the internals** and keep every observable result. If the test fails, it is pinned to the implementation.

Keep a test that catches the first edit and survives the second. Rewrite or delete the rest. Drive the code through its public interface with a concrete input, and derive the expected value from the requirement. What an external service receives is behavior. A call to an internal helper is not. Pair "this never happens" with a case where it does happen. Assert the error type that callers branch on, not the message.

## Explain the Number

**Applies when** before you measure, and before you trust, report, or act on a number you measured (a speedup, a regression, a throughput, a latency, an eval result).

- **Write the decision before you run.** Name the result that would change it, and the noise floor. Stop when the run-to-run spread is larger than the effect.
- **Ask "why not double?"** Name the resource or code path that bounds the result, from a profile or counters taken during a run. A guess from reading the code is not a limiter.
- **List what else the number could be measuring** (errors, skipped or cached work, code that never ran, an untuned side, noise, a piece too small to matter) and rule out each one with evidence.
- **Keep the run count, the spread, and the limiter with the number.**

For a performance number, follow the **benchmark-checklist** skill. For an eval result, ask whether every run did the task, whether the gap holds across trials and models, and whether the scenario matters.

## Guard the Context Window

**Applies when** context fills up: large outputs, long files, repeated reads, fan-out planning.

**Why:** Context overflow degrades reasoning quality, creates compression artifacts, and halts progress.

**Pattern:**
- **Size phases and cap scope.** Limit files per phase, set turn budgets, account for mechanism costs.

## Never Block on the Human

**Applies when** tempted to ask "should I do X?" on reversible work.

Bounded by foreman's always-pause list: those items always block on the human.

The human supervises asynchronously, so stay unblocked. Proceed, then present: do the work, show the result, and explain why instead of asking. Code changes are reversible and reviewable, so a wrong decision usually costs less than blocking. Reversible actions (write code, edit notes, split tasks) proceed. Irreversible ones (force-push, delete production data, send external messages) still need confirmation. Make the system self-healing: when you notice a problem, log it and fix it in the next round. Product direction comes from the human, but execution should not block on it.

## Encode Lessons in Structure

**Applies when** you catch yourself writing the same instruction a second time, or notice a recurring correction.

If the lesson needs judgment and cannot be encoded, make the instruction more prominent and add an example of the failure mode.

**Corollary:** If the fix is structural, only use the structural fix. The instruction is the symptom.

