import { afterEach, describe, expect, it } from "vitest";
import {
  clearPendingHousehold,
  readPendingHousehold,
  savePendingHousehold,
} from "./pendingHousehold";

afterEach(() => {
  localStorage.clear();
});

describe("pendingHousehold", () => {
  it("returns null when nothing has been stashed", () => {
    expect(readPendingHousehold()).toBeNull();
  });

  it("round-trips the stashed household details", () => {
    savePendingHousehold({ parentName: "Dad", householdName: "The Smith Family" });
    expect(readPendingHousehold()).toEqual({
      parentName: "Dad",
      householdName: "The Smith Family",
    });
  });

  it("clears the stash", () => {
    savePendingHousehold({ parentName: "Dad", householdName: "The Smith Family" });
    clearPendingHousehold();
    expect(readPendingHousehold()).toBeNull();
  });

  it("returns null for malformed or partial stored data", () => {
    localStorage.setItem("bod.pendingHousehold", "not json");
    expect(readPendingHousehold()).toBeNull();

    localStorage.setItem("bod.pendingHousehold", JSON.stringify({ parentName: "Dad" }));
    expect(readPendingHousehold()).toBeNull();
  });
});
