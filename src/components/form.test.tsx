import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SelectField, TextField } from "./form";

// These tests lock in the accessibility wiring: every field's visible label
// must be programmatically associated with its control.

describe("TextField", () => {
  it("associates the label with the input", () => {
    render(<TextField label="Amount" />);
    expect(screen.getByLabelText("Amount").tagName).toBe("INPUT");
  });
  it("links a hint to the input via aria-describedby", () => {
    render(<TextField label="Username" hint="No spaces" />);
    const input = screen.getByLabelText("Username");
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)).toHaveTextContent("No spaces");
  });
});

describe("SelectField", () => {
  it("associates the label with the select", () => {
    render(
      <SelectField label="Kid">
        <option value="all">All kids</option>
      </SelectField>,
    );
    expect(screen.getByLabelText("Kid").tagName).toBe("SELECT");
  });
});
