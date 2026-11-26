---
name: neckbeard-teamwork
description: Use when someone wants work implemented and reviewed by a team of agents, and whenever they say "implement and review this with neckbeard", "build these tickets with agents", "have agents build and review this", or invoke /neckbeard-teamwork. You orchestrate; builder agents write the code, a fresh reviewer checks it, and only findings that survive your scrutiny get fixed. For building alone, see neckbeard; for a review alone, see neckbeard-review.
---

# neckbeard-teamwork

Run a small team: builders write the code, one fresh reviewer checks it, and you stand between them. You plan, brief, verify, judge findings and report. Agents know only what your brief tells them, report in the same confident tone whether right or wrong, and a reviewer handed your opinion tends to return it confirmed. So every handoff is written with care, and every claim coming back gets checked against the code before anyone acts on it.

The team is as small as the work allows. Every agent costs tokens and a lossy handoff, so one builder per unit of work, one reviewer for the whole change, and nothing spawned for a job you can do in a couple of tool calls.

## 1. Plan the work

Read every ticket or request in full, then the code each one touches. Enough to write a brief that names files and functions, not enough to build it yourself.

- **Units.** One unit per ticket, or per independent slice of a single request. One unit becomes one commit.
- **Order.** A unit that needs another unit's code runs after it.
- **Collisions.** Builders run one after another on the branch. Run them in parallel only when their units touch none of the same files, each in its own worktree, and you cherry-pick the results onto the branch in order. Unsure? One after another. A merge conflict between agents costs more than the time saved.
- **Work that isn't code.** An account setting, a console change, a live data fix: the builder writes the change (the command, the policy file, the script) and does not run it against a live system. It goes in the final report as a step for the user.
- **Pre-flight.** Clean working tree, right branch, test suite runs. Fix or report anything that would sink every builder, before spawning one.

Say the plan in a few lines (units, order, what runs in parallel) and start. Ask the user only if a ticket genuinely contradicts itself or the code.

## 2. Brief the builders

Each builder gets one unit and a brief it can act on cold:

- the ticket text, verbatim: its requirements are the spec
- the files and functions to start from, and anything you've already ruled out
- the rules: follow neckbeard, the repo's conventions win, run the narrowest relevant tests, and commit only that unit's files with the repo's commit format, if commits were asked for
- what not to do: no pushing, no pull requests, no edits outside the unit, no live systems
- what to hand back: what was built in two or three lines, the files changed, the tests added and their result, the commit hash, and anything skipped or still in doubt

Give a builder the model the work deserves: a capable one for real design or tricky code, a cheaper one for mechanical changes. Never cheaper for the reviewer.

## 3. Verify each unit

When a builder reports, check it before starting the next unit. Read the commit's diff, run its tests yourself, and confirm every requirement in the ticket is met by something in the diff. A report saying "done" is a claim, not a result.

Something wrong or missing goes back to that builder (continue it, don't start a fresh one: it still has its context) with the exact gap. A unit is done when its diff meets the ticket and its tests pass in your own run.

## 4. Review with fresh eyes

Once every unit is in, spawn one reviewer that has seen none of the building. Give it the ticket texts and the commit range, and have it load `neckbeard-review`. Don't give it the builders' reports, your opinion of the code, or where you suspect trouble: that anchors it.

The reviewer lists findings; it doesn't fix them. A diff too big for one careful read gets one reviewer per unit instead.

## 5. Judge every finding

This is the step that matters most. Open the cited lines for each finding and decide for yourself:

- **Real.** You can reproduce it: the concrete input and the wrong result, or the ticket requirement left unmet.
- **Overstated.** Real, but smaller than its severity claims. Keep it at the right size.
- **Wrong.** The cited code doesn't exist, doesn't do what the finding says, or the input can't happen.
- **Not this change.** It was already there. One line in the report, no fix.
- **Adds code.** The fix only adds a guard, a layer or a test that doesn't earn its place under neckbeard's questions.

Push back on everything that isn't plainly real. Send the reviewer your evidence (the line, the trace, the reason) and ask for a concrete failing input or a withdrawal. Two rounds per finding at most; after that, your call stands, and the report says where you and the reviewer still disagreed.

## 6. Fix what survived

Only the findings that held up get fixed, each by the builder that wrote that unit (continued, with the finding and your evidence), or by you when it's a line or two. Fixes are held to the same rules as the original build: least code, plus a test only where the finding exposed a place the change can break.

Keep one commit per unit. If the branch hasn't been pushed, fold each fix into its unit's commit (`git commit --fixup` and a non-interactive autosquash rebase). If it has been pushed, add a fix commit per unit; never force-push.

Then send the fixed findings back to the same reviewer, and only those, for a verdict on each: resolved or not. Not resolved goes around once more; still not resolved goes in the report as open.

## 7. Stop and report

Stop. No pushing, no pull request, no next tickets, unless the user asked. Then report:

- **Built:** one line per unit: what it does now, its commit, its test result.
- **Review:** each finding in one line, with its verdict (real, overstated, wrong, not this change, adds code) and what happened to it.
- **Back and forth:** the exchanges that changed something, such as a builder sent back for a missed requirement, a finding withdrawn under pushback, or a disagreement left standing.
- **For the user:** steps the builders couldn't take (live changes, secrets, deploys) and anything still open.

Short. The user can ask for more.

## Example

"Implement EO-12 and EO-13 with neckbeard and review it." EO-13 extends code EO-12 adds.

Over-run: six agents in parallel on one branch, a reviewer briefed with "check the token handling, I think it's weak", and all nine findings fixed without anyone opening the code.

neckbeard-teamwork: EO-12's builder first, verified by running its tests; then EO-13's. A fresh reviewer gets both tickets and the commit range and raises five findings. Two hold up. One is withdrawn when shown that the "missing" check runs a line earlier. One is pre-existing, and one would only add a guard for a case that can't happen. The two real ones are fixed by their builders, folded into their commits, and confirmed resolved by the reviewer. Report: two commits, five findings, two fixed, three rejected with reasons.
