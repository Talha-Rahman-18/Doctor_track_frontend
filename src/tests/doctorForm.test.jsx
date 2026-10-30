import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import DoctorForm from "../components/forms/DoctorForm.jsx";

const fill = async (overrides = {}) => {
  const values = { "Full name": "Amina Rahman", Specialization: "Cardiology", Hospital: "Riverside", Phone: "+8801712345678", Email: "amina@example.org", ...overrides };
  for (const [label, value] of Object.entries(values)) {
    const input = screen.getByLabelText(new RegExp(`^${label}`, "i"));
    await userEvent.clear(input);
    if (value) await userEvent.type(input, value);
  }
};

describe("DoctorForm", () => {
  it("shows inline validation errors and blocks submission", async () => {
    const onSubmit = vi.fn();
    render(<DoctorForm onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole("button", { name: /save doctor/i }));

    expect(await screen.findByText("Name is required")).toBeInTheDocument();
    expect(screen.getByText("Specialization is required")).toBeInTheDocument();
    expect(screen.getByText("Phone is required")).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toHaveAttribute("aria-invalid", "true");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("validates phone and email formats", async () => {
    render(<DoctorForm onSubmit={vi.fn()} />);
    await fill({ Phone: "12ab", Email: "nope" });
    await userEvent.click(screen.getByRole("button", { name: /save doctor/i }));
    expect(await screen.findByText(/valid phone number/i)).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email address")).toBeInTheDocument();
  });

  it("submits valid values once and disables the button while submitting", async () => {
    let resolve;
    const onSubmit = vi.fn(() => new Promise((r) => { resolve = r; }));
    render(<DoctorForm onSubmit={onSubmit} />);
    await fill();
    await userEvent.click(screen.getByRole("button", { name: /save doctor/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(screen.getByRole("button", { name: /save doctor/i })).toBeDisabled();
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ name: "Amina Rahman", email: "amina@example.org" });
    resolve();
  });

  it("maps a duplicate-email server error onto the email field and keeps entered values", async () => {
    const onSubmit = vi.fn().mockRejectedValue({ status: 409, message: "An account with this email already exists", errors: [{ field: "email", message: "An account with this email already exists" }] });
    render(<DoctorForm onSubmit={onSubmit} />);
    await fill();
    await userEvent.click(screen.getByRole("button", { name: /save doctor/i }));

    expect(await screen.findByText("An account with this email already exists")).toBeInTheDocument();
    expect(screen.getByLabelText(/^email/i)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(/full name/i)).toHaveValue("Amina Rahman");
    expect(screen.getByRole("button", { name: /save doctor/i })).toBeEnabled();
  });

  it("shows a form-level alert for network failures without losing input", async () => {
    const onSubmit = vi.fn().mockRejectedValue({ status: "NETWORK_ERROR", message: "We couldn't reach the server. Check your connection and try again.", errors: [] });
    render(<DoctorForm onSubmit={onSubmit} />);
    await fill();
    await userEvent.click(screen.getByRole("button", { name: /save doctor/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/couldn't reach the server/i);
    expect(screen.getByLabelText(/hospital/i)).toHaveValue("Riverside");
  });
});
