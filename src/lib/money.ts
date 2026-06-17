// Money is stored everywhere as an integer number of cents to avoid the
// rounding errors you get with floating-point dollars.

/** Format cents as USD, e.g. 12345 -> "$123.45", -500 -> "-$5.00". */
export function formatCents(cents: number, opts: { signed?: boolean } = {}): string {
  const sign = cents < 0 ? "-" : opts.signed ? "+" : "";
  const dollars = (Math.abs(cents) / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${sign}$${dollars}`;
}

/**
 * Parse a user-typed dollar amount into integer cents.
 * Accepts "12", "12.5", "12.50", "1,234.56", with optional leading "$".
 * Returns null if the input isn't a valid non-negative money amount.
 */
export function parseDollarsToCents(input: string): number | null {
  const cleaned = input.replace(/[$,\s]/g, "");
  if (cleaned === "" || !/^\d*(\.\d{0,2})?$/.test(cleaned)) return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value)) return null;
  return Math.round(value * 100);
}
