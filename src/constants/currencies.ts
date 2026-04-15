import type { CurrencyCode } from "@/types";

export const CURRENCIES: Record<
  CurrencyCode,
  { symbol: string; name: string; locale: string }
> = {
  USD: { symbol: "$", name: "US Dollar", locale: "en-US" },
  BOB: { symbol: "Bs", name: "Bolivian Boliviano", locale: "es-BO" },
};

export const DEFAULT_CURRENCY: CurrencyCode = "USD";
