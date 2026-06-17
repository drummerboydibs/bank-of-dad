import { describe, expect, it } from "vitest";
import {
  ACCOUNT_TYPE_OPTIONS,
  COLOR_OPTIONS,
  DEFAULT_ACCOUNT_TYPE,
  DEFAULT_COLOR_KEY,
  NEUTRAL_TINT,
  accountGlyph,
  accountTypeOption,
  brandOption,
  cardTint,
  colorOption,
  initials,
} from "./appearance";

describe("initials", () => {
  it("takes the first two letters of a single name", () => {
    expect(initials("Ada")).toBe("AD");
    expect(initials("madonna")).toBe("MA");
  });

  it("takes first + last initials of a multi-part name", () => {
    expect(initials("Ada Lovelace")).toBe("AL");
    expect(initials("Mary Jane Watson")).toBe("MW");
  });

  it("collapses extra whitespace", () => {
    expect(initials("  Ada   Lovelace  ")).toBe("AL");
  });

  it("falls back to ? for empty or whitespace-only names", () => {
    expect(initials("")).toBe("?");
    expect(initials("   ")).toBe("?");
  });
});

describe("colorOption", () => {
  it("returns the matching option for a known key", () => {
    expect(colorOption("sky").key).toBe("sky");
  });

  it("falls back to the default for unknown / null / undefined", () => {
    expect(colorOption("not-a-color").key).toBe(DEFAULT_COLOR_KEY);
    expect(colorOption(null).key).toBe(DEFAULT_COLOR_KEY);
    expect(colorOption(undefined).key).toBe(DEFAULT_COLOR_KEY);
  });
});

describe("cardTint", () => {
  it("is neutral when no color is set", () => {
    expect(cardTint(null)).toBe(NEUTRAL_TINT);
    expect(cardTint(undefined)).toBe(NEUTRAL_TINT);
  });

  it("uses the color's tint classes when a color is set", () => {
    expect(cardTint("sky")).toBe(colorOption("sky").tint);
  });
});

describe("accountTypeOption", () => {
  it("returns the matching type", () => {
    expect(accountTypeOption("gift_card").key).toBe("gift_card");
  });

  it("falls back to the default for unknown / null", () => {
    expect(accountTypeOption("bogus").key).toBe(DEFAULT_ACCOUNT_TYPE);
    expect(accountTypeOption(null).key).toBe(DEFAULT_ACCOUNT_TYPE);
  });
});

describe("brandOption", () => {
  it("returns a known brand", () => {
    expect(brandOption("amazon")?.key).toBe("amazon");
  });

  it("returns undefined for unknown / null", () => {
    expect(brandOption("bogus")).toBeUndefined();
    expect(brandOption(null)).toBeUndefined();
  });
});

describe("accountGlyph", () => {
  it("shows the brand icon for a gift card with a known brand", () => {
    expect(accountGlyph("gift_card", "amazon")).toBe(brandOption("amazon")!.icon);
  });

  it("falls back to the gift-card type icon when the brand is missing/unknown", () => {
    expect(accountGlyph("gift_card", null)).toBe(accountTypeOption("gift_card").icon);
    expect(accountGlyph("gift_card", "bogus")).toBe(accountTypeOption("gift_card").icon);
  });

  it("uses the type icon for non-gift-card accounts (ignoring any brand)", () => {
    expect(accountGlyph("savings", null)).toBe(accountTypeOption("savings").icon);
    expect(accountGlyph("savings", "amazon")).toBe(accountTypeOption("savings").icon);
  });

  it("falls back to the general type icon for null", () => {
    expect(accountGlyph(null, null)).toBe(accountTypeOption("general").icon);
  });
});

describe("config invariants", () => {
  it("the default color key exists in the palette", () => {
    expect(COLOR_OPTIONS.some((c) => c.key === DEFAULT_COLOR_KEY)).toBe(true);
  });

  it("the default account type exists in the options", () => {
    expect(ACCOUNT_TYPE_OPTIONS.some((t) => t.key === DEFAULT_ACCOUNT_TYPE)).toBe(true);
  });

  // Guards against drift from the accounts_account_type_check DB constraint.
  it("account type keys match the DB CHECK constraint set", () => {
    const dbAllowed = ["general", "savings", "spending", "cash", "gift_card"].sort();
    const uiKeys = ACCOUNT_TYPE_OPTIONS.map((t) => t.key).sort();
    expect(uiKeys).toEqual(dbAllowed);
  });
});
