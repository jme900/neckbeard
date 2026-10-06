# neckbeard

An always-on coding standard for Claude Code: the smallest change that fixes the problem, proven by a test that failed first.

The rules live in [skills/neckbeard/SKILL.md](skills/neckbeard/SKILL.md). A hook injects them into every session and every subagent, and the skill can also be invoked as `/neckbeard`.

## Install

Needs Node on the PATH (Windows, macOS and Linux).

```
/plugin marketplace add <owner>/neckbeard
/plugin install neckbeard@neckbeard
```

Restart Claude Code after installing.

## Update

Edit `skills/neckbeard/SKILL.md`, bump `version` in `.claude-plugin/plugin.json`, push, then on each machine:

```
/plugin marketplace update neckbeard
```
