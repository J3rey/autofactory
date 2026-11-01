# Principles

One section per principle. The index in `../SKILL.md` names when each applies. Read the section for any principle you apply, and cite only principles whose section you read this session.

## Laziness Protocol

**Applies when** refactoring, sizing a diff, or tempted to add abstractions, layers, or signal threading.

Bias to deletion and the smallest change that solves the problem. Consolidate decisions. Don't repeat the same choice in several places. Put it behind one source of truth and pass the result as a simple flag. Minimize the diff, because fewer lines beat "elegant" boilerplate.

## Foundational Thinking

**Applies when** before writing logic: core types and data structures, scaffold-vs-feature sequencing, what concurrent actors share.

Structural decisions protect option value. Code-level decisions protect simplicity. Get the data shape right before writing logic: define core types early, trace every access pattern, and choose structures that match the dominant paths. At code level, DRY the structure, not every line. Three similar statements still beat a premature abstraction. Prefer explicit over clever.

Before sharing state between actors, ask what happens if another actor modifies it concurrently. If the answer is not "nothing", isolate it.

Scaffold first. If something helps every later phase (CI, linting, test infrastructure, shared types), do it first. Sequence setup before features and tests before fixes. Keep commits small and single-purpose. Each increment should land a coherent abstraction or deepen one that exists, not spread a new capability across callers as special-case coordination. Remove dead code before laying foundations.

## Redesign from First Principles

**Applies when** integrating a new requirement into an existing design.

Don't bolt the change onto the existing design. Redesign as if the requirement had been foundational from day one. Read all affected files and understand the current design. Ask what you would build if you were writing this from scratch with the new requirement. Propagate the change through every reference (types, docs, examples, rationale sections). Think about the whole redesign, then deliver it incrementally.

## Attack the Premise

**Applies when** two or more fixes that share one premise have failed the same gate.

Suspect the premise, not the fixes. Each failed fix is evidence against the belief it assumed, and a third fix on the same premise spends effort where the evidence says the cause is not. Write the premise down as the one sentence every failed fix assumed. Find an observation that would come out differently if the premise were false, and make it. Look at how the failures are distributed, not only how large they are, and make the check rerunnable. If the evidence contradicts the premise, look for what the failures have in common that the premise did not predict. If it confirms the premise, ask the next "why", because the earlier fixes may have treated a consequence. If one part always lands on the losing side, remove the condition that puts it there instead of adding a mechanism that cleans up after it. Do not start the next fix before the premise is written down and tested.

This differs from Redesign from First Principles, which rebuilds a design around a new requirement. This one questions a fact the current design assumes.

## Subtract Before You Add

**Applies when** sequencing an addition, refactor, or rewrite.

Remove dead weight first, then build on the simpler base. Default to subtraction, and leave the design slightly simpler and more capable behind the same or smaller surface than you found it. Sequence removal before construction. Cut before you polish. Design for observed usage, not speculative edge cases. Add no speculative validators, parsers, or guards beyond what the spec demands. Simplify prompts by removing redundant instructions and excessive templates. When a reference has no novel content, delete it rather than leaving a stub.

## Minimize Reader Load

**Applies when** reviewing or shaping code that's hard to trace.

Maintainability is the work a reader must do to understand code. Track two independent axes: layers to trace (indirections between the question and the answer) and state to hold (hidden or mutable context the reader keeps in their head). LOC and cyclomatic complexity are proxies. A flat file with 50 globals can be as hard to follow as a 6-layer adapter stack.

Collapse layers that cost more than they save: wrappers with one caller, adapters with no second implementation, speculative indirection. Collapse pass-through layers that repeat the same methods and arguments. Prefer boundaries that hide meaningful decisions over a broad interface that hides little. Shrink state scope: pure functions over mutations, locals over fields, fields over module state, module state over globals. Derive instead of sync. Name the invariant at the boundary, not in every consumer. Before adding a layer or state, ask whether it reduces reader load elsewhere by at least as much.

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

