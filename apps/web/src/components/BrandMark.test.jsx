import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import BrandMark from "./BrandMark";

describe("BrandMark", () => {
  it("renders the barangay seal svg", () => {
    render(<BrandMark size={64} />);
    expect(screen.getByRole("img", { name: /barangay seal/i })).toBeInTheDocument();
  });
});
