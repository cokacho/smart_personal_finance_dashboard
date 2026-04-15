import type { AIProvider } from "./types";
import type { FinancialData, Insight, AIProviderName } from "@/types";
import { MockProvider } from "./MockProvider";
import { OllamaProvider } from "./OllamaProvider";
import { GroqProvider, GROQ_DEFAULT_MODEL } from "./GroqProvider";

interface ProviderConfig {
  ollamaBaseUrl?: string;
  ollamaModel?: string;
  groqApiKey?: string;
  groqModel?: string;
}

class AIProviderFactory {
  create(name: AIProviderName, config: ProviderConfig = {}): AIProvider {
    switch (name) {
      case "groq":
        return new GroqProvider(
          config.groqApiKey ?? "",
          config.groqModel ?? GROQ_DEFAULT_MODEL,
        );
      case "ollama":
        return new OllamaProvider(config.ollamaBaseUrl, config.ollamaModel);
      default:
        return new MockProvider();
    }
  }

  async generateInsights(
    name: AIProviderName,
    data: FinancialData,
    config: ProviderConfig = {},
  ): Promise<Insight[]> {
    return this.create(name, config).generateInsights(data);
  }
}

export const aiFactory = new AIProviderFactory();
