import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ValidateAssumptionsButton } from "../projects/assumptions/ValidateAssumptionsButton";

describe("ValidateAssumptionsButton", () => {
  it("should render the button with correct text when not loading", () => {
    const onValidate = vi.fn();
    render(<ValidateAssumptionsButton onValidate={onValidate} isLoading={false} disabled={false} />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Validate Assumptions with AI");
    expect(button).not.toBeDisabled();
  });

  it("should render the loading state when isLoading is true", () => {
    const onValidate = vi.fn();
    render(<ValidateAssumptionsButton onValidate={onValidate} isLoading={true} disabled={false} />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Validating...");
    expect(button).toBeDisabled();
  });

  it("should call the onValidate function when clicked", () => {
    const onValidate = vi.fn();
    render(<ValidateAssumptionsButton onValidate={onValidate} isLoading={false} disabled={false} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(onValidate).toHaveBeenCalledTimes(1);
  });

  it("should be disabled when disabled prop is true", () => {
    const onValidate = vi.fn();
    render(<ValidateAssumptionsButton onValidate={onValidate} isLoading={false} disabled={true} />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });
});
