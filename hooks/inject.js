const fs = require("node:fs");
const path = require("node:path");

const event = process.argv[process.argv.length - 1];
const skill = path.join(__dirname, "..", "skills", "neckbeard", "SKILL.md");

let text = fs.readFileSync(skill, "utf8");
// "---\nname: x\n---\nbody" -> "body"
if (text.startsWith("---")) {
  text = text.split("---").slice(2).join("---");
}

process.stdout.write(
  JSON.stringify({ hookSpecificOutput: { hookEventName: event, additionalContext: text.trim() } })
);
