export const EXPENSE_CATEGORIES = [
  "Housing",
  "Food & Dining",
  "Transportation",
  "Entertainment",
  "Healthcare",
  "Shopping",
  "Utilities",
  "Education",
  "Travel",
  "Personal Care",
  "Insurance",
  "Subscriptions",
  "Other",
] as const;

export const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Investment Returns",
  "Business",
  "Gift",
  "Other Income",
] as const;

export const ALL_CATEGORIES = [
  ...EXPENSE_CATEGORIES,
  ...INCOME_CATEGORIES,
] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  Housing: "hsl(217 91% 60%)",
  "Food & Dining": "hsl(24 95% 58%)",
  Transportation: "hsl(271 81% 56%)",
  Entertainment: "hsl(340 82% 55%)",
  Healthcare: "hsl(142 72% 42%)",
  Shopping: "hsl(38 92% 50%)",
  Utilities: "hsl(180 60% 40%)",
  Education: "hsl(250 80% 60%)",
  Travel: "hsl(0 72% 58%)",
  "Personal Care": "hsl(320 60% 55%)",
  Insurance: "hsl(200 80% 50%)",
  Subscriptions: "hsl(160 60% 45%)",
  Other: "hsl(0 0% 50%)",
  Salary: "hsl(142 72% 42%)",
  Freelance: "hsl(142 60% 50%)",
  "Investment Returns": "hsl(200 90% 55%)",
  Business: "hsl(180 70% 45%)",
  Gift: "hsl(320 70% 55%)",
  "Other Income": "hsl(0 0% 55%)",
};

export const BUDGET_COLOR_OPTIONS = [
  { label: "Blue", value: "hsl(217 91% 60%)" },
  { label: "Orange", value: "hsl(24 95% 58%)" },
  { label: "Purple", value: "hsl(271 81% 56%)" },
  { label: "Green", value: "hsl(142 72% 42%)" },
  { label: "Red", value: "hsl(0 84% 60%)" },
  { label: "Amber", value: "hsl(38 92% 50%)" },
  { label: "Pink", value: "hsl(340 82% 55%)" },
  { label: "Teal", value: "hsl(180 60% 40%)" },
];
