import { LLMMessage } from "@/lib/llm/client";

export function truncateToCharBudget(messages: LLMMessage[], charBudget: number): LLMMessage[] {
  let total = messages.reduce((sum, m) => sum + m.content.length, 0);
  if (total <= charBudget) return messages;

  const first = messages[0];
  const rest = messages.slice(1);
  let budget = charBudget - first.content.length;

  const kept: LLMMessage[] = [];
  for (let i = rest.length - 1; i >= 0; i--) {
    const len = rest[i].content.length;
    if (budget - len < 0) break;
    kept.unshift(rest[i]);
    budget -= len;
  }

  console.log(`[PDF] Conversation tronquée : ${messages.length} → ${1 + kept.length} messages (budget ${charBudget} chars)`);
  return [first, ...kept];
}