Build 2-3 competing prototypes and compare them side by side before committing. This also covers product design decisions where the experience depends on feel, not logic.

## Build the Lever

**Applies when** any non-trivial work.

Build the tool that does or proves the work (a codemod, script, generator, or rerunnable check) instead of doing it by hand. A tool does the work the same way every time and reruns for free. A reviewer can read and rerun it, while hand-done changes can only be re-verified by redoing them. Skip it only when the task is trivial, a couple of obvious edits you can see at a glance. The bar is triviality, not repetition.

Do the first unit by hand to learn the recipe, then build the tool and prove it by rerunning it on that unit and diffing against your hand-done version. A deterministic lever beats fan-out, so if the tool can process every unit in one pass, run it yourself. When you fan work out to subagents, write the lever as a skill they all read (recipe, verification contract, do-not-touch fences), outside the delegates' write scope. Citing this principle with no codemod, script, generator, or delegate skill in the diff means you didn't apply it. Build the smallest script that does or proves the job, never a framework, and commit it when the work outlives the session.

This differs from Encode Lessons in Structure, which makes a recurring instruction a durable guardrail.

## Model the Domain

**Applies when** writing stateful logic, or code that branches a lot or repeats a shape assumption across files.

Encode the real domain in a data structure instead of scattering it across conditionals. A matching structure makes invalid states unrepresentable and deletes branches. Choosing it at write time is cheap. Recovering it later reads as a refactor and gets deferred.

Reach for a state machine instead of scattered booleans and lifecycle checks. Use a typed model instead of loose parameters. Use a map, registry, lookup table, or discriminated union instead of branching spread across files. Use a reducer or command/event model instead of ad hoc mutations. Organize a module around one body of domain knowledge, not a sequence such as load, validate, transform, save, because execution order is not ownership. Use a queue, cache, index, graph, tree, or normalized collection where the access pattern calls for it. When none fits, work out what the code must never allow and how the data gets read, and find the structure that encodes exactly that.

Don't force an abstraction. Prefer boring code when the current shape is clear, local, and unlikely to grow. You skipped this when a new feature grows an if/else chain by one more branch, when a second boolean must stay in sync with the first, or when phase-named modules repeat the same domain rules across steps.

## Boundary Discipline

**Applies when** wiring validation, error handling, or framework adapters.

Place validation, type narrowing, and error handling at system boundaries (CLI args, config files, external APIs, network protocols). Inside the system, use typed data and error propagation, with no re-validation. Business logic lives in pure functions, and the shell is thin and mechanical. Scattered validation is noisy, redundant, and gives false safety.

Validate config at parse time, and parse raw data into domain types at the boundary. Don't re-export transport, storage, framework, or wire types through the public surface. Expose domain concepts, keep general mechanism inside and special-purpose policy at the edge. Skip nil checks deep in call chains when the boundary already validated.

Two tests. Is this data crossing a system boundary right now? If not, validation is redundant. Can this be a pure function that the shell just calls? If yes, extract it.

## Type System Discipline

**Applies when** designing types or a signature in any typed language.

Make the compiler reject impossible states, mismatched primitives, and unhandled variants. Prefer defining errors and special cases out of existence over proliferating handlers. Make illegal states unrepresentable and exhaust variants.

Brand semantic primitives. `UserId` and `OrderId` are strings underneath but must not be interchangeable, so give each its own type (a branded intersection in TypeScript, a newtype elsewhere), validate once at creation, and trust the type downstream. If two arguments share a primitive type but mean different things, brand them. External data (RPC payloads, JSON, IPC messages, CLI args, config files, environment variables, database rows) is untyped until parsed, so put a parse function at every boundary. Derive types from authoritative schemas (protocol buffers, OpenAPI, GraphQL, migrations, design-token files) instead of hand-rolling a parallel type.

## Make Operations Idempotent

**Applies when** designing commands, lifecycle steps, or loops that run amid crashes and retries.

Operations should converge to the same end state however many times they run and wherever the previous run stopped. Derive each step from the state that exists: read the current state, compare it to the goal, and apply only the difference. A repeat then finds nothing left to do.

