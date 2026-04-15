import type { Transaction, Budget } from "@/types";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

// Helper: multiple small transactions in one day
function tx(
  amount: number,
  type: Transaction["type"],
  category: string,
  description: string,
  day: number,
): Omit<Transaction, "id" | "createdAt"> {
  return { amount, type, category, description, date: daysAgo(day), tags: [] };
}

export const SEED_TRANSACTIONS: Omit<Transaction, "id" | "createdAt">[] = [
  // ════════════════════════════════════════════════════════════
  // CURRENT MONTH  (days 0–13)
  // ════════════════════════════════════════════════════════════
  tx(4800, "income", "Salary", "Monthly salary — April", 1),
  tx(350, "income", "Freelance", "UI design review", 3),
  tx(1200, "expense", "Housing", "April rent", 2),
  tx(120, "expense", "Utilities", "Electricity + internet bundle", 2),
  tx(48, "expense", "Utilities", "Water service", 2),
  tx(78, "expense", "Food & Dining", "Supermarket — weekly shop", 3),
  tx(12.5, "expense", "Food & Dining", "Breakfast café", 3),
  tx(55, "expense", "Transportation", "Fuel refill", 4),
  tx(14.99, "expense", "Subscriptions", "Netflix", 5),
  tx(9.99, "expense", "Subscriptions", "Spotify", 5),
  tx(4.99, "expense", "Subscriptions", "iCloud storage", 5),
  tx(22.5, "expense", "Food & Dining", "Lunch with coworkers", 6),
  tx(38, "expense", "Personal Care", "Haircut", 7),
  tx(92, "expense", "Food & Dining", "Supermarket — weekly shop", 8),
  tx(18, "expense", "Transportation", "Taxi / rideshare", 8),
  tx(60, "expense", "Entertainment", "Cinema + popcorn", 9),
  tx(35, "expense", "Food & Dining", "Pizza delivery", 10),
  tx(130, "expense", "Shopping", "Sneakers", 11),
  tx(28, "expense", "Food & Dining", "Coffee shop remote work", 12),
  tx(85, "expense", "Food & Dining", "Supermarket — weekly shop", 13),
  tx(42, "expense", "Transportation", "Monthly bus pass", 13),

  // ════════════════════════════════════════════════════════════
  // LAST MONTH  (days 14–43)
  // ════════════════════════════════════════════════════════════
  tx(4800, "income", "Salary", "Monthly salary — March", 16),
  tx(600, "income", "Freelance", "Landing page development", 18),
  tx(120, "income", "Investment Returns", "ETF dividend", 25),
  tx(1200, "expense", "Housing", "March rent", 15),
  tx(118, "expense", "Utilities", "Electricity + internet + water", 15),
  tx(82, "expense", "Food & Dining", "Supermarket", 17),
  tx(45, "expense", "Food & Dining", "Corner store top-up", 19),
  tx(95, "expense", "Food & Dining", "Supermarket", 22),
  tx(65, "expense", "Food & Dining", "Dinner out — birthday", 24),
  tx(88, "expense", "Food & Dining", "Supermarket", 29),
  tx(14.99, "expense", "Subscriptions", "Netflix", 16),
  tx(9.99, "expense", "Subscriptions", "Spotify", 16),
  tx(4.99, "expense", "Subscriptions", "iCloud storage", 16),
  tx(12, "expense", "Subscriptions", "YouTube Premium", 16),
  tx(52, "expense", "Transportation", "Fuel refill", 20),
  tx(38, "expense", "Transportation", "Monthly bus pass", 15),
  tx(22, "expense", "Transportation", "Parking fees", 26),
  tx(80, "expense", "Healthcare", "General practitioner visit", 21),
  tx(35, "expense", "Healthcare", "Pharmacy — antibiotics", 23),
  tx(110, "expense", "Entertainment", "Live music event", 27),
  tx(45, "expense", "Entertainment", "Board game café", 30),
  tx(75, "expense", "Shopping", "Kitchen gadget", 28),
  tx(32, "expense", "Personal Care", "Skincare products", 31),
  tx(18, "expense", "Food & Dining", "Fast food", 32),
  tx(55, "expense", "Education", "O'Reilly subscription — 1 month", 35),

  // ════════════════════════════════════════════════════════════
  // 2 MONTHS AGO  (days 44–74)
  // ════════════════════════════════════════════════════════════
  tx(4800, "income", "Salary", "Monthly salary — February", 47),
  tx(450, "income", "Freelance", "Logo pack delivery", 50),
  tx(200, "income", "Investment Returns", "Dividend reinvestment payout", 60),
  tx(1200, "expense", "Housing", "February rent", 45),
  tx(115, "expense", "Utilities", "Electricity + internet + water", 45),
  tx(80, "expense", "Food & Dining", "Supermarket", 48),
  tx(105, "expense", "Food & Dining", "Supermarket", 55),
  tx(28, "expense", "Food & Dining", "Sushi takeout", 52),
  tx(18, "expense", "Food & Dining", "Breakfast café", 57),
  tx(90, "expense", "Food & Dining", "Supermarket", 62),
  tx(14.99, "expense", "Subscriptions", "Netflix", 47),
  tx(9.99, "expense", "Subscriptions", "Spotify", 47),
  tx(4.99, "expense", "Subscriptions", "iCloud storage", 47),
  tx(12, "expense", "Subscriptions", "YouTube Premium", 47),
  tx(15, "expense", "Subscriptions", "Notion Pro", 47),
  tx(48, "expense", "Transportation", "Fuel refill", 49),
  tx(38, "expense", "Transportation", "Monthly bus pass", 45),
  tx(320, "expense", "Shopping", "Winter jacket", 53),
  tx(85, "expense", "Shopping", "Books — dev & design", 58),
  tx(220, "expense", "Healthcare", "Dental cleaning", 56),
  tx(42, "expense", "Healthcare", "Pharmacy", 64),
  tx(95, "expense", "Entertainment", "Streaming device", 61),
  tx(38, "expense", "Personal Care", "Gym supply kit", 66),
  tx(125, "expense", "Education", "Udemy course bundle", 68),
  tx(55, "expense", "Food & Dining", "Brunch with friends", 70),
  tx(30, "expense", "Transportation", "Airport taxi", 72),

  // ════════════════════════════════════════════════════════════
  // 3 MONTHS AGO  (days 75–104)
  // ════════════════════════════════════════════════════════════
  tx(4800, "income", "Salary", "Monthly salary — January", 78),
  tx(800, "income", "Freelance", "Full website build", 82),
  tx(1200, "expense", "Housing", "January rent", 76),
  tx(130, "expense", "Utilities", "Electricity + internet + water + gas", 76),
  tx(88, "expense", "Food & Dining", "Supermarket", 79),
  tx(32, "expense", "Food & Dining", "Juice bar / café", 81),
  tx(97, "expense", "Food & Dining", "Supermarket", 86),
  tx(75, "expense", "Food & Dining", "Restaurant dinner", 90),
  tx(85, "expense", "Food & Dining", "Supermarket", 95),
  tx(14.99, "expense", "Subscriptions", "Netflix", 78),
  tx(9.99, "expense", "Subscriptions", "Spotify", 78),
  tx(4.99, "expense", "Subscriptions", "iCloud storage", 78),
  tx(12, "expense", "Subscriptions", "YouTube Premium", 78),
  tx(50, "expense", "Transportation", "Fuel refill", 80),
  tx(38, "expense", "Transportation", "Monthly bus pass", 76),
  tx(18, "expense", "Transportation", "Parking", 93),
  tx(160, "expense", "Healthcare", "Eye exam + glasses partial", 84),
  tx(28, "expense", "Healthcare", "Pharmacy — vitamins", 88),
  tx(180, "expense", "Entertainment", "New Year party supplies", 77),
  tx(55, "expense", "Entertainment", "Bowling + drinks", 96),
  tx(65, "expense", "Shopping", "Desk lamp + organizer", 89),
  tx(45, "expense", "Personal Care", "Haircut + grooming products", 91),
  tx(200, "expense", "Travel", "Hotel — long weekend", 99),
  tx(185, "expense", "Travel", "Bus tickets (round trip)", 101),

  // ════════════════════════════════════════════════════════════
  // 4 MONTHS AGO  (days 105–134)
  // ════════════════════════════════════════════════════════════
  tx(4800, "income", "Salary", "Monthly salary — December", 108),
  tx(500, "income", "Freelance", "Consulting — year-end sprint", 112),
  tx(250, "income", "Gift", "Christmas bonus from family", 118),
  tx(175, "income", "Investment Returns", "Annual fund distribution", 125),
  tx(1200, "expense", "Housing", "December rent", 106),
  tx(140, "expense", "Utilities", "Utilities — peak winter", 106),
  tx(95, "expense", "Food & Dining", "Supermarket", 109),
  tx(210, "expense", "Food & Dining", "Christmas family dinner supplies", 117),
  tx(88, "expense", "Food & Dining", "Supermarket", 122),
  tx(45, "expense", "Food & Dining", "New Year's Eve street food", 131),
  tx(14.99, "expense", "Subscriptions", "Netflix", 108),
  tx(9.99, "expense", "Subscriptions", "Spotify", 108),
  tx(4.99, "expense", "Subscriptions", "iCloud storage", 108),
  tx(12, "expense", "Subscriptions", "YouTube Premium", 108),
  tx(55, "expense", "Transportation", "Fuel refill", 110),
  tx(38, "expense", "Transportation", "Monthly bus pass", 106),
  tx(280, "expense", "Shopping", "Christmas gifts — family", 115),
  tx(145, "expense", "Shopping", "Christmas gifts — friends", 116),
  tx(60, "expense", "Shopping", "Decorations + wrapping", 114),
  tx(90, "expense", "Entertainment", "Holiday parties", 120),
  tx(38, "expense", "Personal Care", "Year-end self-care", 126),
  tx(320, "expense", "Travel", "Flight — holiday visit", 119),
  tx(195, "expense", "Travel", "Accommodation — 3 nights", 120),

  // ════════════════════════════════════════════════════════════
  // 5 MONTHS AGO  (days 135–165)
  // ════════════════════════════════════════════════════════════
  tx(4800, "income", "Salary", "Monthly salary — November", 138),
  tx(380, "income", "Freelance", "Brand identity project", 142),
  tx(1200, "expense", "Housing", "November rent", 136),
  tx(112, "expense", "Utilities", "Electricity + internet + water", 136),
  tx(82, "expense", "Food & Dining", "Supermarket", 139),
  tx(68, "expense", "Food & Dining", "Supermarket top-up", 144),
  tx(90, "expense", "Food & Dining", "Supermarket", 150),
  tx(55, "expense", "Food & Dining", "Thanksgiving dinner out", 152),
  tx(14.99, "expense", "Subscriptions", "Netflix", 138),
  tx(9.99, "expense", "Subscriptions", "Spotify", 138),
  tx(4.99, "expense", "Subscriptions", "iCloud storage", 138),
  tx(12, "expense", "Subscriptions", "YouTube Premium", 138),
  tx(48, "expense", "Transportation", "Fuel refill", 140),
  tx(38, "expense", "Transportation", "Monthly bus pass", 136),
  tx(65, "expense", "Healthcare", "Annual blood test", 145),
  tx(22, "expense", "Healthcare", "Pharmacy — cold medicine", 153),
  tx(75, "expense", "Entertainment", "Museum + theater outing", 148),
  tx(40, "expense", "Entertainment", "Streaming + game pass bundle", 155),
  tx(95, "expense", "Shopping", "Running shoes", 157),
  tx(28, "expense", "Personal Care", "Haircut", 160),
  tx(180, "expense", "Education", "Professional cert — partial payment", 162),
];

