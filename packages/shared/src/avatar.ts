/** Local initials avatars — no third-party dicebear dependency. */

const PALETTE = ["#1d4ed8", "#0f172a", "#1e3a5f", "#334155", "#0e7490", "#166534"] as const;

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** SVG data-URI avatar from a display name or seed. */
export function initialsAvatar(nameOrSeed: string, background?: string): string {
  const raw = nameOrSeed.trim() || "?";
  const parts = raw.split(/[\s._@-]+/).filter(Boolean);
  const initials = ((parts[0]?.[0] ?? "?") + (parts[1]?.[0] ?? "")).toUpperCase();
  const bg = background ?? PALETTE[hashSeed(raw) % PALETTE.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" rx="24" fill="${bg}"/><text x="64" y="68" text-anchor="middle" fill="#ffffff" font-family="Segoe UI,Tahoma,Arial,sans-serif" font-size="48" font-weight="700">${escapeXml(initials)}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