Anything a run leaves behind (a lock, a temporary file, a half-written record, a claimed job) must be recognizable as stale by the next run. Judge staleness by evidence that stays true wherever the run could have stopped. For example, write to a temporary path and rename it into place, or compare artifacts by content instead of creation order.

The test: what happens if this runs twice in a row? What if the previous run crashed at every possible point? Does re-execution converge? If any answer is "it depends on what state was left behind", add a reconciliation step.

## Migrate Callers Then Delete Legacy APIs

**Applies when** introducing a new internal API while old callers exist.

Migrate the callers and delete the old API in the same wave, instead of preserving a compatibility layer. Update tests to assert the new contract, and delete tests that only protect pre-refactor implementation details. This fits when no external users depend on backward compatibility, the project can absorb coordinated breaking changes, and the new API is part of a simplification or refactor.

## Separate Before Serializing Shared State

**Applies when** concurrent actors might write the same file, branch, key, or object.

First ask whether the actors need the same mutable object. Identify the shared mutable state (files both read and write, branches both push to). By default, eliminate the shared write target: give each actor its own file, key, branch, or state directory, and merge only at the read or reporting boundary. Two workers writing their own `lastX` field into one `state.json` is still shared mutation. `indexer-state.json` plus `metrics-state.json` is not. Serialize only when one shared writer is a real invariant, and do it structurally (lockfiles, sequential phases, a single-writer actor, atomic compare-and-swap). Instructions and conventions are not concurrency control, and "we need a lock" is a design smell to check first. Concurrent writes create races that are intermittent, hard to reproduce, and expensive to debug.

## Prove It Works

**Applies when** after a task, before declaring done.

Verify against the real artifact, not a proxy, a self-report, or "it compiles". Run the feature, read the actual value, inspect the diff. Indirect checks (file mtimes, output freshness, agent self-reports, cached screenshots) feel cheaper than direct observation, but acting on a wrong inference costs far more. Check process liveness directly, not through derived state. When verification fails, suspect the observation method before suspecting the system.

Script the check when you can. A deterministic script that reruns the same comparison beats a one-time eyeball. Keep its output as an artifact a reviewer can rerun. Commit it only for large or complex work where the trail must be auditable later, such as a big port or migration (see the **show-me-your-work** skill).

## Fix Root Causes

**Applies when** debugging.

Fix the fault, not the place where it surfaced. The root cause is the first place the system did something it should not, or failed to handle a state it should handle. A symptom fix hides the evidence and leaves the fault free to surface elsewhere. Reproduce first. Ask "why" at each step until the answer is a wrong decision in the code, not a consequence of an earlier one. When stuck, instrument, and read the actual error and state instead of guessing.

Ask whether the state that triggered the symptom is legitimate. If the system may be in that state, the code that broke on it is the root cause, and handling the state there is the fix. If the state should never exist, a check where it broke hides the bug, so find what produced it. Guards, retries, swallowed errors, clamped values, and discarded state are the usual ways to hide a bug. When something fails only after a restart, suspect persisted state first (config files, caches, lock files, serialized state). Check for the pattern, not just the instance, and fix every place with the same fault. If a workaround needs a paragraph-long comment to justify it, the code is wrong. If the deciding fact took a deep dig to find, propose the cheap, always-on signal that would have shown it at first look.

## Sequence Work into Verifiable Units

**Applies when** multi-step work (sweeps, migrations, runs of similar edits) and how you stack commits and PRs.

Break work into small units that each end in a state you can check, and don't advance until the current one is green. A break caught at the unit that caused it is cheap to localize, while one caught after a batch is buried under work built on a broken base. Each unit is a before/after bracket: known-good state, one change, run the check, proceed. Rebase onto clean trunk first so every check measures against the real baseline. Run the per-unit check even when a lever makes it nearly free.

