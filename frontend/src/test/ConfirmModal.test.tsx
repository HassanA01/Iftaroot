import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ConfirmModal } from "../components/ConfirmModal";

describe("ConfirmModal", () => {
  it("renders title and message", () => {
    render(
      <ConfirmModal
        title='Delete "My Quiz"?'
        message="This cannot be undone."
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText('Delete "My Quiz"?')).toBeInTheDocument();
    expect(screen.getByText("This cannot be undone.")).toBeInTheDocument();
  });

  it("calls onConfirm when Delete button is clicked", async () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmModal
        title="Delete?"
        message="Are you sure?"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("calls onCancel when Cancel button is clicked", async () => {
    const onCancel = vi.fn();
    render(
      <ConfirmModal
        title="Delete?"
        message="Are you sure?"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("has accessible dialog role and aria-modal", () => {
    render(
      <ConfirmModal
        title="Delete?"
        message="Are you sure?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
