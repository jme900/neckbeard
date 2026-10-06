---
name: neckbeard
description: Use for every coding task, bugfix, test change or code review, and whenever someone asks for clean clear code, TDD, KISS style, 80/20, YAGNI, "neckbeard" or "/neckbeard".
---

# neckbeard

The smallest change that fixes the problem, proven by a test that failed first. The repo's own conventions (its contributor docs, test runner, linter and shared fixtures) win over anything here.

## Before writing code

Read the task and trace the real flow end to end, every file the change touches. Then stop at the first rung that holds:

1. **Does it need to exist?** A speculative need is skipped and named in one line.
2. **Already in this codebase?** Reuse the helper, fixture or pattern a few files over.
3. **Stdlib or an installed dependency does it?** Use it. No new dependency for what a few lines can do.
4. **Only then:** the minimum new code.

A bug fix, or a rule about the data (normalising, defaults, invariants), goes in the one place every caller routes through. Find every caller first, then put it there once.

**Push back before writing.** Anything beyond the asked-for change (an extra field, check, guard, refactor, test or doc line) clears rung 1 before it's written, whoever suggested it: you, the request or a review. If it doesn't, say no in one line with the reason; if unsure, ask first. Data that enters outside the code being changed (hand edits, other writers) isn't this change's job to absorb. Name it, don't guard it.

## How a change is made

1. **Red.** For each break point in the plan, write one test using the smallest data that hits it. One test per break point across the whole change, not per layer: behaviour already proven through one layer isn't tested again in another. Run it and see it fail for the right reason before writing any production code.
2. **Green, in place.** Edit the existing function or loop until the red tests pass. A new function earns its place by holding logic of its own under a name that tells the reader more than its body would. A wrapper that only renames or forwards one expression is inlined, however many callers it has. A helper that needs a long parameter list is code that wanted to stay where it was. No interface with one implementation, no config for a value that never changes, no check an earlier check already guarantees, no scaffolding for later, fewest files.
3. **Boundaries.** Fake only what's external: networks, databases, cloud services, other processes. When the fake can't run the real call, mock the function that makes the call and assert the arguments it receives. Production code stays as it would be without the fake, and a test never re-implements the boundary.
4. **Assert behaviour.** Every assert checks something the code under test produced. A test that passes with the fix deleted gets rewritten. A test that needs workarounds for a fake's quirks asserts a plainer property instead.
5. **Readable over short.** Plain loops and named variables over dense one-liners.
6. **Comments.** Only where the code itself confuses. An example input and output beats prose. No tickets, people, chat threads or history. A deliberate corner cut with a known ceiling gets one line naming the ceiling and the upgrade path: `# neckbeard: global lock, per-account locks if throughput matters`.
7. **Self-check.** Re-read the diff. Every added line traces to a red test or to the task. Anything else is removed, including a refactor folded in alongside a fix, and any change whose reason was later dropped.

Never simplified away: input validation at trust boundaries, error handling that prevents data loss, security, anything explicitly requested.

## Hand-back

The report for a change includes:
- **Red:** the failing test output from step 1, before the fix.
- **Green:** the passing run after it.
- **Diff:** the diff itself.
- **Skipped:** at most three lines on what was left out and when to add it.

## Reviewing

A review runs two passes, in order. **Works:** crash paths and the inputs the data can really hold through the paths the change owns (empty, null, wrong type, missing keys, whitespace, duplicates). **Simplest:** the rungs and the seven steps. A finding whose fix only adds code clears rung 1 like any other addition; if it doesn't, leave it out of the review. Number every comment `1.`, `2.`, ... across both passes, each tied to a file and line.
