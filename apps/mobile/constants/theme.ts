/** LinkedIn-inspired mobile palette (matches web). */
export const colors = {
  navy: "#191919",
  navyMid: "#004182",
  navyLight: "#378fe9",
  blue: "#0a66c2",
  blueLight: "#378fe9",
  cyan: "#057642",
  emerald: "#057642",
  emeraldLight: "#057642",
  purple: "#7a1fa2",
  amber: "#915907",
  red: "#cc1016",
  cream: "#f3f2ef",
  creamDark: "#e8e6e2",
  surface: "#ffffff",
  background: "#f3f2ef",
  border: "#e0dfdc",
  text: "#191919",
  textSecondary: "rgba(0,0,0,0.6)",
  textMuted: "rgba(0,0,0,0.45)",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 6,
  md: 8,
  lg: 8,
  xl: 12,
  full: 9999,
};

export const shadow = {
  soft: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 0,
    elevation: 1,
  },
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 0,
    elevation: 1,
  },
  glow: {
    shadowColor: "#0a66c2",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 0,
    elevation: 1,
  },
};

export const gradients = {
  brand: ["#0a66c2", "#004182"] as const,
  hero: ["#191919", "#004182"] as const,
};
