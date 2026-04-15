import { useMemo } from "react";
import { Line, Doughnut } from "react-chartjs-2";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useFinanceStore } from "@/store/useFinanceStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { calcFinancialData } from "@/utils/calculations";
import {
  formatCurrency,
  formatDateShort,
  formatPercent,
} from "@/utils/formatters";
import { CATEGORY_COLORS } from "@/constants/categories";
import {
  lineChartDefaults,
  doughnutChartDefaults,
} from "@/constants/chartTheme";
import { LoadingSpinner, Badge } from "@/components/common";
import type { ChartData } from "chart.js";

export default function DashboardPage() {
  const { transactions, budgets, isLoading } = useFinanceStore();
  const { currency } = useSettingsStore();

  const data = useMemo(
    () => calcFinancialData(transactions, budgets),
    [transactions, budgets],
  );

  const lineData: ChartData<"line"> = {
    labels: data.monthlyData.map((d) => d.month),
    datasets: [
      {
        label: "Income",
        data: data.monthlyData.map((d) => d.income),
        borderColor: "hsl(142, 72%, 42%)",
        backgroundColor: "hsla(142, 72%, 42%, 0.08)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
      },
      {
        label: "Expenses",
        data: data.monthlyData.map((d) => d.expenses),
        borderColor: "hsl(0, 84%, 60%)",
        backgroundColor: "hsla(0, 84%, 60%, 0.08)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
      },
    ],
  };

  const categoryEntries = Object.entries(data.categoryBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const doughnutData: ChartData<"doughnut"> = {
    labels: categoryEntries.map(([k]) => k),
    datasets: [
      {
        data: categoryEntries.map(([, v]) => v),
        backgroundColor: categoryEntries.map(
          ([k]) => CATEGORY_COLORS[k] ?? "hsl(0 0% 50%)",
        ),
        borderColor: "hsl(0, 0%, 8.6%)",
        borderWidth: 2,
      },
    ],
  };

  const recentTx = transactions.slice(0, 8);

  if (isLoading)
    return <LoadingSpinner size="lg" label="Loading your finances…" />;

  const savingsPositive = data.savingsRate >= 0;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Your financial overview at a glance</p>
      </div>

      {/* ── Metric cards ── */}
      <div className="grid-4 mb-6">
        <MetricCard
          label="Total Balance"
          value={formatCurrency(data.netSavings, currency)}
          icon={<DollarSign size={18} />}
          iconBg="var(--primary-subtle)"
          iconColor="var(--primary)"
          sub={
            <span className={savingsPositive ? "positive" : "negative"}>
              {savingsPositive ? "↑" : "↓"} All-time net savings
            </span>
          }
        />
        <MetricCard
          label="Total Income"
          value={formatCurrency(data.totalIncome, currency)}
          icon={<TrendingUp size={18} />}
          iconBg="var(--success-subtle)"
          iconColor="var(--success)"
          sub={
            <span className="positive">
              From {transactions.filter((t) => t.type === "income").length}{" "}
              payments
            </span>
          }
        />
        <MetricCard
          label="Total Expenses"
          value={formatCurrency(data.totalExpenses, currency)}
          icon={<TrendingDown size={18} />}
          iconBg="var(--danger-subtle)"
          iconColor="var(--danger)"
          sub={
            <span className="negative">
              {transactions.filter((t) => t.type === "expense").length}{" "}
              transactions
            </span>
          }
        />
        <MetricCard
          label="Savings Rate"
          value={formatPercent(data.savingsRate)}
          icon={<PiggyBank size={18} />}
          iconBg={
            data.savingsRate >= 20
              ? "var(--success-subtle)"
              : "var(--warning-subtle)"
          }
          iconColor={
            data.savingsRate >= 20 ? "var(--success)" : "var(--warning)"
          }
          sub={
            <span className={data.savingsRate >= 20 ? "positive" : ""}>
              {data.savingsRate >= 20 ? "Above target (20%)" : "Target: 20%+"}
            </span>
          }
        />
      </div>

      {/* ── Charts ── */}
      <div className="dashboard-grid">
        <div className="dashboard-line">
          <div className="card card-padding-md">
            <div className="section-header mb-4">
              <span className="section-title">Income vs Expenses</span>
              <Badge variant="neutral">Last 6 months</Badge>
            </div>
            <div className="chart-container chart-container--md">
              <Line data={lineData} options={lineChartDefaults as object} />
            </div>
          </div>
        </div>

        <div className="dashboard-donut">
          <div className="card card-padding-md" style={{ height: "100%" }}>
            <div className="section-header mb-4">
              <span className="section-title">Spending by Category</span>
            </div>
            {categoryEntries.length > 0 ? (
              <div className="chart-container chart-container--md">
                <Doughnut
                  data={doughnutData}
                  options={doughnutChartDefaults as object}
                />
              </div>
            ) : (
              <div className="empty-state">
                <p>No expense data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Recent transactions ── */}
        <div className="dashboard-recent">
          <div className="card card-padding-none">
            <div
              className="section-header"
              style={{ padding: "1rem 1.25rem 0" }}
            >
              <span className="section-title">Recent Transactions</span>
            </div>
            <div className="table-wrap" style={{ border: "none" }}>
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th style={{ textAlign: "right" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTx.length === 0 ? (
                    <tr>
                      <td colSpan={4}>
                        <div className="empty-state">No transactions yet</div>
                      </td>
                    </tr>
                  ) : (
                    recentTx.map((tx) => (
                      <tr key={tx.id}>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <span
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                                background:
                                  tx.type === "income"
                                    ? "var(--success-subtle)"
                                    : "var(--danger-subtle)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              {tx.type === "income" ? (
                                <ArrowUpRight
                                  size={14}
                                  color="var(--success)"
                                />
                              ) : (
                                <ArrowDownRight
                                  size={14}
                                  color="var(--danger)"
                                />
                              )}
                            </span>
                            <span style={{ fontSize: "0.875rem" }}>
                              {tx.description}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span
                            className="badge badge--neutral"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {tx.category}
                          </span>
                        </td>
                        <td className="text-muted text-sm">
                          {formatDateShort(tx.date)}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <span className={`td-amount ${tx.type}`}>
                            {tx.type === "income" ? "+" : "-"}
                            {formatCurrency(tx.amount, currency)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-component ────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  sub: React.ReactNode;
}

function MetricCard({
  label,
  value,
  icon,
  iconBg,
  iconColor,
  sub,
}: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="metric-card__header">
        <span className="metric-card__label">{label}</span>
        <div
          className="metric-card__icon"
          style={{ background: iconBg, color: iconColor }}
        >
          {icon}
        </div>
      </div>
      <div className="metric-card__value">{value}</div>
      <div className="metric-card__sub">{sub}</div>
    </div>
  );
}
