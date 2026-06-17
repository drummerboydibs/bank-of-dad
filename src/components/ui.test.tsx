import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Alert, Money } from "./ui";

describe("Money", () => {
  it("shows negative amounts in red", () => {
    render(<Money cents={-500} />);
    expect(screen.getByText("-$5.00").className).toContain("text-red-700");
  });
  it("shows signed positive amounts in green with a +", () => {
    render(<Money cents={500} signed />);
    expect(screen.getByText("+$5.00").className).toContain("text-green-800");
  });
  it("shows a plain balance without a sign", () => {
    render(<Money cents={1000} />);
    expect(screen.getByText("$10.00")).toBeInTheDocument();
  });
});

describe("Alert", () => {
  it("uses an assertive alert role for errors", () => {
    render(<Alert kind="error">Boom</Alert>);
    expect(screen.getByRole("alert")).toHaveTextContent("Boom");
  });
  it("uses a polite status role for success", () => {
    render(<Alert kind="success">Saved</Alert>);
    expect(screen.getByRole("status")).toHaveTextContent("Saved");
  });
});