For delivery, stack commits and PRs in the order that proves the work. The canonical shape is the failing test first, then the fix on top. Other orders are a subtraction before the reshape, a baseline capture before the treatment, the scaffold before the feature. Each commit lands on its own and the sequence reads as an argument. This complements Prove It Works, which keeps each check real, and Build the Lever, which makes the per-unit check cheap.

## Test Behavior, Not Implementation

**Applies when** writing, changing, or keeping a test.

Assert what the code's users can observe, so the test fails when that behavior breaks and keeps passing when only the internals change. Behavior is what a caller, end user, or other service sees through the interface: return values, errors, state they can read back, and effects on outside systems (a request sent, a row written, a message emitted). Implementation is private helpers, internal call order, intermediate data, and which collaborator did the work.

Judge each test against two imagined edits. Break the behavior (return a wrong value, skip an effect, do it twice): if the test still passes, it proves nothing. Usual causes are an assertion looser than the contract, an expected value computed by the code under test, a restated constant that never runs the code that reads it, and an assertion on data the test built itself. Change the internals while keeping every observable result: if the test now fails, it is pinned to the implementation. Keep a test that catches the first edit and survives the second, and rewrite or delete the rest. Drive the code through its users' interface with a concrete input, and derive the expected value from the requirement, not from a run of the code.

The contract decides, not the shape of the assertion. "An empty cart never charges" makes "the payment client got no call" behavior, so pair it with a case where the charge happens. A payload that a mocked external service receives is behavior. A call to an internal helper is not. An exact error message pins wording no caller reads, while the error type callers branch on is the contract. An invariant such as a key that must exist in two tables, or a compile-time type check, is also behavior.

## Explain the Number

**Applies when** before you measure, and before you trust, report, or act on a number you measured (a speedup, a regression, a throughput, a latency, an eval result).

Write the decision before you run: name the result that would change a decision, and the noise floor. Stop when the run-to-run spread is larger than the effect. Ask "why not double?" and name the resource or code path that bounds the result (a core, a lock, the disk, the network, the load generator). Get it from a profile or system counters taken during a run and map it to source, because a guess from reading the code is not a limiter. If you cannot say why the number is not twice as good, you do not know what you measured.

List what else the number could be measuring and rule out each with evidence: errors, skipped or cached work, code that never ran, an untuned side left on default settings, noise, and a piece too small to matter end to end. Keep the run count, the spread, and the limiter with the number. For a performance number, follow the **benchmark-checklist** skill. For an eval result, ask whether every run did the task, whether the gap holds across trials and models, and whether the scenario matters.

You skipped this when a run started without the result that would change a decision, when a number has no run count, no spread, or no named limiter, or when the time saved is larger than the time the changed piece took. This differs from Prove It Works, which checks that an output is real.

## Guard the Context Window

**Applies when** context fills up: large outputs, long files, repeated reads, fan-out planning.

Context overflow degrades reasoning, creates compression artifacts, and halts progress. Route bulk work to subagents and keep summaries, not raw payloads, in the main thread. Size phases and cap scope: limit files per phase, set turn budgets, and account for the cost of the mechanisms you use.

## Never Block on the Human

**Applies when** tempted to ask "should I do X?" on reversible work.

Bounded by foreman's always-pause list: those items always block on the human.

The human supervises asynchronously, so stay unblocked. Proceed, then present: do the work, show the result, and explain why instead of asking. Code changes are reversible and reviewable, so a wrong decision usually costs less than blocking. Reversible actions (write code, edit notes, split tasks) proceed. Irreversible ones (force-push, delete production data, send external messages) still need confirmation. Make the system self-healing: when you notice a problem, log it and fix it in the next round. Product direction comes from the human, but execution should not block on it.

## Encode Lessons in Structure

**Applies when** you catch yourself writing the same instruction a second time, or notice a recurring correction.

Encode the rule as a lint, metadata flag, runtime check, or script instead of more text. If the fix is structural, use only the structural fix, because the instruction is the symptom. If the lesson needs judgment and can't be encoded, make the instruction more prominent and add an example of the failure mode.
