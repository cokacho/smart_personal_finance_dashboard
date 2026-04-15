// ── Core domain types ────────────────────────────────────────────

export type TransactionType = "income" | "expense";

export interface Transaction {
  id?: number;
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
  tags: string[];
  createdAt: string; // ISO datetime
}

export interface Budget {
  id?: number;
  category: string;
  limit: number;
  period: "monthly" | "yearly";
  color: string;
  createdAt: string;
}

// ── AI types ────────────────────────────────────────────────────

export type InsightType = "tip" | "warning" | "achievement" | "alert";
export type InsightImpact = "low" | "medium" | "high";

export interface Insight {
  id: string;
  title: string;
  description: string;
  type: InsightType;
  category?: string;
  impact: InsightImpact;
  date: string;
}

export interface FinancialData {
  transactions: Transaction[];
  budgets: Budget[];
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  categoryBreakdown: Record<string, number>;
  monthlyData: MonthlyData[];
  budgetStatus: BudgetStatus[];
}

export interface MonthlyData {
  month: string; // e.g. "Jan 2026"
  income: number;
  expenses: number;
}

export interface BudgetStatus {
  budget: Budget;
  spent: number;
  remaining: number;
  percentage: number;
  status: "ok" | "warning" | "over";
}

// ── Settings ─────────────────────────────────────────────────────

export type AIProviderName = "mock" | "openai" | "groq" | "ollama";
export type CurrencyCode = "USD" | "BOB";

export interface Settings {
  currency: CurrencyCode;
  aiProvider: AIProviderName;
  aiApiKey: string;
  groqModel: string;
  ollamaBaseUrl: string;
  ollamaModel: string;
}
