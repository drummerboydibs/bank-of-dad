import { describe, expect, it } from "vitest";
import { formatCents, parseDollarsToCents } from "./money";

describe("formatCents", () => {
  it("formats zero", () => {
    expect(formatCents(0)).toBe("$0.00");
  });
  it("formats dollars and cents", () => {
    expect(formatCents(1234)).toBe("$12.34");
  });
  it("formats negatives with a leading minus", () => {
    expect(formatCents(-500)).toBe("-$5.00");
  });
  it("adds thousands separators", () => {
    expect(formatCents(123456789)).toBe("$1,234,567.89");
  });
  it("shows a + for positive signed amounts", () => {
    expect(formatCents(500, { signed: true })).toBe("+$5.00");
  });
  it("never shows + for negative signed amounts", () => {
    expect(formatCents(-500, { signed: true })).toBe("-$5.00");
  });
});

describe("parseDollarsToCents", () => {
  it("parses whole dollars", () => {
    expect(parseDollarsToCents("12")).toBe(1200);
  });
  it("parses one decimal place", () => {
    expect(parseDollarsToCents("12.5")).toBe(1250);
  });
  it("parses two decimal places", () => {
    expect(parseDollarsToCents("12.50")).toBe(1250);
  });
  it("strips $ and commas", () => {
    expect(parseDollarsToCents("$1,234.56")).toBe(123456);
  });
  it("parses sub-dollar amounts", () => {
    expect(parseDollarsToCents("0.99")).toBe(99);
  });
  it("rejects empty input", () => {
    expect(parseDollarsToCents("")).toBeNull();
  });
  it("rejects non-numeric input", () => {
    expect(parseDollarsToCents("abc")).toBeNull();
  });
  it("rejects more than two decimal places", () => {
    expect(parseDollarsToCents("1.234")).toBeNull();
  });
  it("rejects negative amounts", () => {
    expect(parseDollarsToCents("-5")).toBeNull();
  });
  it("rejects a lone decimal point", () => {
    expect(parseDollarsToCents(".")).toBeNull();
  });
});
