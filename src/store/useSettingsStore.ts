import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Settings, CurrencyCode, AIProviderName } from "@/types";

interface SettingsStore extends Settings {
  setCurrency: (c: CurrencyCode) => void;
  setAIProvider: (p: AIProviderName) => void;
  setAIApiKey: (k: string) => void;
  setGroqModel: (model: string) => void;
  setOllamaBaseUrl: (url: string) => void;
  setOllamaModel: (model: string) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      currency: "USD",
      aiProvider: "ollama",
      aiApiKey: "",
      groqModel: "llama-3.3-70b-versatile",
      ollamaBaseUrl: "http://localhost:11434",
      ollamaModel: "gemma4:latest",

      setCurrency: (currency) => set({ currency }),
      setAIProvider: (aiProvider) => set({ aiProvider }),
      setAIApiKey: (aiApiKey) => set({ aiApiKey }),
      setGroqModel: (groqModel) => set({ groqModel }),
      setOllamaBaseUrl: (ollamaBaseUrl) => set({ ollamaBaseUrl }),
      setOllamaModel: (ollamaModel) => set({ ollamaModel }),
    }),
    { name: "sfd-settings" },
  ),
);
