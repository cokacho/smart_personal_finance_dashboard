import type { AIProvider } from "./types";
import type { FinancialData, Insight } from "@/types";

const DEFAULT_BASE_URL = "http://localhost:11434";
const DEFAULT_MODEL = "gemma4:latest";

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
- category: string or null

Example:
[
  {
    "id": "savings-rate-low",
    "title": "Savings rate below target",
    "description": "Your savings rate is 12%. Aim for 20% by cutting discretionary spending.",
    "type": "tip",
    "impact": "high",
    "category": null
  }
]`;
}

function tryParseArray(text: string): unknown[] {
  // 1. Direct parse
  try {
    return JSON.parse(text) as unknown[];
  } catch {
    // continue
  }

  // 2. Try closing truncated array: append missing ']}' variants
  for (const suffix of ["}", "}]", "]", ",null]"]) {
    try {
      const result = JSON.parse(text + suffix) as unknown[];
      if (Array.isArray(result)) return result;
    } catch {
      // continue
    }
  }

  // 3. Extract every complete {...} object from the string
  const objects: unknown[] = [];
  const objRegex = /\{[^{]*"id"[\s\S]*?\}/g;
  let m: RegExpExecArray | null;
  while ((m = objRegex.exec(text)) !== null) {
    try {
      objects.push(JSON.parse(m[0]));
    } catch {
      // skip malformed fragment
    }
  }
  if (objects.length > 0) return objects;

  throw new Error(
    `No parseable JSON found. done_reason may be "length" — increase num_predict.`,
  );
}

function parseInsights(raw: string, today: string): Insight[] {
  // Strip markdown code fences if present
  const stripped = raw.replace(/```(?:json)?/gi, "").trim();

  // Find the outermost [...] block
  const start = stripped.indexOf("[");
  const end = stripped.lastIndexOf("]");
  const candidate =
    start !== -1
      ? stripped.slice(start, end !== -1 ? end + 1 : undefined)
      : stripped;

  const parsed = tryParseArray(candidate);

  return parsed
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null,
    )
    .map((item, idx) => ({
      id: String(item.id ?? `insight-${idx}`),
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
      category:
        item.category && item.category !== "null"
          ? String(item.category)
          : undefined,
      date: today,
    }));
}

export class OllamaProvider implements AIProvider {
  readonly name = "ollama";

  private readonly baseUrl: string;
  private readonly model: string;

  constructor(baseUrl = DEFAULT_BASE_URL, model = DEFAULT_MODEL) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.model = model;
  }

  async generateInsights(data: FinancialData): Promise<Insight[]> {
    const today = new Date().toISOString().split("T")[0];
    const prompt = buildPrompt(data);

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
          options: {
            temperature: 0.3,
            num_predict: 2048,
          },
        }),
      });
    } catch (err) {
      const isLocalhost = /localhost|127\.0\.0\.1/.test(this.baseUrl);
      const isRemoteOrigin =
        typeof window !== "undefined" &&
        window.location.hostname !== "localhost" &&
        window.location.hostname !== "127.0.0.1";

      if (isLocalhost && isRemoteOrigin) {
        throw new Error(
          `Cannot reach Ollama from a deployed app — browsers block requests from "${window.location.origin}" to localhost. ` +
            `Run the app locally (npm run dev) or start Ollama with: OLLAMA_ORIGINS=${window.location.origin} ollama serve`,
        );
      }
      throw new Error(
        `Could not connect to Ollama at ${this.baseUrl}. Make sure Ollama is running. (${String(err)})`,
      );
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Ollama error ${response.status}: ${text.slice(0, 200)}`);
    }

    const json = (await response.json()) as { response?: string };
    const raw = json.response ?? "";

    return parseInsights(raw, today);
  }
}
