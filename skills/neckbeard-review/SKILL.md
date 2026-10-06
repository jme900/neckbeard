---
name: neckbeard-review
description: Use when reviewing a diff, branch, pull request or staged changes, and whenever someone asks "review this", "what can we delete", "is this over-engineered", "is this the simplest fix", or invokes /neckbeard-review.
---

# neckbeard-review

Review a diff the way neckbeard builds one: what was asked, does it work, then is it the least code. One line per finding, grouped by how much it matters. The diff's best outcome is getting shorter. You list, you don't fix.

## First, the ask

Read the ticket or issue the PR links before the diff. Its requirements are the spec. The PR description is the author's claim about meeting them, and it can quietly narrow a requirement, so check each requirement against the diff, not against the description. For every requirement and every claim, find the test that fails without the change; if there is none, say so. A requirement the diff doesn't meet, or meets only halfway, is the top finding.

## Then the diff

**Does it work?** Walk the code the change touches with the inputs the data can really hold: empty, null, wrong type, missing keys, whitespace, duplicates, and every path that can crash. Stay inside the change. A bug that was already there gets one line, not a review.

**Is it the least code?** Run the neckbeard questions and build rules against the diff. Look for:

- **Already existed.** A helper, fixture or pattern a few files over, or in the standard library, doing what the diff rewrote. Name the path or function.
- **Layers nobody asked for.** An interface with one implementation, config nobody sets, a wrapper that only forwards a call, a guard for a case that can't happen, a check an earlier check already guarantees.
- **A refactor that rode along** with the fix.
- **Tests that don't test.** Still pass with the fix deleted, assert a mock's own return value, re-implement the thing they fake, or prove through two layers what one already proved.
- **Comments that retell the ticket**, name people, or explain a decision instead of confusing code.

## Findings

One finding per theme. A helper and the test that only exercises it are one finding. Two tests proving one thing are one finding. A finding whose fix only adds code gets grilled like any other addition; if it doesn't earn its place in one sentence, it isn't a finding.

Group by severity, most severe first, and keep the top group short enough to act on:

- **Critical.** Wrong behaviour, lost data, or a requirement not met. Always shown, never argued: the concrete input and the wrong result it gives, `input -> wrong result`.
- **Important.** A claim with no test that fails without the change, or a safety net the diff removed.
- **Minor.** The diff gets shorter: already existed, a layer nobody asked for, a refactor that rode along, a test that proves what's proven.
- **Nit.** Wording, a comment, an impossible branch.

Format: `<N>. <file>:L<line>: <what's wrong>. <what replaces it>.` Number across all groups so the author can say "fix 2 and 5".

❌ "This validator class might be more complex than necessary; have you considered whether all these rules are needed at this stage?"

✅ `1. handler.py:L41: user["email"].lower() raises when email is missing. user.get("email"), skip the row.`

✅ `2. models.py:L12-38: 27-line EmailValidator class. "@" in email; the confirmation mail is the real check.`

✅ `3. test_send.py:L88: asserts the mocked send() returned True. Assert the arguments send() was called with.`

✅ `4. repo.py:L88: AbstractRepository with one implementation. Inline it until a second one exists.`

✅ `5. utils.py:L18-29: slugify duplicates lib/slug.py. Delete it, import the existing one.`

End with `net: -<N> lines possible.` Nothing to cut and nothing broken? Say `Lean. Ship.` and stop.
