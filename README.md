# Smart Personal Finance Dashboard

A modern personal finance dashboard built with React 19 and TypeScript. Track income and expenses, manage budgets, and generate AI-powered financial insights — all stored locally in the browser with no backend required.

## Features

- **Dashboard** — income/expense overview, monthly trend chart, spending breakdown, recent transactions
- **Transactions** — full CRUD, search, filter by type and category, paginated table
- **Budgets** — per-category monthly/yearly limits with live progress tracking (ok / warning / over)
- **AI Insights** — connect to a local Ollama instance or Groq's cloud API for personalized financial analysis; insights are persisted across sessions
- **Settings** — currency (USD / BOB), AI provider selection, data export and seed data reset

## Tech Stack

| Layer | Library |
|---|---|
| UI | React 19 + TypeScript |
| Build | Vite 6 |
| Routing | React Router v7 |
| State | Zustand 5 (persisted) |
| Storage | Dexie (IndexedDB) |
| Charts | Chart.js 4 + react-chartjs-2 |
| Icons | Lucide React |
| AI | Ollama (local) · Groq API |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The app seeds demo data automatically on first run.

## AI Insights

### Ollama (local, free)

1. Install [Ollama](https://ollama.com) and pull a model:
   ```bash
   ollama pull gemma4:latest
   ```
2. In Settings → AI Provider, select **Ollama** and set the base URL (`http://localhost:11434`) and model name.

### Groq (cloud)

1. Create a free API key at [console.groq.com](https://console.groq.com).
2. In Settings → AI Provider, select **Groq**, paste your key, and choose a model (default: `llama-3.3-70b-versatile`).

## Scripts

```bash
npm run dev       # development server
npm run build     # production build (TypeScript + Vite)
npm run preview   # preview production build locally
npm run lint      # ESLint
```

## Deployment

The project is ready to deploy on [Vercel](https://vercel.com):

1. Push to GitHub
2. Import the repository on Vercel
3. Framework will be auto-detected as **Vite** — no extra configuration needed

All client-side routing is handled by `vercel.json`.

## Project Structure

```
src/
├── components/
│   ├── common/          # Button, Badge, Modal, LoadingSpinner
│   └── layout/          # AppLayout, Sidebar, TopBar
├── constants/           # Categories, currencies, chart theme
├── db/                  # Dexie database schema
├── pages/               # Dashboard, Transactions, Budgets, Insights, Settings
├── services/ai/         # AIProviderFactory, OllamaProvider, GroqProvider, MockProvider
├── store/               # Zustand stores (finance, settings, insights)
├── types/               # TypeScript domain types
└── utils/               # Formatters, calculations, seed data
```

## Data & Privacy

All data is stored locally in the browser's IndexedDB — nothing is sent to any server. API keys (Groq) are persisted only in `localStorage` and never leave your device except when making direct calls to the provider's API.
