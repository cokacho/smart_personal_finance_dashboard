import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Target } from "lucide-react";
import { useFinanceStore } from "@/store/useFinanceStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { calcFinancialData } from "@/utils/calculations";
import { formatCurrency, formatPercent } from "@/utils/formatters";
import {
  EXPENSE_CATEGORIES,
  BUDGET_COLOR_OPTIONS,
} from "@/constants/categories";
import { Button, Badge, Modal, LoadingSpinner } from "@/components/common";
import type { Budget, BudgetStatus } from "@/types";

const EMPTY_FORM = {
  category: EXPENSE_CATEGORIES[0] as string,
  limit: "",
  period: "monthly" as Budget["period"],
  color: BUDGET_COLOR_OPTIONS[0].value,
};

export default function BudgetsPage() {
  const {
    transactions,
    budgets,
    isLoading,
    addBudget,
    updateBudget,
    deleteBudget,
  } = useFinanceStore();
  const { currency } = useSettingsStore();

  const data = useMemo(
    () => calcFinancialData(transactions, budgets),
    [transactions, budgets],
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  function openAdd() {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setModalOpen(true);
  }

  function openEdit(budget: Budget) {
    setEditing(budget);
    setForm({
      category: budget.category,
      limit: String(budget.limit),
      period: budget.period,
      color: budget.color,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    const limit = parseFloat(form.limit);
    if (isNaN(limit) || limit <= 0) return;
    setSaving(true);
    try {
      const payload = {
        category: form.category,
        limit,
        period: form.period,
        color: form.color,
      };
      if (editing?.id != null) {
        await updateBudget(editing.id, payload);
      } else {
        await addBudget(payload);
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) return <LoadingSpinner size="lg" label="Loading budgets…" />;

  return (
    <div>
      <div
        className="page-header flex justify-between items-center"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h1>Budgets</h1>
          <p>Set spending limits and track your progress</p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus size={15} />}
          onClick={openAdd}
        >
          Add Budget
        </Button>
      </div>

      {data.budgetStatus.length === 0 ? (
        <div
          className="empty-state card card-padding-lg"
          style={{ marginTop: "2rem" }}
        >
          <div className="empty-state__icon">
            <Target size={48} />
          </div>
          <div className="empty-state__title">No budgets yet</div>
          <div className="empty-state__text">
            Add a budget to start tracking your spending limits
          </div>
          <Button
            variant="primary"
            leftIcon={<Plus size={15} />}
            onClick={openAdd}
            style={{ marginTop: "0.5rem" }}
          >
            Add first budget
          </Button>
        </div>
      ) : (
        <div className="grid-3">
          {data.budgetStatus.map((bs) => (
            <BudgetCard
              key={bs.budget.id}
              bs={bs}
              currency={currency as Parameters<typeof formatCurrency>[1]}
              onEdit={() => openEdit(bs.budget)}
              onDelete={() => setConfirmDeleteId(bs.budget.id!)}
            />
          ))}
        </div>
      )}

      {/* ── Add / Edit modal ── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Budget" : "New Budget"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={saving} onClick={handleSave}>
              {editing ? "Save Changes" : "Create Budget"}
            </Button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Category</label>
          <select
            className="form-select"
            value={form.category}
            onChange={(e) =>
              setForm((f) => ({ ...f, category: e.target.value }))
            }
          >
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Limit</label>
            <input
              className="form-input"
              type="number"
              min="0"
              step="1"
              placeholder="500"
              value={form.limit}
              onChange={(e) =>
                setForm((f) => ({ ...f, limit: e.target.value }))
              }
            />
          </div>
          <div className="form-group">
            <label className="form-label">Period</label>
            <select
              className="form-select"
              value={form.period}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  period: e.target.value as Budget["period"],
                }))
              }
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Color</label>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              flexWrap: "wrap",
              marginTop: "0.25rem",
            }}
          >
            {BUDGET_COLOR_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setForm((f) => ({ ...f, color: opt.value }))}
                title={opt.label}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: opt.value,
                  border:
                    form.color === opt.value
                      ? "2px solid var(--foreground)"
                      : "2px solid transparent",
                  cursor: "pointer",
                  outline:
                    form.color === opt.value
                      ? "2px solid var(--primary)"
                      : "none",
                  outlineOffset: 2,
                }}
              />
            ))}
          </div>
        </div>
      </Modal>

      {/* ── Delete confirmation ── */}
      <Modal
        open={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        title="Delete Budget"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (confirmDeleteId) deleteBudget(confirmDeleteId);
                setConfirmDeleteId(null);
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete this budget?</p>
      </Modal>
    </div>
  );
}

// ── Budget card sub-component ────────────────────────────────────

interface BudgetCardProps {
  bs: BudgetStatus;
  currency: Parameters<typeof formatCurrency>[1];
  onEdit: () => void;
  onDelete: () => void;
}

function BudgetCard({ bs, currency, onEdit, onDelete }: BudgetCardProps) {
  const { budget, spent, remaining, percentage, status } = bs;
  const barClass =
    status === "over"
      ? "progress__bar--danger"
      : status === "warning"
        ? "progress__bar--warning"
        : "progress__bar--success";
  const badgeVariant =
    status === "over" ? "danger" : status === "warning" ? "warning" : "success";

  return (
    <div className="budget-card">
      <div className="budget-card__header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span className="color-dot" style={{ background: budget.color }} />
          <span className="budget-card__name">{budget.category}</span>
        </div>
        <div className="budget-card__actions">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            aria-label="Edit budget"
          >
            <Pencil size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            aria-label="Delete budget"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      <div className="progress">
        <div
          className={`progress__bar ${barClass}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <div className="budget-card__amounts">
        <span>
          Spent:{" "}
          <strong style={{ color: "var(--foreground)" }}>
            {formatCurrency(spent, currency)}
          </strong>
        </span>
        <span>
          Limit:{" "}
          <strong style={{ color: "var(--foreground)" }}>
            {formatCurrency(budget.limit, currency)}
          </strong>
        </span>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span className="text-sm text-muted">
          {status === "over"
            ? `${formatCurrency(Math.abs(remaining), currency)} over limit`
            : `${formatCurrency(remaining, currency)} remaining`}
        </span>
        <div style={{ display: "flex", gap: "0.375rem", alignItems: "center" }}>
          <Badge variant={badgeVariant}>{formatPercent(percentage, 0)}</Badge>
          <Badge variant="neutral">{budget.period}</Badge>
        </div>
      </div>
    </div>
  );
}
