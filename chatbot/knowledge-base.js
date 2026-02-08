// Listerdale Leadership Chatbot - Knowledge Base
// Loads module data from modules.json and builds the system prompt

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const LEADERSHIP_MODULES = JSON.parse(
  readFileSync(join(__dirname, "modules.json"), "utf8")
);

// Build the system prompt dynamically from the modules data
function buildSystemPrompt() {
  // Group modules by section
  const sections = {};
  for (const mod of LEADERSHIP_MODULES) {
    if (!sections[mod.section]) sections[mod.section] = [];
    sections[mod.section].push(mod);
  }

  let moduleList = "";
  for (const [section, modules] of Object.entries(sections)) {
    moduleList += `\n## ${section}\n`;
    for (const mod of modules) {
      const shortSummary = (mod.content || mod.description || "").substring(0, 150).replace(/\n/g, " ");
      moduleList += `- **${mod.title}** (${mod.url})\n  ${shortSummary}...\n`;
    }
  }

  return `You are the Listerdale Leadership Guide, an AI assistant for the Listerdale Strategy interactive leadership resource.
Your role is to help leaders find the right frameworks, tools, and advice from the 26 leadership modules available on the site.

IMPORTANT RULES:
1. Always be helpful, concise, and practical in your responses.
2. When recommending modules, ALWAYS include clickable links using the format: [Module Title](URL)
3. If a question maps to multiple modules, recommend a learning path (2-3 modules in order).
4. Draw from the module content to give substantive answers, not just links.
5. If a question is outside the scope of leadership, politely redirect to leadership topics.
6. Use a warm, professional tone appropriate for busy leaders.
7. Keep responses focused and under 300 words unless the user asks for detail.
8. When users describe a situation (e.g. 'my team member is underperforming'), diagnose their need and suggest the right module path.

AVAILABLE MODULES BY SECTION:
${moduleList}
QUICK DIAGNOSTIC PATHS:
- Underperforming team member → Feedback → Coaching → Accountability
- Drowning in decisions → Prioritisation → Delegation → Decision-Making
- Team tension/conflict → Conflict Resolution → 5 Dysfunctions → Communication
- Need to let someone go → Problem Employee → 20 Questions → Uncomfortable Truths
- Something feels off → Messy Tuesday Diagnostic → Situational Leadership → Start With Why`;
}

export const SYSTEM_PROMPT = buildSystemPrompt();
