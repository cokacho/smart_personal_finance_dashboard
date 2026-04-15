import type { AIProvider } from "./types";
import type { FinancialData, Insight } from "@/types";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
export const GROQ_DEFAULT_MODEL = "llama-3.3-70b-versatile";

function buildPrompt(data: FinancialData): string {
  const topCategories = Object.entries(data.categoryBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([cat, amt]) => `  - ${cat}: $${amt.toFixed(2)}`)
    .join("\n");

  const budgetLines = data.budgetStatus
    .map(
      (bs) =>
        `  - ${bs.budget.category}: spent $${bs.spent.toFixed(2)} of $${bs.budget.limit.toFixed(2)} (${bs.percentage.toFixed(0)}%) — ${bs.status}`,
    )
    .join("\n");

  return `You are a personal finance advisor AI. Analyze the following financial data and return a JSON array of insights.

FINANCIAL DATA:
- Total Income: $${data.totalIncome.toFixed(2)}
- Total Expenses: $${data.totalExpenses.toFixed(2)}
- Net Savings: $${data.netSavings.toFixed(2)}
- Savings Rate: ${data.savingsRate.toFixed(1)}%

TOP EXPENSE CATEGORIES:
${topCategories || "  (none)"}

BUDGET STATUS:
${budgetLines || "  (no budgets set)"}

INSTRUCTIONS:
Return ONLY a valid JSON array with 4–7 insight objects. No markdown, no explanation, just the JSON array.
Each object must have exactly these fields:
- id: string (unique slug, e.g. "savings-rate-low")
- title: string (short, max 60 chars)
- description: string (actionable, 1–2 sentences)
- type: one of "tip" | "warning" | "achievement" | "alert"
- impact: one of "low" | "medium" | "high"
- category: string or null`;
}

function parseInsights(raw: string, today: string): Insight[] {
  const stripped = raw.replace(/```(?:json)?/gi, "").trim();
  const start = stripped.indexOf("[");
  const end = stripped.lastIndexOf("]");
  const candidate =
    start !== -1
      ? stripped.slice(start, end !== -1 ? end + 1 : undefined)
      : stripped;

  const parsed = JSON.parse(candidate) as unknown[];
  if (!Array.isArray(parsed)) throw new Error("Response is not a JSON array");

  return parsed
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null,
    )
    .map((item) => ({
      id: String(item.id ?? crypto.randomUUID()),
      title: String(item.title ?? "Insight"),
      description: String(item.description ?? ""),
      type: (["tip", "warning", "achievement", "alert"].includes(
        item.type as string,
      )
        ? item.type
        : "tip") as Insight["type"],
      impact: (["low", "medium", "high"].includes(item.impact as string)
        ? item.impact
        : "medium") as Insight["impact"],
      category: item.category != null ? String(item.category) : undefined,
      date: today,
    }));
}

export class GroqProvider implements AIProvider {
  readonly name = "groq";

  constructor(
    private readonly apiKey: string,
    private readonly model: string = GROQ_DEFAULT_MODEL,
  ) {}

  async generateInsights(data: FinancialData): Promise<Insight[]> {
    const today = new Date().toISOString().split("T")[0];

    const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: "system",
            content:
              "You are a personal finance advisor. Always respond with a valid JSON array only — no markdown, no prose.",
          },
          {
            role: "user",
            content: buildPrompt(data),
          },
        ],
        temperature: 0.3,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const err = await response.text().catch(() => response.statusText);
      throw new Error(`Groq API error ${response.status}: ${err}`);
    }

    const json = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    const content = json?.choices?.[0]?.message?.content;
    if (!content) throw new Error("Groq returned an empty response");

    return parseInsights(content, today);
  }
}
