import type {
  Transaction,
  Budget,
  FinancialData,
  MonthlyData,
  BudgetStatus,
} from "@/types";
import { CATEGORY_COLORS } from "@/constants/categories";
import { getMonthKey, monthLabel } from "./formatters";

export function calcFinancialData(
  transactions: Transaction[],
  budgets: Budget[],
): FinancialData {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  // Category breakdown (expenses only)
  const categoryBreakdown: Record<string, number> = {};
  for (const t of transactions) {
    if (t.type === "expense") {
      categoryBreakdown[t.category] =
        (categoryBreakdown[t.category] ?? 0) + t.amount;
    }
  }

  // Monthly data — last 6 months
  const monthlyMap: Record<string, { income: number; expenses: number }> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyMap[getMonthKey(d.toISOString().split("T")[0])] = {
      income: 0,
      expenses: 0,
    };
  }

  for (const t of transactions) {
    const key = getMonthKey(t.date);
    if (key in monthlyMap) {
      if (t.type === "income") {
        monthlyMap[key].income += t.amount;
      } else {
        monthlyMap[key].expenses += t.amount;
      }
    }
  }

  const monthlyData: MonthlyData[] = Object.entries(monthlyMap).map(
    ([key, val]) => ({
      month: monthLabel(key),
      income: val.income,
      expenses: val.expenses,
    }),
  );

  // Budget status (current month)
  const currentMonthKey = getMonthKey(new Date().toISOString().split("T")[0]);
  const currentMonthExpenses = transactions.filter(
    (t) => t.type === "expense" && getMonthKey(t.date) === currentMonthKey,
  );

  const budgetStatus: BudgetStatus[] = budgets.map((budget) => {
    const spent = currentMonthExpenses
      .filter((t) => t.category === budget.category)
      .reduce((s, t) => s + t.amount, 0);
    const limit = budget.period === "yearly" ? budget.limit / 12 : budget.limit;
    const remaining = limit - spent;
    const percentage = limit > 0 ? (spent / limit) * 100 : 0;
    const status =
      percentage >= 100 ? "over" : percentage >= 80 ? "warning" : "ok";
    return { budget, spent, remaining, percentage, status };
  });

  return {
    transactions,
    budgets,
    totalIncome,
    totalExpenses,
    netSavings,
    savingsRate,
    categoryBreakdown,
    monthlyData,
    budgetStatus,
  };
}

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? "hsl(0 0% 50%)";
}

export function currentMonthTransactions(
  transactions: Transaction[],
): Transaction[] {
  const key = getMonthKey(new Date().toISOString().split("T")[0]);
  return transactions.filter((t) => getMonthKey(t.date) === key);
}
