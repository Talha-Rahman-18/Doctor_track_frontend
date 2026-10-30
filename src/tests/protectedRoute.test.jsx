import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../lib/api.js";
import ProtectedRoute from "../routes/ProtectedRoute.jsx";
import { getUrl, history } from "./mockNavigation.js";
import { httpError, networkError, ok, renderWithProviders } from "./testUtils.jsx";

vi.mock("../lib/api.js", async (importOriginal) => ({ ...(await importOriginal()), apiClient: { request: vi.fn() } }));

const renderGuard = () =>
  renderWithProviders(
    <ProtectedRoute>
      <p>Protected content</p>
    </ProtectedRoute>,
    { route: "/doctors?page=2" },
  );

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.mocked(apiClient.request).mockReset();
  });

  it("shows a loading screen while the session is being checked", () => {
    vi.mocked(apiClient.request).mockReturnValue(new Promise(() => {}));
    renderGuard();
    expect(screen.getAllByText(/checking your session/i).length).toBeGreaterThan(0);
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("renders protected content only after /auth/me confirms the session", async () => {
    vi.mocked(apiClient.request).mockResolvedValue(ok({ data: { user: { id: "1", name: "Admin", email: "a@b.org", role: "admin" } } }));
    renderGuard();
    expect(await screen.findByText("Protected content")).toBeInTheDocument();
    expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({ url: "/auth/me" }));
  });

  it("redirects unauthenticated users to login and remembers the destination", async () => {
    vi.mocked(apiClient.request).mockRejectedValue(httpError(401, { message: "Authentication required", code: "UNAUTHENTICATED" }));
    renderGuard();
    // The first redirect carries the original destination (the mock keeps the guard mounted afterwards).
    await waitFor(() => expect(history).toContain("/login?from=%2Fdoctors"));
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("does not log the user out on a network failure; it offers a retry", async () => {
    vi.mocked(apiClient.request).mockRejectedValue(networkError());
    renderGuard();
    expect(await screen.findByRole("button", { name: /try again/i })).toBeInTheDocument();
    expect(getUrl().pathname).toBe("/doctors");
  });
});
