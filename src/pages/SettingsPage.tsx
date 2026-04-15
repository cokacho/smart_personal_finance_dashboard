import { useState } from "react";
import { Trash2, Download, RefreshCw, Database } from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useFinanceStore } from "@/store/useFinanceStore";
import { CURRENCIES } from "@/constants/currencies";
import { Button, Modal } from "@/components/common";
import type { CurrencyCode, AIProviderName } from "@/types";

export default function SettingsPage() {
  const {
    currency,
    aiProvider,
    aiApiKey,
    groqModel,
    ollamaBaseUrl,
    ollamaModel,
    setCurrency,
    setAIProvider,
    setAIApiKey,
    setGroqModel,
    setOllamaBaseUrl,
    setOllamaModel,
  } = useSettingsStore();
  const { transactions, budgets, clearAllData, seedDatabase } =
    useFinanceStore();

  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [seeding, setSeeding] = useState(false);

  async function handleClearData() {
    setClearing(true);
    await clearAllData();
    setClearing(false);
    setConfirmClear(false);
  }

  async function handleSeedData() {
    setSeeding(true);
    await seedDatabase();
    setSeeding(false);
  }

  function handleExport() {
    const exportData = {
      exportedAt: new Date().toISOString(),
      transactions,
      budgets,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `smartfinance-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ maxWidth: 680 }}>
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your preferences and application data</p>
      </div>

      {/* ── Preferences ── */}
      <div className="settings-group">
        <div className="settings-group__title">Preferences</div>

        <div className="settings-row">
          <div>
            <div className="settings-row__label">Currency</div>
            <div className="settings-row__desc">
              Used to display all monetary values
            </div>
          </div>
          <select
            className="form-select"
            style={{ width: "auto", minWidth: 160 }}
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
          >
            {Object.entries(CURRENCIES).map(([code, info]) => (
              <option key={code} value={code}>
                {info.symbol} — {info.name} ({code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── AI Provider ── */}
      <div className="settings-group">
        <div className="settings-group__title">AI Insights Provider</div>

        <div className="settings-row">
          <div>
            <div className="settings-row__label">Provider</div>
            <div className="settings-row__desc">
              Engine used to generate financial insights
            </div>
          </div>
          <select
            className="form-select"
            style={{ width: "auto", minWidth: 160 }}
            value={aiProvider}
            onChange={(e) => setAIProvider(e.target.value as AIProviderName)}
          >
            <option value="mock">Mock (built-in)</option>
            <option value="openai">OpenAI</option>
            <option value="groq">Groq</option>
            <option value="ollama">Ollama (local)</option>
          </select>
        </div>

        {aiProvider === "groq" && (
          <>
            <div className="settings-row">
              <div>
                <div className="settings-row__label">API Key</div>
                <div className="settings-row__desc">
                  Stored locally, never sent to our servers
                </div>
              </div>
              <input
                className="form-input"
                type="password"
                style={{ maxWidth: 260 }}
                placeholder="gsk_…"
                value={aiApiKey}
                onChange={(e) => setAIApiKey(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="settings-row">
              <div>
                <div className="settings-row__label">Model</div>
                <div className="settings-row__desc">
                  Groq model (e.g. llama-3.3-70b-versatile, mixtral-8x7b-32768)
                </div>
              </div>
              <input
                className="form-input"
                style={{ maxWidth: 260 }}
                placeholder="llama-3.3-70b-versatile"
                value={groqModel}
                onChange={(e) => setGroqModel(e.target.value)}
              />
            </div>
          </>
        )}

        {aiProvider !== "mock" &&
          aiProvider !== "ollama" &&
          aiProvider !== "groq" && (
            <div className="settings-row">
              <div>
                <div className="settings-row__label">API Key</div>
                <div className="settings-row__desc">
                  Stored locally, never sent to our servers
                </div>
              </div>
              <input
                className="form-input"
                type="password"
                style={{ maxWidth: 260 }}
                placeholder="sk-…"
                value={aiApiKey}
                onChange={(e) => setAIApiKey(e.target.value)}
                autoComplete="off"
              />
            </div>
          )}

        {aiProvider === "ollama" && (
          <>
            <div className="settings-row">
              <div>
                <div className="settings-row__label">Ollama Base URL</div>
                <div className="settings-row__desc">
                  URL of your local Ollama server
                </div>
              </div>
              <input
                className="form-input"
                style={{ maxWidth: 260 }}
                placeholder="http://localhost:11434"
                value={ollamaBaseUrl}
                onChange={(e) => setOllamaBaseUrl(e.target.value)}
              />
            </div>
            <div className="settings-row">
              <div>
                <div className="settings-row__label">Model</div>
                <div className="settings-row__desc">
                  Ollama model name (e.g. gemma4:latest, mistral, gemma2)
                </div>
              </div>
              <input
                className="form-input"
                style={{ maxWidth: 260 }}
                placeholder="gemma4:latest"
                value={ollamaModel}
                onChange={(e) => setOllamaModel(e.target.value)}
              />
            </div>
          </>
        )}
      </div>

      {/* ── Data management ── */}
      <div className="settings-group">
        <div className="settings-group__title">Data Management</div>

        <div className="settings-row">
          <div>
            <div className="settings-row__label">Export Data</div>
            <div className="settings-row__desc">
              Download all transactions and budgets as JSON
            </div>
          </div>
          <Button
            variant="secondary"
            leftIcon={<Download size={15} />}
            onClick={handleExport}
          >
            Export
          </Button>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row__label">Reload Seed Data</div>
            <div className="settings-row__desc">
              Add sample transactions and budgets for demo purposes
            </div>
          </div>
          <Button
            variant="secondary"
            leftIcon={<RefreshCw size={15} />}
            loading={seeding}
            onClick={handleSeedData}
          >
            Seed Data
          </Button>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row__label">Clear All Data</div>
            <div className="settings-row__desc">
              Permanently delete all transactions and budgets
            </div>
          </div>
          <Button
            variant="danger"
            leftIcon={<Trash2 size={15} />}
            onClick={() => setConfirmClear(true)}
          >
            Clear Data
          </Button>
        </div>
      </div>

      {/* ── About ── */}
      <div className="settings-group">
        <div className="settings-group__title">About</div>
        <div className="settings-row">
          <div>
            <div className="settings-row__label">Smart Finance Dashboard</div>
            <div className="settings-row__desc">
              v0.1.0 · React 19 · TypeScript · Dexie.js · Zustand
            </div>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <div className="text-sm text-muted">
              <Database
                size={14}
                style={{ display: "inline", marginRight: "0.375rem" }}
              />
              {transactions.length} transactions · {budgets.length} budgets
            </div>
          </div>
        </div>
      </div>

      {/* ── Clear data confirmation ── */}
      <Modal
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        title="Clear All Data"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmClear(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={clearing}
              onClick={handleClearData}
            >
              Delete Everything
            </Button>
          </>
        }
      >
        <p>
          This will permanently delete{" "}
          <strong>{transactions.length} transactions</strong> and{" "}
          <strong>{budgets.length} budgets</strong>. This action cannot be
          undone.
        </p>
      </Modal>
    </div>
  );
}
