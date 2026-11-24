<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/logo-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="docs/logo-light.svg">
    <img alt="neckbeard logo: a pixel-art senior dev with a hat, glasses and a neckbeard" src="docs/logo-light.svg" width="220">
  </picture>
</p>

<h1 align="center">neckbeard</h1>

<p align="center">
  <b>The least code that does the job, proven by a test that would catch it breaking.</b><br>
  An always-on coding standard for Claude Code.
</p>

<p align="center">
  <a href="#install"><img alt="Claude Code plugin" src="https://img.shields.io/badge/Claude_Code-plugin-D97757"></a>
  <a href="LICENSE"><img alt="MIT license" src="https://img.shields.io/badge/license-MIT-2f8a55"></a>
  <a href=".claude-plugin/plugin.json"><img alt="Version 2.2.0" src="https://img.shields.io/badge/version-2.2.0-111111"></a>
  <img alt="Node 18 or newer" src="https://img.shields.io/badge/node-18%2B-339933">
  <img alt="Runs on macOS, Linux and Windows" src="https://img.shields.io/badge/macOS_%7C_Linux_%7C_Windows-supported-555">
</p>

<p align="center">
  <a href="#install">Install</a> ·
  <a href="#what-it-does">What it does</a> ·
  <a href="#before--after">Before / after</a> ·
  <a href="#how-it-works">How it works</a> ·
  <a href="#update">Update</a>
</p>

---

You know the type. Has maintained every over-built codebase in the building and been paged for each one. You show them a `RecipientFilter` base class with a factory and a config flag; they delete it and write three lines inside the loop that was already there.

neckbeard puts that senior dev inside Claude Code, in every session and every subagent.

AI-written code drifts wordy and over-built. You get helpers nobody needed, tests that mock their way to green, and comments that retell the ticket. neckbeard keeps the agent close to how a careful senior developer works: grill the task before writing, reuse what exists, change as little as possible, protect the places it can break, and say what was left out.

## Install

Works on Windows, macOS and Linux. Needs Node 18+ to run the hook: check with `node --version`, or install it with `winget install OpenJS.NodeJS.LTS` (Windows), `brew install node` (macOS) or your package manager (Linux).

1. Open a terminal (PowerShell, Terminal or any shell) and run the commands below. If it says `claude` isn't found, you only have the VS Code extension, which doesn't add the command to your terminal. Install it first with `npm install -g @anthropic-ai/claude-code`.

   ```
   claude plugin marketplace add jme900/neckbeard
   claude plugin install neckbeard@neckbeard
   ```

2. Restart Claude Code (in VS Code, reload the window). Hooks load at startup.
3. In a new session, ask "what coding rules are you following?" It should describe the four questions and the build rules.

## The prompts

neckbeard is three prompts:

- [`skills/neckbeard/SKILL.md`](skills/neckbeard/SKILL.md): the coding standard, injected into every session and every subagent.
- [`skills/neckbeard-review/SKILL.md`](skills/neckbeard-review/SKILL.md): the review, loaded when you ask for one.
- [`skills/neckbeard-plan/SKILL.md`](skills/neckbeard-plan/SKILL.md): planning, loaded when you start planning.

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

**Planning** (`/neckbeard-plan`, or just say you're planning) runs like a team meeting instead of a monologue. It goes from broad to narrow in five stages: ideas, alignment, rough plan, detail, approval. The agent proposes each move to the next stage and only moves when you agree. It gives its honest verdict on your idea before building on it, asks one question per reply, uses plain words, and changes only what you correct. Every decision goes into notes on a shareable page, or a markdown file outside the repo when it can't publish one. Nothing gets built until you approve the plan.

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

A `SessionStart` and a `SubagentStart` hook inject the coding standard into every session and every subagent, so spawned agents follow it too. It is also a normal skill, so `/neckbeard` (or asking for "clean clear code", "KISS", "YAGNI", "80/20") loads it on demand. It costs about 1.4k tokens of context per session and per subagent. The review and planning skills are not injected; each loads only when asked for.

Your repo's own conventions (contributor docs, test runner, linter, shared fixtures) always win over neckbeard.

## Update

```
claude plugin marketplace update neckbeard
```

Then restart Claude Code.

## Turn it off

```
claude plugin disable neckbeard@neckbeard
```

`claude plugin enable neckbeard@neckbeard` turns it back on, and `claude plugin uninstall neckbeard@neckbeard` removes it.

## License

[MIT](LICENSE)
