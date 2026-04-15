import Dexie, { type Table } from "dexie";
import type { Transaction, Budget } from "@/types";

class FinanceDatabase extends Dexie {
  transactions!: Table<Transaction, number>;
  budgets!: Table<Budget, number>;

  constructor() {
    super("SmartFinanceDB");
    this.version(1).stores({
      transactions: "++id, type, category, date, createdAt",
      budgets: "++id, category, period, createdAt",
    });
  }
}

export const db = new FinanceDatabase();
