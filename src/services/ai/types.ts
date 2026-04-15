import type { FinancialData, Insight } from "@/types";

export interface AIProvider {
  name: string;
  generateInsights(data: FinancialData): Promise<Insight[]>;
}
