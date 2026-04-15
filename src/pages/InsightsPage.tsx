import { useState, useMemo } from "react";
import {
  Lightbulb,
  Sparkles,
  AlertTriangle,
  Trophy,
  Info,
  RefreshCw,
} from "lucide-react";
import { useFinanceStore } from "@/store/useFinanceStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useInsightsStore } from "@/store/useInsightsStore";
import { calcFinancialData } from "@/utils/calculations";
import { aiFactory } from "@/services/ai/AIProviderFactory";
import { Button, LoadingSpinner } from "@/components/common";
import type { Insight, InsightType } from "@/types";

const INSIGHT_CONFIG: Record<
  InsightType,
  { icon: typeof Lightbulb; bg: string; color: string; label: string }
> = {
  tip: {
    icon: Lightbulb,
    bg: "var(--info-subtle)",
    color: "var(--info)",
    label: "Tip",
  },
  warning: {
    icon: AlertTriangle,
    bg: "var(--warning-subtle)",
    color: "var(--warning)",
    label: "Warning",
  },
  achievement: {
    icon: Trophy,
    bg: "var(--success-subtle)",
    color: "var(--success)",
    label: "Achievement",
  },
  alert: {
    icon: AlertTriangle,
    bg: "var(--danger-subtle)",
    color: "var(--danger)",
    label: "Alert",
  },
};

export default function InsightsPage() {
  const { transactions, budgets } = useFinanceStore();
  const { aiProvider, aiApiKey, groqModel, ollamaBaseUrl, ollamaModel } =
    useSettingsStore();
  const { insights, generatedAt, setInsights } = useInsightsStore();

  const generated = insights.length > 0;
  const [loading, setLoading] = useState(false);

  const financialData = useMemo(
    () => calcFinancialData(transactions, budgets),
    [transactions, budgets],
  );

  async function generateInsights() {
    setLoading(true);
    try {
      const result = await aiFactory.generateInsights(
        aiProvider,
        financialData,
        {
          groqApiKey: aiApiKey,
          groqModel,
          ollamaBaseUrl,
          ollamaModel,
        },
      );
      setInsights(result);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h1>AI Insights</h1>
          <p>Personalized financial analysis based on your spending patterns</p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Sparkles size={15} />}
          onClick={generateInsights}
          loading={loading}
        >
          {generated ? "Regenerate" : "Generate Insights"}
        </Button>
      </div>

      {/* ── Summary row ── */}
      <div className="grid-4 mb-6">
        {[
          {
            label: "Total Income",
            value: financialData.totalIncome,
            color: "var(--success)",
            fmt: (v: number) => `$${v.toFixed(2)}`,
          },
          {
            label: "Total Expenses",
            value: financialData.totalExpenses,
            color: "var(--danger)",
            fmt: (v: number) => `$${v.toFixed(2)}`,
          },
          {
            label: "Net Savings",
            value: financialData.netSavings,
            color:
              financialData.netSavings >= 0
                ? "var(--success)"
                : "var(--danger)",
            fmt: (v: number) => `$${v.toFixed(2)}`,
          },
          {
            label: "Savings Rate",
            value: financialData.savingsRate,
            color:
              financialData.savingsRate >= 20
                ? "var(--success)"
                : "var(--warning)",
            fmt: (v: number) => `${v.toFixed(1)}%`,
          },
        ].map((item) => (
          <div key={item.label} className="card card-padding-md">
            <div className="text-sm text-muted mb-1">{item.label}</div>
            <div
              style={{
                fontSize: "1.375rem",
                fontWeight: 700,
                color: item.color,
                fontFamily: "var(--font-mono)",
              }}
            >
              {item.fmt(item.value)}
            </div>
          </div>
        ))}
      </div>

      {/* ── Insights content ── */}
      {loading ? (
        <LoadingSpinner size="lg" label="Analyzing your finances…" />
      ) : !generated ? (
        <div className="empty-state card card-padding-lg">
          <div className="empty-state__icon">
            <Sparkles size={48} color="var(--primary)" />
          </div>
          <div className="empty-state__title">
            Ready to analyze your finances
          </div>
          <div className="empty-state__text">
            Click "Generate Insights" to get personalized tips and warnings
            based on your spending data.
          </div>
          <Button
            variant="primary"
            leftIcon={<Sparkles size={15} />}
            onClick={generateInsights}
            style={{ marginTop: "0.5rem" }}
          >
            Generate Insights
          </Button>
        </div>
      ) : insights.length === 0 ? (
        <div className="empty-state card card-padding-lg">
          <div className="empty-state__icon">
            <Info size={48} />
          </div>
          <div className="empty-state__title">No insights available</div>
          <div className="empty-state__text">
            Add more transactions to get meaningful insights.
          </div>
        </div>
      ) : (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <div>
              <span className="section-title">
                {insights.length} insights generated
              </span>
              {generatedAt && (
                <div className="text-sm text-muted" style={{ marginTop: 2 }}>
                  Last updated{" "}
                  {new Date(generatedAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<RefreshCw size={14} />}
              onClick={generateInsights}
            >
              Refresh
            </Button>
          </div>
          <div className="flex-col gap-3">
            {insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-component ────────────────────────────────────────────────

function InsightCard({ insight }: { insight: Insight }) {
  const config = INSIGHT_CONFIG[insight.type];
  const Icon = config.icon;

  const impactVariant =
    insight.impact === "high"
      ? "danger"
      : insight.impact === "medium"
        ? "warning"
        : "neutral";

  return (
    <div className="insight-card">
      <div
        className="insight-card__icon-wrap"
        style={{ background: config.bg }}
      >
        <Icon size={20} color={config.color} />
      </div>
      <div className="insight-card__body">
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "0.5rem",
            marginBottom: "0.375rem",
          }}
        >
          <div className="insight-card__title">{insight.title}</div>
          <div style={{ display: "flex", gap: "0.375rem", flexShrink: 0 }}>
            <span
              className={`badge badge--${insight.type === "achievement" ? "success" : insight.type === "warning" || insight.type === "alert" ? "warning" : "info"}`}
            >
              {config.label}
            </span>
            <span className={`badge badge--${impactVariant}`}>
              {insight.impact} impact
            </span>
          </div>
        </div>
        <div className="insight-card__desc">{insight.description}</div>
        {insight.category && (
          <div style={{ marginTop: "0.5rem" }}>
            <span className="badge badge--neutral">{insight.category}</span>
          </div>
        )}
      </div>
    </div>
  );
}
