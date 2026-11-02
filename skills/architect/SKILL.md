---
name: architect
description: "Sketch types, signatures, and module structure before code, then stay in the loop while implementation fills in. Use for /autofactory:architect, 'architect this', 'design this', or non-trivial work where jumping to code would lock in the wrong shape."
disable-model-invocation: true
---

# Architect

Sketch types, function signatures, class shapes, and module boundaries with `not implemented` bodies and pseudocode. Produce one design, then fill in code against it.

## Start

Use the session's task list tool to open one entry per phase before starting.

1. Ground
2. Sketch
3. Agree
4. Implement
5. Scrap

## Phase A: Ground the problem

Build a real mental model of every system the new code touches. Read `../how/SKILL.md` and follow it over the relevant subsystems. Naming a file isn't grounding. Produce the architectural explanation `how` prescribes. If the design redefines ownership or layering, also read `../why/SKILL.md` and follow it on the existing shape so the rationale becomes a constraint, not a guess.

Skip Phase A only when the work is genuinely greenfield with no surrounding system to integrate.

## Phase B: Sketch

Produce one design sketch from the Phase A grounding. Do it yourself. When the work is large, spawn one `opus` subagent at `xhigh` (`subagent_type: "general-purpose"`) and give it the task and the Phase A artifacts.

Apply these checks as you sketch.

- Caller's usage first. Write the README-style usage and two or three real call sites before the types, then derive the type sketch from them. The usage is the spec. Reconcile the sketch to the usage, not the reverse.
- Data structures first. Trace each dominant access pattern through the proposed structure. If the answer is "we'll add a map / index / cache later," the structure is wrong.
- Shared state: if two actors might both write, default to per-actor state with a merge at the read boundary, per the **Separate Before Serializing Shared State** principle.

Screen the design against [`references/design-red-flags.md`](references/design-red-flags.md). Assume the next contributor is an agent that sees only the files it opened, copies the nearest example, and takes the shortest path that compiles. Prefer the design where a change that looks right from one file is right for the whole repo.

Judge interface depth. Prefer the design that hides more complexity behind a smaller, simpler public surface. A rich interface can keep call chains short by concentrating capability instead of scattering it across layers. Do not put transport or wire types on the public API.

Revise the design until it passes the red flags. One design ships.

## Phase C: Agree (opt-in)

Default: proceed directly to implementation with the design. No human checkpoint.

Opt in to a checkpoint when the invoker explicitly asks: "/autofactory:architect with checkpoint," "stop and show me before implementing," or similar. Then surface the design and pause for sign-off.

The sketch can ship as its own commit either way, as the "scaffold first" mode of the **Foundational Thinking** principle. Planned and scoped breakage during fill-in is fine, per the **Outcome-Oriented Execution** principle. For adversarial pressure on the design before implementing, read `../interrogate/SKILL.md` and follow it on the sketch.

If the human pushes back on the shape (in a checkpoint or after the fact), treat that as Phase A evidence. Re-ground and redo Phase B before writing more code.

## Phase D: Implement against the sketch

Replace `not implemented` bodies with code, pseudocode with logic. The sketch is the contract. Deviations from it are signal to surface, not friction to absorb silently. If a function needs a parameter the sketch didn't anticipate, ask whether the sketch was wrong, the requirement was missed, or the implementation is overreaching.

## Phase E: Scrap when the architecture is wrong

If implementation keeps producing friction the sketch can't absorb, throw the sketch out. Don't bolt fixes onto a wrong design, per the **Redesign from First Principles** and **Fix Root Causes** principles.

The signal is a *pattern*, not single instances. Tells:

- The same shape of workaround appearing repeatedly across unrelated code.
- Multiple unrelated edge cases that all need special-case branches.
- Types that need escape hatches (`any`, casts, optional fields always set in practice) to compile.
- The "we need a lock" reflex when the sketch said the state wasn't shared.
- Callers having to know the abstraction's internal rules to use it.
- Two or more independent Phase D deviations of the same shape across the implementation.

Use judgment. A few edge cases don't condemn an architecture. Some problems are legitimately complex. Complexity in the data is not complexity in the design.

When you scrap:

1. Re-run `../how/SKILL.md` over what's been built.
2. Redesign as if the new constraints had been day-one assumptions, per the **Redesign from First Principles** principle.
3. Subtract before adding, per the **Subtract Before You Add** principle. The new sketch should be smaller than the old one before it grows.
4. Return to Phase B.

## Outputs

The caller's usage is written first and the type sketch derived from it. One file with new types and signatures for small changes. Module map plus type definitions for larger work. The rationale ships alongside, shaped per `references/rationale-template.md`, including the usage sketch.
