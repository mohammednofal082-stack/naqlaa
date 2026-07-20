export const colors = {
  navy: "#0c1222",
  navyMid: "#1a2332",
  navyLight: "#2d3748",
  blue: "#1d4ed8",
  blueLight: "#2563eb",
  cyan: "#0891b2",
  emerald: "#047857",
  emeraldLight: "#10b981",
  purple: "#6d28d9",
  amber: "#b45309",
  red: "#ef4444",
  cream: "#f7f5f2",
  creamDark: "#ebe7e1",
  surface: "#ffffff",
  background: "#f7f5f2",
  border: "#e5e1da",
  text: "#0c1222",
  textSecondary: "#4a5568",
  textMuted: "#94a3b8",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  full: 9999,
};

export const shadow = {
  soft: {
    shadowColor: "#0c1222",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  card: {
    shadowColor: "#1d4ed8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
  glow: {
    shadowColor: "#1d4ed8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const gradients = {
  brand: ["#1d4ed8", "#0891b2"] as const,
  hero: ["#060a14", "#0c1222", "#1a2332"] as const,
};
