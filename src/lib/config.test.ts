import { describe, expect, it } from "vitest";
import { KID_EMAIL_DOMAIN, usernameToEmail } from "./config";

describe("usernameToEmail", () => {
  it("builds a synthetic email from a username", () => {
    expect(usernameToEmail("liam")).toBe(`liam@${KID_EMAIL_DOMAIN}`);
  });
  it("lowercases and trims the username", () => {
    expect(usernameToEmail("  Liam  ")).toBe(`liam@${KID_EMAIL_DOMAIN}`);
  });
});
