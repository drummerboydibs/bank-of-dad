import { describe, expect, it } from "vitest";
import { formatDate, todayInputValue } from "./format";

describe("todayInputValue", () => {
  it("returns a YYYY-MM-DD string for a date <input>", () => {
    expect(todayInputValue()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("formatDate", () => {
  it("formats an ISO timestamp into a readable US date", () => {
    // Noon UTC keeps the calendar day stable across typical time zones.
    const out = formatDate("2026-06-17T12:00:00Z");
    expect(out).toContain("2026");
    expect(out).toContain("Jun");
  });
});
