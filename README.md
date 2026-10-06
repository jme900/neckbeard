# neckbeard

A coding standard for Claude Code that is on in every session: **the smallest change that fixes the problem, proven by a test that failed first.**

AI-written code drifts wordy and over-built. You get helpers nobody needed, tests that mock their way to green, and comments that retell the ticket. neckbeard keeps the agent close to how a careful senior developer works: read first, reuse what exists, write the test before the fix, change as little as possible, and say what was left out.

## The prompt

neckbeard is one prompt: [`skills/neckbeard/SKILL.md`](skills/neckbeard/SKILL.md). The rest of this repo only loads that prompt into Claude Code.

## What it does

**Before writing code**, the agent reads the code the change touches, then stops at the first rung that holds:

```
1. Does it need to exist?          no: skip it, say so in one line
2. Already in this codebase?       reuse it
3. Stdlib or installed dependency? use it
4. Only then:                      the minimum new code
```

A bug fix, or a rule about the data, goes in the one place every caller routes through. Anything beyond the asked-for change has to clear rung 1 first, whoever suggested it.

**Making a change:**

| Step | What it means |
|---|---|
| Red | One small test per break point, run and seen failing before any production code |
| Green, in place | Edit the existing code. A new function needs logic of its own; a wrapper that only forwards one call gets inlined |
| Boundaries | Fake only external things (network, database, cloud, other processes). Never re-implement the fake, never bend production code to suit it |
| Assert behaviour | A test that still passes with the fix deleted gets rewritten |
| Readable over short | Plain loops and named variables beat dense one-liners |
| Comments | Only where the code confuses. No tickets, people or history. A deliberate corner cut gets one line: `# neckbeard: global lock, per-account locks if throughput matters` |
| Self-check | Every added line traces to a red test or to the task. Anything else is removed |

Never simplified away: input validation at trust boundaries, error handling that prevents data loss, security, and anything you explicitly asked for.

**Reporting back**, each change comes with: the failing test output (red), the passing run (green), the diff, and at most three lines on what was skipped and when to add it.

**Reviewing**, the agent runs two passes and numbers every comment so you can say "fix 2 and 5":
1. **Works:** crash paths and the inputs the data can really hold (empty, null, wrong type, missing keys, whitespace, duplicates).
2. **Simplest:** the rungs and the steps above.

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

A `SessionStart` and a `SubagentStart` hook inject `SKILL.md` into every session and every subagent, so spawned agents follow it too. It is also a normal skill, so `/neckbeard` (or asking for "clean clear code", "TDD", "KISS style", "YAGNI") loads it on demand. It costs about 1.3k tokens of context per session and per subagent.

Your repo's own conventions (contributor docs, test runner, linter, shared fixtures) always win over neckbeard.

## Install

Works on Windows, macOS and Linux.

**1. Prerequisites**

| | Check | If missing |
|---|---|---|
| Node 18+ on the PATH (runs the hook) | `node --version` | Windows: `winget install OpenJS.NodeJS.LTS`. macOS: `brew install node`. Linux: your package manager or [nodejs.org](https://nodejs.org) |
| GitHub access to this private repo | `gh auth status` | `gh auth login`, or an SSH key on your GitHub account |

**2. Install** in Claude Code, as two separate prompts:

```
/plugin marketplace add jme900/neckbeard
```
```
/plugin install neckbeard@neckbeard
```

**3. Restart Claude Code.** Hooks load at startup.

**4. Check it is on:** in a new session, ask "what coding rules are you following?" It should describe the rungs and the red/green steps. `/plugin` should list `neckbeard` as enabled.

### Moving from a manual install

If a machine already has neckbeard set up by hand, remove the old copy after installing the plugin, or the rules get injected twice:

- `~/.claude/skills/neckbeard/`
- `~/.claude/hooks/neckbeard_context.py`
- the two `neckbeard_context.py` entries under `SessionStart` and `SubagentStart` in `~/.claude/settings.json`

## Update

Edit [`skills/neckbeard/SKILL.md`](skills/neckbeard/SKILL.md), bump `version` in [`.claude-plugin/plugin.json`](.claude-plugin/plugin.json), and push. Then on each machine:

```
/plugin marketplace update neckbeard
```

and restart Claude Code.

## Turn it off

```
/plugin disable neckbeard@neckbeard
```

`/plugin enable neckbeard@neckbeard` turns it back on, and `/plugin uninstall neckbeard@neckbeard` removes it.
