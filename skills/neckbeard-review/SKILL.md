---
name: neckbeard-review
description: Use when reviewing a diff, branch, pull request or staged changes, and whenever someone asks "review this", "what can we delete", "is this over-engineered", "is this the simplest fix", or invokes /neckbeard-review.
---

# neckbeard-review

Review a diff the way neckbeard builds one: does it work, then is it the least code. One line per finding. The diff's best outcome is getting shorter. You list, you don't fix.

## Pass 1: does it work?

Walk the code the change touches with the inputs the data can really hold: empty, null, wrong type, missing keys, whitespace, duplicates, and every path that can crash. Stay inside the change. A bug that was already there gets one line, not a review.

## Pass 2: is it the least code?

Run the neckbeard questions and build rules against the diff. Look for:

- **Already existed.** A helper, fixture or pattern a few files over, or in the standard library, doing what the diff rewrote. Name the path or function.
- **Layers nobody asked for.** An interface with one implementation, config nobody sets, a wrapper that only forwards a call, a guard for a case that can't happen, a check an earlier check already guarantees.
- **A refactor that rode along** with the fix.
- **Tests that don't test.** Still pass with the fix deleted, assert a mock's own return value, re-implement the thing they fake, or prove through two layers what one already proved.
- **Comments that retell the ticket**, name people, or explain a decision instead of confusing code.

A finding whose fix only adds code gets grilled like any other addition; if it doesn't earn its place in one sentence, it isn't a finding.

## Format

`<N>. <file>:L<line>: <what's wrong>. <what replaces it>.`

Number across both passes so the author can say "fix 2 and 5".

❌ "This validator class might be more complex than necessary; have you considered whether all these rules are needed at this stage?"

✅ `1. handler.py:L41: user["email"].lower() raises when email is missing. user.get("email"), skip the row.`

✅ `2. models.py:L12-38: 27-line EmailValidator class. "@" in email; the confirmation mail is the real check.`

✅ `3. test_send.py:L88: asserts the mocked send() returned True. Assert the arguments send() was called with.`

✅ `4. repo.py:L88: AbstractRepository with one implementation. Inline it until a second one exists.`

✅ `5. utils.py:L18-29: slugify duplicates lib/slug.py. Delete it, import the existing one.`

End with `net: -<N> lines possible.` Nothing to cut and nothing broken? Say `Lean. Ship.` and stop.
