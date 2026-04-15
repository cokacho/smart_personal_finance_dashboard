import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Insight } from "@/types";

interface InsightsStore {
  insights: Insight[];
  generatedAt: string | null; // ISO datetime of last generation
  setInsights: (insights: Insight[]) => void;
  clearInsights: () => void;
}

export const useInsightsStore = create<InsightsStore>()(
  persist(
    (set) => ({
      insights: [],
      generatedAt: null,

      setInsights: (insights) =>
        set({ insights, generatedAt: new Date().toISOString() }),

      clearInsights: () => set({ insights: [], generatedAt: null }),
    }),
    { name: "sfd-insights" },
  ),
);