// ── Realistic monthly budgets ──────────────────────────────────
// Designed so most months stay near-limit, some categories
// tip into warning/over territory — great for AI insight demo.
export const SEED_BUDGETS: Omit<Budget, "id" | "createdAt">[] = [
  {
    category: "Housing",
    limit: 1250,
    period: "monthly",
    color: "hsl(217 91% 60%)",
  },
  {
    category: "Food & Dining",
    limit: 420,
    period: "monthly",
    color: "hsl(24 95% 58%)",
  },
  {
    category: "Transportation",
    limit: 130,
    period: "monthly",
    color: "hsl(271 81% 56%)",
  },
  {
    category: "Subscriptions",
    limit: 55,
    period: "monthly",
    color: "hsl(160 60% 45%)",
  },
  {
    category: "Healthcare",
    limit: 100,
    period: "monthly",
    color: "hsl(142 72% 42%)",
  },
  {
    category: "Entertainment",
    limit: 120,
    period: "monthly",
    color: "hsl(340 82% 55%)",
  },
  {
    category: "Shopping",
    limit: 150,
    period: "monthly",
    color: "hsl(38 92% 50%)",
  },
  {
    category: "Personal Care",
    limit: 50,
    period: "monthly",
    color: "hsl(320 60% 55%)",
  },
  {
    category: "Education",
    limit: 80,
    period: "monthly",
    color: "hsl(250 80% 60%)",
  },
  {
    category: "Utilities",
    limit: 130,
    period: "monthly",
    color: "hsl(200 80% 50%)",
  },
  {
    category: "Travel",
    limit: 300,
    period: "monthly",
    color: "hsl(0 72% 58%)",
  },
];
