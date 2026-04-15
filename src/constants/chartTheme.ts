export const CHART_DEFAULTS = {
  font: {
    family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    size: 12,
  },
  colors: {
    foreground: "hsl(0, 0%, 97.3%)",
    foregroundMuted: "hsl(0, 0%, 55.1%)",
    border: "hsl(0, 0%, 14.9%)",
    primary: "hsl(24, 95%, 58%)",
    success: "hsl(142, 72%, 42%)",
    danger: "hsl(0, 84%, 60%)",
    info: "hsl(217, 91%, 60%)",
  },
} as const;

export const lineChartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index" as const, intersect: false },
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: {
        color: CHART_DEFAULTS.colors.foregroundMuted,
        boxWidth: 12,
        boxHeight: 12,
        borderRadius: 4,
        padding: 16,
        font: { size: 12, family: CHART_DEFAULTS.font.family },
      },
    },
    tooltip: {
      backgroundColor: "hsl(0, 0%, 10%)",
      borderColor: "hsl(0, 0%, 18%)",
      borderWidth: 1,
      titleColor: CHART_DEFAULTS.colors.foreground,
      bodyColor: CHART_DEFAULTS.colors.foregroundMuted,
      padding: 10,
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      grid: { color: CHART_DEFAULTS.colors.border },
      ticks: {
        color: CHART_DEFAULTS.colors.foregroundMuted,
        font: { size: 11 },
      },
    },
    y: {
      grid: { color: CHART_DEFAULTS.colors.border },
      ticks: {
        color: CHART_DEFAULTS.colors.foregroundMuted,
        font: { size: 11 },
        callback: (v: number | string) => `$${Number(v).toLocaleString()}`,
      },
    },
  },
};

export const doughnutChartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "68%",
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: {
        color: CHART_DEFAULTS.colors.foregroundMuted,
        boxWidth: 10,
        boxHeight: 10,
        borderRadius: 4,
        padding: 12,
        font: { size: 11, family: CHART_DEFAULTS.font.family },
      },
    },
    tooltip: {
      backgroundColor: "hsl(0, 0%, 10%)",
      borderColor: "hsl(0, 0%, 18%)",
      borderWidth: 1,
      titleColor: CHART_DEFAULTS.colors.foreground,
      bodyColor: CHART_DEFAULTS.colors.foregroundMuted,
      padding: 10,
      cornerRadius: 8,
    },
  },
};
