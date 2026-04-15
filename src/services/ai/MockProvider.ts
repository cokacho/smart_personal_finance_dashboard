import type { AIProvider } from "./types";
import type { FinancialData, Insight } from "@/types";

export class MockProvider implements AIProvider {
  readonly name = "mock";

  async generateInsights(data: FinancialData): Promise<Insight[]> {
    // Simulate small async delay
    await new Promise((r) => setTimeout(r, 800));

    const insights: Insight[] = [];
    const now = new Date().toISOString().split("T")[0];

    // 1. Savings rate insight
    if (data.savingsRate >= 20) {
      insights.push({
        id: "savings-good",
        title: "Excellent savings rate!",
        description: `You're saving ${data.savingsRate.toFixed(1)}% of your income — well above the recommended 20%. Keep it up!`,
        type: "achievement",
        impact: "high",
        date: now,
      });
    } else if (data.savingsRate > 0) {
      insights.push({
        id: "savings-low",
        title: "Savings rate below target",
        description: `Your savings rate is ${data.savingsRate.toFixed(1)}%. Aim for at least 20% by reducing discretionary spending.`,
        type: "tip",
        impact: "high",
        date: now,
      });
    } else if (data.savingsRate <= 0) {
      insights.push({
        id: "savings-negative",
        title: "Spending exceeds income",
        description:
          "Your expenses are higher than your income this period. Review your largest expense categories immediately.",
        type: "warning",
        impact: "high",
        date: now,
      });
    }

    // 2. Over-budget categories
    for (const bs of data.budgetStatus) {
      if (bs.status === "over") {
        insights.push({
          id: `budget-over-${bs.budget.category}`,
          title: `Over budget: ${bs.budget.category}`,
          description: `You've spent $${bs.spent.toFixed(2)} vs your $${bs.budget.limit.toFixed(2)} budget — ${(bs.percentage - 100).toFixed(0)}% over limit.`,
          type: "alert",
          category: bs.budget.category,
          impact: "high",
          date: now,
        });
      } else if (bs.status === "warning") {
        insights.push({
          id: `budget-warn-${bs.budget.category}`,
          title: `Approaching limit: ${bs.budget.category}`,
          description: `You've used ${bs.percentage.toFixed(0)}% of your ${bs.budget.category} budget. Only $${bs.remaining.toFixed(2)} remaining.`,
          type: "warning",
          category: bs.budget.category,
          impact: "medium",
          date: now,
        });
      }
    }

    // 3. Top expense category insight
    const topCategories = Object.entries(data.categoryBreakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 1);

    if (topCategories.length > 0 && data.totalExpenses > 0) {
      const [cat, amount] = topCategories[0];
      const pct = (amount / data.totalExpenses) * 100;
      if (pct > 40) {
        insights.push({
          id: "top-category",
          title: `${cat} dominates spending`,
          description: `${cat} accounts for ${pct.toFixed(0)}% of your total expenses ($${amount.toFixed(2)}). Consider if this aligns with your priorities.`,
          type: "tip",
          category: cat,
          impact: "medium",
          date: now,
        });
      }
    }

    // 4. Subscription insight
    const subTotal = data.transactions
      .filter((t) => t.type === "expense" && t.category === "Subscriptions")
      .reduce((s, t) => s + t.amount, 0);

    if (subTotal > 50) {
      insights.push({
        id: "subscriptions",
        title: "Review your subscriptions",
        description: `You're spending $${subTotal.toFixed(2)}/month on subscriptions. Audit them regularly and cancel ones you don't actively use.`,
        type: "tip",
        impact: "low",
        date: now,
      });
    }

    // 5. Income diversity
    const incomeCategories = new Set(
      data.transactions
        .filter((t) => t.type === "income")
        .map((t) => t.category),
    );
    if (incomeCategories.size === 1) {
      insights.push({
        id: "income-diversity",
        title: "Single income source",
        description:
          "All your income comes from one source. Consider diversifying with a side project, investments, or passive income.",
        type: "tip",
        impact: "medium",
        date: now,
      });
    } else if (incomeCategories.size >= 3) {
      insights.push({
        id: "income-diverse",
        title: "Diversified income streams",
        description: `Great — you have ${incomeCategories.size} different income sources. Diversification reduces financial risk.`,
        type: "achievement",
        impact: "medium",
        date: now,
      });
    }

    // 6. Emergency fund tip
    if (data.netSavings > 0) {
      const monthsOfExpenses =
        data.totalExpenses > 0 ? data.netSavings / (data.totalExpenses / 6) : 0;
      if (monthsOfExpenses < 3) {
        insights.push({
          id: "emergency-fund",
          title: "Build your emergency fund",
          description:
            "Financial experts recommend 3–6 months of expenses as an emergency fund. Keep saving to reach that target.",
          type: "tip",
          impact: "high",
          date: now,
        });
      }
    }

    return insights.slice(0, 8); // max 8 insights
  }
}
