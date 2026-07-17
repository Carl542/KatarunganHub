import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import Icon from "./Icon";

describe("Icon", () => {
  it("renders a known icon", () => {
    const { container } = render(<Icon name="users" />);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders nothing for an unknown icon", () => {
    const { container } = render(<Icon name="not-a-real-icon" />);
    expect(container.querySelector("svg")).toBeNull();
  });
});
