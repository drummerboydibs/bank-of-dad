import { Link } from "react-router-dom";
import { Money } from "./ui";
import {
  AVATAR_EMOJIS,
  COLOR_OPTIONS,
  DEFAULT_COLOR_KEY,
  accountGlyph,
  cardTint,
  colorOption,
  initials,
} from "../lib/appearance";

/** A kid's avatar: their chosen emoji, or initials in a circle tinted by color. */
export function Avatar({
  name,
  color,
  avatar,
  size = "md",
  className = "",
}: {
  name: string;
  color?: string | null;
  avatar?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const c = colorOption(color);
  const dims =
    size === "sm" ? "h-8 w-8 text-xs" : size === "lg" ? "h-14 w-14 text-lg" : "h-10 w-10 text-sm";
  const emojiSize = size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-lg";
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold ${c.dot} ${dims} ${className}`}
    >
      {avatar ? <span className={emojiSize}>{avatar}</span> : initials(name)}
    </span>
  );
}

/** An account's glyph: brand or type emoji in a square tinted by the account color. */
export function AccountGlyph({
  accountType,
  brand,
  color,
  className = "",
}: {
  accountType?: string | null;
  brand?: string | null;
  color?: string | null;
  className?: string;
}) {
  const c = colorOption(color);
  return (
    <span
      aria-hidden="true"
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-lg ${c.tint} ${className}`}
    >
      {accountGlyph(accountType, brand)}
    </span>
  );
}

export interface AccountRowData {
  account_id: string;
  name: string;
  balance_cents: number;
  color: string | null;
  account_type: string | null;
  brand: string | null;
}

/** A tappable account card (glyph + name + balance), tinted by its color. */
export function AccountRow({ account }: { account: AccountRowData }) {
  return (
    <Link
      to={`/app/account/${account.account_id}`}
      className={`flex items-center gap-3 rounded-2xl border p-4 shadow-sm transition hover:shadow ${cardTint(account.color)}`}
    >
      <AccountGlyph accountType={account.account_type} brand={account.brand} color={account.color} />
      <span className="min-w-0 flex-1 truncate font-medium">{account.name}</span>
      <Money cents={account.balance_cents} className="font-semibold" />
    </Link>
  );
}

/** Swatch grid for choosing a palette color. */
export function ColorPicker({
  value,
  onChange,
  label = "Color",
}: {
  value?: string | null;
  onChange: (key: string) => void;
  label?: string;
}) {
  const selectedKey = value ?? DEFAULT_COLOR_KEY;
  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex flex-wrap gap-2">
        {COLOR_OPTIONS.map((c) => {
          const selected = selectedKey === c.key;
          return (
            <button
              key={c.key}
              type="button"
              aria-pressed={selected}
              aria-label={c.label}
              onClick={() => onChange(c.key)}
              className={`h-8 w-8 rounded-full ${c.swatch} transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 ${
                selected ? "ring-2 ring-slate-900 ring-offset-2" : "hover:opacity-80"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}

/** Emoji grid for a kid's avatar; the "Aa" option falls back to initials. */
export function EmojiPicker({
  value,
  onChange,
}: {
  value?: string | null;
  onChange: (emoji: string | null) => void;
}) {
  return (
    <div>
      <span className="label">Emoji</span>
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          aria-pressed={!value}
          aria-label="Use initials"
          onClick={() => onChange(null)}
          className={`flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-bold transition ${
            !value ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 hover:bg-slate-50"
          }`}
        >
          Aa
        </button>
        {AVATAR_EMOJIS.map((e) => (
          <button
            key={e}
            type="button"
            aria-pressed={value === e}
            aria-label={`Avatar ${e}`}
            onClick={() => onChange(e)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition ${
              value === e ? "border-slate-900 bg-slate-100" : "border-slate-300 hover:bg-slate-50"
            }`}
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}
