# neckbeard

A coding standard for Claude Code that is on in every session: **the least code that does the job, proven by a test that would catch it breaking.**

AI-written code drifts wordy and over-built. You get helpers nobody needed, tests that mock their way to green, and comments that retell the ticket. neckbeard keeps the agent close to how a careful senior developer works: grill the task before writing, reuse what exists, change as little as possible, protect the places it can break, and say what was left out.

## The prompts

neckbeard is two prompts:

- [`skills/neckbeard/SKILL.md`](skills/neckbeard/SKILL.md): the coding standard, injected into every session and every subagent.
- [`skills/neckbeard-review/SKILL.md`](skills/neckbeard-review/SKILL.md): the review, loaded when you ask for one.

The rest of this repo only loads those prompts into Claude Code.

## What it does

**First, grill the task.** The agent reads the code the change touches and traces the real flow, then asks in order and stops at the first yes:

```
1. Does this need to exist?                        no: skip it, say so in one line
2. Is it already here?                             reuse it
3. Does the standard library or a dependency do it? use it
4. Only then:                                      the least new code that does the job
```

Anything beyond the asked-for change has to earn its place in one sentence, whoever suggested it. The agent says what it would drop and why before it builds.

**Then build it:**

| Rule | What it means |
|---|---|
| Fix it where every caller passes through | A bug fix or a rule about the data goes in the one function all callers route through |
| Edit in place | A new function needs logic of its own; a wrapper that only forwards a call gets inlined |
| No layers nobody asked for | No interface with one implementation, no config for a value that never changes, no scaffolding for later |
| Readable over short | Plain loops and named variables beat dense one-liners |
| Comments only where the code confuses | No tickets, people or history. A corner cut on purpose gets one line: `# neckbeard: global lock, per-account locks if throughput matters` |
| Keep every safety net | Checks on outside data, error handling that prevents data loss, security, anything you asked for |

**Tests protect the change.** One small test for each place the change can break, with the smallest data that breaks it. A test is real when it fails without the fix, fakes only what is outside the process, and asserts what the code produced rather than what a mock returned.

**Before handing back**, the agent re-reads its own diff. Every added line traces to the task or to a test that protects it; anything else comes out. You get the code, then at most three lines on what was skipped and when to add it.

**Reviewing** (`/neckbeard-review`, or just ask for a review) reads the ticket first, so a requirement the diff doesn't meet is the top finding, then checks whether the change works and whether it is the least code. Findings are one line each, one per theme, grouped Critical, Important, Minor, Nit, and numbered so you can say "fix 2 and 5".

## Before / after

You ask the agent to stop emailing users who have no address on file. Without neckbeard it adds a `RecipientFilter` base class, one subclass, a factory function, a config flag to turn the check off, and a test that mocks the filter to return `True` and then asserts `True`.

With neckbeard, inside the existing send loop:

```python
if not user.email:
    logger.warning(f"skipping {user.id}: no email")
    continue
```

plus one test that runs a user without an email through the real loop, and fails without the fix.

## How it works

A `SessionStart` and a `SubagentStart` hook inject the coding standard into every session and every subagent, so spawned agents follow it too. It is also a normal skill, so `/neckbeard` (or asking for "clean clear code", "KISS", "YAGNI", "80/20") loads it on demand. It costs about 1.4k tokens of context per session and per subagent. The review skill is not injected; it loads only when a review is asked for.

Your repo's own conventions (contributor docs, test runner, linter, shared fixtures) always win over neckbeard.

## Install

Works on Windows, macOS and Linux.

**1. Prerequisites**

| | Check | If missing |
|---|---|---|
| Node 18+ on the PATH (runs the hook) | `node --version` | Windows: `winget install OpenJS.NodeJS.LTS`. macOS: `brew install node`. Linux: your package manager or [nodejs.org](https://nodejs.org) |

**2. Install** in Claude Code, as two separate prompts:

```
/plugin marketplace add jme900/neckbeard
```
```
/plugin install neckbeard@neckbeard
```

**3. Restart Claude Code.** Hooks load at startup.

**4. Check it is on:** in a new session, ask "what coding rules are you following?" It should describe the four questions and the build rules. `/plugin` should list `neckbeard` as enabled.

### Moving from a manual install

If a machine already has neckbeard set up by hand, remove the old copy after installing the plugin, or the rules get injected twice:

- `~/.claude/skills/neckbeard/`
- `~/.claude/hooks/neckbeard_context.py`
- the two `neckbeard_context.py` entries under `SessionStart` and `SubagentStart` in `~/.claude/settings.json`

## Update

Edit the prompt under [`skills/`](skills/), bump `version` in [`.claude-plugin/plugin.json`](.claude-plugin/plugin.json), and push. Then on each machine:

```
/plugin marketplace update neckbeard
```

and restart Claude Code.

## Turn it off

```
/plugin disable neckbeard@neckbeard
```

`/plugin enable neckbeard@neckbeard` turns it back on, and `/plugin uninstall neckbeard@neckbeard` removes it.
