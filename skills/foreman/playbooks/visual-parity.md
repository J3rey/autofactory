### Visual parity

Runs automatically when a job builds or changes UI from an approved mock (an artifact, a design canvas, design screenshots, or a mock folder). Otherwise runs when the owner asks.

**You own pixel-exact equivalence. The baseline is the spec. You do not touch it.** Equivalence is verified by image diff, not by eye.

Anti-shortcut clauses, stated and held in both modes: no harness modifications, no baseline or mock tampering, no component restructuring to make a diff pass. If the baseline or mock looks wrong, stop and ask, don't edit it.

Use **mock mode** when the reference is an approved mock. Use **implementation mode** when matching two implementations or migrating a styling system.

#### Mock mode

An approved mock must look the same. Mock mode is not a looser tolerance. It removes the reasons a diff can't pass.

1. List every screen and state the mock shows. Check each one at desktop and phone width.
2. Load the app with the mock's own content (the same text, names, quotes, and images) through fixtures, seeded data, or a stub.
3. Screenshot app and mock at the same viewport with Playwright or a CDP browser, and diff them by image. Only font-smoothing or antialiasing noise may remain, under a small pixel threshold you state before the first diff and hold for every screen.
4. Fix every remaining difference in the app, or list it for the owner to decide. A mock value that isn't a design token is the owner's call: fix the mock or the app. Nothing passes silently.
5. A screen matches only when its diff is within the threshold and every listed difference has the owner's ruling. A screen that doesn't match blocks the PR.
6. Put the app screenshot, the mock screenshot, and the diff image in the reply and the PR, for each screen, state, and width.

#### Implementation mode

1. Establish the baseline first, before any migration: a visual regression harness that screenshots the current component across its states, plus the target when matching two implementations. No baseline, no parity claim. A blocking prerequisite, not a follow-up.
2. Migrate one component at a time. Parallelize across worktrees, one owner per component (the **Separate Before Serializing Shared State** principle). Shared primitives migrate first as a blocking phase.
3. Verify each component against its baseline via image diff on the matching surface with Playwright or a CDP browser. A nonzero diff is a fail. Investigate the pixel delta. `/loop` per component until the diff is zero.
4. Run **Opening a PR** per component or per safe batch.

**Reply:** in mock mode, each screen, state, and width with its three images, the threshold, what you fixed, and the differences waiting on the owner. In implementation mode, components migrated, the diff result for each, the baseline harness location, what's left.
