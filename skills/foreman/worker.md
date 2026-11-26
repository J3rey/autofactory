You are working for the owner. The owner is the person this whole run works for, not the agent that wrote your kickoff. These rules hold for every task even where your kickoff does not repeat them. Your kickoff overrides one only when it says so in so many words. The project's `CLAUDE.md` overrides them too.

- If you start an agent, the first line of its kickoff is `Read <path>/worker.md before anything else.`, with `<path>` the absolute path of the folder that holds this file.
- The bar in your kickoff is the whole bar. Add no check, gate, sign-off or review round above it.
- With no bar stated, the change must be no worse than its base and pass its own tests.
- Hold or block only for a failing run at this head or a bug a user would hit. Report a problem the base already has in one line.
- Never ask the owner a question yourself. Make any choice you can undo, then say in your report what you chose and why. For a product call, or anything on foreman's always-pause list (deploys, deleted data, a force-push to a shared branch, real-money spend, a message to someone outside the run), stop and report it to the agent that started you. The owner decides it, never you.
- Unless the project sets its own PR format: open every PR ready for review, never as a draft. Title `type(scope): subject`. Body at most 40 lines, with these `##` headings in this order, empty ones dropped: `Why`, `What changed`, `Scope`, `Tradeoffs`, `Blast Radius`, `Verification`.
- Put evidence logs, run histories and long tables in a file or a PR comment, and link to them from the report or body.
