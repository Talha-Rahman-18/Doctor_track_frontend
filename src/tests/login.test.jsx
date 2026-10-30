import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../lib/api.js";
import LoginPage from "../views/auth/LoginPage.jsx";
import { history } from "./mockNavigation.js";
import { httpError, ok, renderWithProviders } from "./testUtils.jsx";

vi.mock("../lib/api.js", async (importOriginal) => ({ ...(await importOriginal()), apiClient: { request: vi.fn() } }));

const user = { id: "1", name: "Admin", email: "admin@example.com", role: "admin" };

function setup(loginResult) {
  vi.mocked(apiClient.request).mockImplementation(async ({ url }) => {
    if (url === "/auth/me") throw httpError(401, { code: "UNAUTHENTICATED", message: "Authentication required" });
    if (url === "/auth/login") return loginResult();
    throw new Error(`Unexpected request ${url}`);
  });
  return renderWithProviders(<LoginPage />, { route: "/login?from=%2Fpatients" });
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.mocked(apiClient.request).mockReset();
  });

  it("shows validation errors and does not call the API for invalid input", async () => {
    setup(() => ok({}));
    await userEvent.click(await screen.findByRole("button", { name: /sign in/i }));
    expect(await screen.findByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/email/i), "not-an-email");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByText("Enter a valid email address")).toBeInTheDocument();
    expect(vi.mocked(apiClient.request).mock.calls.some(([c]) => c.url === "/auth/login")).toBe(false);
  });

  it("displays the API error for wrong credentials and keeps the email", async () => {
    setup(() => { throw httpError(401, { message: "Invalid email or password", code: "UNAUTHENTICATED" }); });
    await userEvent.type(await screen.findByLabelText(/email/i), "admin@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "wrong-password");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Invalid email or password")).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toHaveValue("admin@example.com");
  });

  it("shows the rate-limit message from the server", async () => {
    setup(() => { throw httpError(429, { message: "Too many requests, please try again later", code: "RATE_LIMITED" }); });
    await userEvent.type(await screen.findByLabelText(/email/i), "admin@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "whatever");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByText(/too many requests/i)).toBeInTheDocument();
  });

  it("sends credentials once and navigates on success", async () => {
    setup(() => ok({ data: { user: { _id: "1", name: "Admin", email: "admin@example.com", role: "admin" } } }));
    await userEvent.type(await screen.findByLabelText(/email/i), "admin@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "Sup3r-secret-pass!");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(history).toContain("/patients")); // the ?from= destination
    const loginCalls = vi.mocked(apiClient.request).mock.calls.filter(([c]) => c.url === "/auth/login");
    expect(loginCalls).toHaveLength(1);
    expect(loginCalls[0][0].data).toEqual({ email: "admin@example.com", password: "Sup3r-secret-pass!" });
    void user;
  });
});
