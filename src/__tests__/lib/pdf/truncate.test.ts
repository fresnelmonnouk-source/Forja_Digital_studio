import { truncateToCharBudget } from "@/lib/pdf/truncate";

interface LLMMessage {
  role: "user" | "assistant";
  content: string;
}

describe("truncateToCharBudget", () => {
  it("should return all messages if total length is within budget", () => {
    const messages: LLMMessage[] = [
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hi there" },
    ];
    const result = truncateToCharBudget(messages, 1000);
    expect(result).toEqual(messages);
  });

  it("should always keep the first message", () => {
    const messages: LLMMessage[] = [
      { role: "user", content: "A".repeat(100) },
      { role: "assistant", content: "B".repeat(100) },
      { role: "user", content: "C".repeat(100) },
    ];
    const result = truncateToCharBudget(messages, 150);
    expect(result[0]).toEqual(messages[0]);
  });

  it("should truncate from the beginning when necessary", () => {
    const messages: LLMMessage[] = [
      { role: "user", content: "A".repeat(50) },
      { role: "assistant", content: "B".repeat(100) },
      { role: "user", content: "C".repeat(100) },
    ];
    const result = truncateToCharBudget(messages, 180);
    expect(result).toContain(messages[0]);
    expect(result.length).toBeLessThan(messages.length);
  });

  it("should handle empty message array", () => {
    const messages: LLMMessage[] = [];
    const result = truncateToCharBudget(messages, 1000);
    expect(result).toEqual([]);
  });

  it("should preserve message order", () => {
    const messages: LLMMessage[] = [
      { role: "user", content: "A".repeat(50) },
      { role: "assistant", content: "B".repeat(50) },
      { role: "user", content: "C".repeat(50) },
    ];
    const result = truncateToCharBudget(messages, 150);
    const roles = result.map((m) => m.role);
    expect(roles).toEqual(expect.arrayContaining(roles));
  });
});
