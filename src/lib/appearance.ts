// ---------------------------------------------------------------------------
// Shared appearance vocabulary for kids (#2) and accounts (#3, #4).
//
// The DB stores opaque keys (color, account_type, brand); the mapping from key
// to label/emoji/Tailwind classes lives here. Class strings are written out in
// full (never built by string concatenation) so Tailwind's content scanner can
// see them and keep them in the build.
// ---------------------------------------------------------------------------

export interface ColorOption {
  key: string;
  label: string;
  /** Solid circle for an avatar/glyph. */
  dot: string;
  /** Tinted card surface (border + light fill). */
  tint: string;
  /** Swatch fill for the picker. */
  swatch: string;
}

export const COLOR_OPTIONS: ColorOption[] = [
  { key: "slate", label: "Slate", dot: "bg-slate-500 text-white", tint: "border-slate-300 bg-slate-50", swatch: "bg-slate-500" },
  { key: "red", label: "Red", dot: "bg-red-500 text-white", tint: "border-red-300 bg-red-50", swatch: "bg-red-500" },
  { key: "orange", label: "Orange", dot: "bg-orange-500 text-white", tint: "border-orange-300 bg-orange-50", swatch: "bg-orange-500" },
  { key: "amber", label: "Amber", dot: "bg-amber-500 text-white", tint: "border-amber-300 bg-amber-50", swatch: "bg-amber-500" },
  { key: "green", label: "Green", dot: "bg-green-600 text-white", tint: "border-green-300 bg-green-50", swatch: "bg-green-600" },
  { key: "teal", label: "Teal", dot: "bg-teal-500 text-white", tint: "border-teal-300 bg-teal-50", swatch: "bg-teal-500" },
  { key: "sky", label: "Sky", dot: "bg-sky-500 text-white", tint: "border-sky-300 bg-sky-50", swatch: "bg-sky-500" },
  { key: "blue", label: "Blue", dot: "bg-blue-500 text-white", tint: "border-blue-300 bg-blue-50", swatch: "bg-blue-500" },
  { key: "violet", label: "Violet", dot: "bg-violet-500 text-white", tint: "border-violet-300 bg-violet-50", swatch: "bg-violet-500" },
  { key: "pink", label: "Pink", dot: "bg-pink-500 text-white", tint: "border-pink-300 bg-pink-50", swatch: "bg-pink-500" },
];

export const DEFAULT_COLOR_KEY = "slate";

export function colorOption(key?: string | null): ColorOption {
  return COLOR_OPTIONS.find((c) => c.key === key) ?? COLOR_OPTIONS[0];
}

/** Neutral card classes used when no color is chosen. */
export const NEUTRAL_TINT = "border-slate-200 bg-white";

/** Tint for a card surface; neutral white when no color is set. */
export function cardTint(key?: string | null): string {
  return key ? colorOption(key).tint : NEUTRAL_TINT;
}

/** 1–2 letter monogram from a display name, for the initials fallback avatar. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Emoji choices for a kid's avatar. */
export const AVATAR_EMOJIS = [
  "😀", "😎", "🤖", "🦊", "🐱", "🐶", "🐼", "🦄", "🐵", "🐯",
  "🐸", "🐙", "🦖", "⭐", "🌈", "🚀", "⚽", "🎮", "🎨", "🍦",
];

export interface AccountTypeOption {
  key: string;
  label: string;
  icon: string;
}

// Keys MUST stay in sync with the accounts_account_type_check DB constraint.
export const ACCOUNT_TYPE_OPTIONS: AccountTypeOption[] = [
  { key: "general", label: "General", icon: "💼" },
  { key: "savings", label: "Savings", icon: "🏦" },
  { key: "spending", label: "Spending", icon: "💳" },
  { key: "cash", label: "Cash", icon: "💵" },
  { key: "gift_card", label: "Gift card", icon: "🎁" },
];

export const DEFAULT_ACCOUNT_TYPE = "general";

export function accountTypeOption(key?: string | null): AccountTypeOption {
  return ACCOUNT_TYPE_OPTIONS.find((t) => t.key === key) ?? ACCOUNT_TYPE_OPTIONS[0];
}

export interface BrandOption {
  key: string;
  label: string;
  icon: string;
}

// Emoji stand-ins for brand icons — no image assets / licensing for v1.
export const BRAND_OPTIONS: BrandOption[] = [
  { key: "amazon", label: "Amazon", icon: "📦" },
  { key: "target", label: "Target", icon: "🎯" },
  { key: "apple", label: "Apple", icon: "🍎" },
  { key: "google_play", label: "Google Play", icon: "▶️" },
  { key: "roblox", label: "Roblox", icon: "🧱" },
  { key: "nintendo", label: "Nintendo", icon: "🎮" },
  { key: "steam", label: "Steam", icon: "🕹️" },
  { key: "starbucks", label: "Starbucks", icon: "☕" },
  { key: "visa", label: "Visa / Prepaid", icon: "💳" },
];

export function brandOption(key?: string | null): BrandOption | undefined {
  return BRAND_OPTIONS.find((b) => b.key === key);
}

/** The emoji to show on an account: brand icon for gift cards, else type icon. */
export function accountGlyph(accountType?: string | null, brand?: string | null): string {
  if (accountType === "gift_card") {
    const b = brandOption(brand);
    if (b) return b.icon;
  }
  return accountTypeOption(accountType).icon;
}
