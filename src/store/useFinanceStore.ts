import { create } from "zustand";
import type { Transaction, Budget } from "@/types";
import { db } from "@/db/database";
import { SEED_TRANSACTIONS, SEED_BUDGETS } from "@/utils/seedData";

interface FinanceStore {
  transactions: Transaction[];
  budgets: Budget[];
  isLoading: boolean;

  // Loader
  loadData: () => Promise<void>;

  // Transaction actions
  addTransaction: (
    data: Omit<Transaction, "id" | "createdAt">,
  ) => Promise<void>;
  updateTransaction: (
    id: number,
    data: Partial<Omit<Transaction, "id" | "createdAt">>,
  ) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;

  // Budget actions
  addBudget: (data: Omit<Budget, "id" | "createdAt">) => Promise<void>;
  updateBudget: (
    id: number,
    data: Partial<Omit<Budget, "id" | "createdAt">>,
  ) => Promise<void>;
  deleteBudget: (id: number) => Promise<void>;

  // Utility
  seedDatabase: () => Promise<void>;
  clearAllData: () => Promise<void>;
}

export const useFinanceStore = create<FinanceStore>()((set, get) => ({
  transactions: [],
  budgets: [],
  isLoading: false,

  loadData: async () => {
    set({ isLoading: true });
    try {
      const [transactions, budgets] = await Promise.all([
        db.transactions.orderBy("date").reverse().toArray(),
        db.budgets.toArray(),
      ]);

      // Auto-seed on first run
      if (transactions.length === 0) {
        await get().seedDatabase();
        return;
      }

      set({ transactions, budgets });
    } finally {
      set({ isLoading: false });
    }
  },

  addTransaction: async (data) => {
    const now = new Date().toISOString();
    const id = await db.transactions.add({ ...data, createdAt: now });
    const newT: Transaction = { ...data, id: id as number, createdAt: now };
    set((s) => ({
      transactions: [newT, ...s.transactions].sort((a, b) =>
        b.date.localeCompare(a.date),
      ),
    }));
  },

  updateTransaction: async (id, data) => {
    await db.transactions.update(id, data);
    set((s) => ({
      transactions: s.transactions.map((t) =>
        t.id === id ? { ...t, ...data } : t,
      ),
    }));
  },

  deleteTransaction: async (id) => {
    await db.transactions.delete(id);
    set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }));
  },

  addBudget: async (data) => {
    const now = new Date().toISOString();
    const id = await db.budgets.add({ ...data, createdAt: now });
    const newB: Budget = { ...data, id: id as number, createdAt: now };
    set((s) => ({ budgets: [...s.budgets, newB] }));
  },

  updateBudget: async (id, data) => {
    await db.budgets.update(id, data);
    set((s) => ({
      budgets: s.budgets.map((b) => (b.id === id ? { ...b, ...data } : b)),
    }));
  },

  deleteBudget: async (id) => {
    await db.budgets.delete(id);
    set((s) => ({ budgets: s.budgets.filter((b) => b.id !== id) }));
  },

  seedDatabase: async () => {
    const now = new Date().toISOString();
    const seedTx = SEED_TRANSACTIONS.map((t) => ({ ...t, createdAt: now }));
    const seedBd = SEED_BUDGETS.map((b) => ({ ...b, createdAt: now }));

    await db.transactions.bulkAdd(seedTx);
    await db.budgets.bulkAdd(seedBd);

    const [transactions, budgets] = await Promise.all([
      db.transactions.orderBy("date").reverse().toArray(),
      db.budgets.toArray(),
    ]);
    set({ transactions, budgets, isLoading: false });
  },

  clearAllData: async () => {
    await db.transactions.clear();
    await db.budgets.clear();
    set({ transactions: [], budgets: [] });
  },
}));
