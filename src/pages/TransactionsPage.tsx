import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useFinanceStore } from "@/store/useFinanceStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { formatCurrency, formatDate, todayISO } from "@/utils/formatters";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/constants/categories";
import { Button, Badge, Modal, LoadingSpinner } from "@/components/common";
import type { Transaction, TransactionType } from "@/types";

const PAGE_SIZE = 15;

const EMPTY_FORM = {
  description: "",
  amount: "",
  type: "expense" as TransactionType,
  category: EXPENSE_CATEGORIES[0] as string,
  date: todayISO(),
  tags: [] as string[],
};

export default function TransactionsPage() {
  const {
    transactions,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useFinanceStore();
  const { currency } = useSettingsStore();

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | TransactionType>("all");
  const [filterCat, setFilterCat] = useState("all");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const categories = useMemo(
    () => (form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES),
    [form.type],
  );

  const filtered = useMemo(() => {
    setPage(1);
    return transactions.filter((t) => {
      const matchSearch =
        search === "" ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === "all" || t.type === filterType;
      const matchCat = filterCat === "all" || t.category === filterCat;
      return matchSearch && matchType && matchCat;
    });
  }, [transactions, search, filterType, filterCat]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const allCategories = useMemo(() => {
    const cats = new Set(transactions.map((t) => t.category));
    return Array.from(cats).sort();
  }, [transactions]);

  function openAdd() {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setModalOpen(true);
  }

  function openEdit(tx: Transaction) {
    setEditing(tx);
    setForm({
      description: tx.description,
      amount: String(tx.amount),
      type: tx.type,
      category: tx.category,
      date: tx.date,
      tags: tx.tags,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    const amount = parseFloat(form.amount);
    if (!form.description.trim() || isNaN(amount) || amount <= 0) return;

    setSaving(true);
    try {
      const payload = {
        description: form.description.trim(),
        amount,
        type: form.type,
        category: form.category,
        date: form.date,
        tags: form.tags,
      };
      if (editing?.id != null) {
        await updateTransaction(editing.id, payload);
      } else {
        await addTransaction(payload);
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    await deleteTransaction(id);
    setConfirmDeleteId(null);
  }

  function setField<K extends keyof typeof EMPTY_FORM>(
    key: K,
    val: (typeof EMPTY_FORM)[K],
  ) {
    setForm((f) => {
      const next = { ...f, [key]: val };
      if (key === "type") {
        next.category = (
          val === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]
        ) as (typeof EMPTY_FORM)["category"];
      }
      return next;
    });
  }

  if (isLoading)
    return <LoadingSpinner size="lg" label="Loading transactions…" />;

  return (
    <div>
      <div className="page-header">
        <h1>Transactions</h1>
        <p>Track and manage all your income and expenses</p>
      </div>

      {/* ── Toolbar ── */}
      <div className="toolbar mb-4">
        <div className="toolbar__left">
          <div className="search-bar" style={{ flex: 1, maxWidth: 340 }}>
            <Search size={15} color="var(--foreground-subtle)" />
            <input
              placeholder="Search transactions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="type-toggle">
            {(["all", "income", "expense"] as const).map((v) => (
              <button
                key={v}
                className={filterType === v ? "active" : ""}
                onClick={() => setFilterType(v)}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>

          <select
            className="form-select"
            style={{ width: "auto" }}
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
          >
            <option value="all">All categories</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="toolbar__right">
          <Button
            variant="primary"
            leftIcon={<Plus size={15} />}
            onClick={openAdd}
          >
            Add Transaction
          </Button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Transaction</th>
              <th>Category</th>
              <th>Date</th>
              <th>Type</th>
              <th style={{ textAlign: "right" }}>Amount</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">
                    <div className="empty-state__icon">
                      <Search size={36} />
                    </div>
                    <div className="empty-state__title">
                      No transactions found
                    </div>
                    <div className="empty-state__text">
                      Try adjusting your search or filters
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((tx) => (
                <tr key={tx.id}>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.625rem",
                      }}
                    >
                      <span
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: "50%",
                          flexShrink: 0,
                          background:
                            tx.type === "income"
                              ? "var(--success-subtle)"
                              : "var(--danger-subtle)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {tx.type === "income" ? (
                          <ArrowUpRight size={14} color="var(--success)" />
                        ) : (
                          <ArrowDownRight size={14} color="var(--danger)" />
                        )}
                      </span>
                      <span style={{ fontWeight: 500, fontSize: "0.875rem" }}>
                        {tx.description}
                      </span>
                    </div>
                  </td>
                  <td>
                    <Badge variant="neutral">{tx.category}</Badge>
                  </td>
                  <td className="text-muted text-sm">{formatDate(tx.date)}</td>
                  <td>
                    <Badge
                      variant={tx.type === "income" ? "success" : "danger"}
                    >
                      {tx.type}
                    </Badge>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <span className={`td-amount ${tx.type}`}>
                      {tx.type === "income" ? "+" : "-"}
                      {formatCurrency(tx.amount, currency)}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "0.25rem",
                      }}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(tx)}
                        aria-label="Edit"
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setConfirmDeleteId(tx.id!)}
                        aria-label="Delete"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "0.75rem",
          gap: "1rem",
        }}
      >
        <div className="text-muted text-sm">
          {filtered.length === 0
            ? "No transactions"
            : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length} transactions`}
        </div>

        {totalPages > 1 && (
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
            >
              <ChevronLeft size={15} />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
              )
              .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                if (
                  idx > 0 &&
                  typeof arr[idx - 1] === "number" &&
                  (arr[idx - 1] as number) + 1 < p
                ) {
                  acc.push("…");
                }
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) =>
                item === "…" ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="text-muted text-sm"
                    style={{ padding: "0 0.25rem" }}
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPage(item as number)}
                    style={{
                      minWidth: 32,
                      height: 32,
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid",
                      borderColor:
                        page === item
                          ? "var(--primary)"
                          : "var(--glass-border)",
                      background:
                        page === item
                          ? "var(--primary-subtle)"
                          : "rgba(255,255,255,0.04)",
                      color:
                        page === item
                          ? "var(--primary)"
                          : "var(--foreground-muted)",
                      fontWeight: page === item ? 600 : 400,
                      fontSize: "0.8125rem",
                      cursor: "pointer",
                      transition: "all var(--transition)",
                    }}
                  >
                    {item}
                  </button>
                ),
              )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Next page"
            >
              <ChevronRight size={15} />
            </Button>
          </div>
        )}
      </div>

      {/* ── Add / Edit modal ── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Transaction" : "Add Transaction"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={saving} onClick={handleSave}>
              {editing ? "Save Changes" : "Add Transaction"}
            </Button>
          </>
        }
      >
        {/* Type toggle */}
        <div className="form-group">
          <label className="form-label">Type</label>
          <div className="type-toggle">
            {(["expense", "income"] as const).map((v) => (
              <button
                key={v}
                className={form.type === v ? "active" : ""}
                onClick={() => setField("type", v)}
                style={{ flex: 1 }}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <input
            className="form-input"
            placeholder="e.g. Monthly rent"
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Amount</label>
            <input
              className="form-input"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setField("amount", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              className="form-input"
              type="date"
              value={form.date}
              onChange={(e) => setField("date", e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Category</label>
          <select
            className="form-select"
            value={form.category}
            onChange={(e) =>
              setField(
                "category",
                e.target.value as (typeof EMPTY_FORM)["category"],
              )
            }
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </Modal>

      {/* ── Delete confirmation modal ── */}
      <Modal
        open={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        title="Delete Transaction"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
            >
              Delete
            </Button>
          </>
        }
      >
        <p>
          Are you sure you want to delete this transaction? This action cannot
          be undone.
        </p>
      </Modal>
    </div>
  );
}
