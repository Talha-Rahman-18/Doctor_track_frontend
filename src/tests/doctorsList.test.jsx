import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../lib/api.js";
import DoctorsListPage from "../views/doctors/DoctorsListPage.jsx";
import { getUrl } from "./mockNavigation.js";
import { doctorsPage, httpError, networkError, ok, renderWithProviders, sampleDoctor } from "./testUtils.jsx";

vi.mock("../lib/api.js", async (importOriginal) => ({ ...(await importOriginal()), apiClient: { request: vi.fn() } }));

const options = ok({ data: { specializations: ["Cardiology"], hospitals: ["Riverside General Hospital"] } });

/** Routes mocked requests by URL so each test only describes the doctors endpoint. */
function mockApi(doctorsHandler) {
  vi.mocked(apiClient.request).mockImplementation(async (config) => {
    if (config.url === "/doctors/options") return options;
    if (config.url === "/doctors" && config.method === "GET") return doctorsHandler(config);
    if (config.url?.startsWith("/doctors/") && config.method === "DELETE") return { data: "" };
    throw new Error(`Unexpected request ${config.method} ${config.url}`);
  });
}
const renderPage = (route = "/doctors") => renderWithProviders(<DoctorsListPage />, { route });
const listCalls = () => vi.mocked(apiClient.request).mock.calls.map(([c]) => c).filter((c) => c.url === "/doctors");

describe("DoctorsListPage", () => {
  beforeEach(() => {
    vi.mocked(apiClient.request).mockReset();
  });

  it("shows a loading skeleton, then the doctors", async () => {
    mockApi(() => doctorsPage([sampleDoctor()]));
    renderPage();
    expect(screen.getByRole("status", { name: /loading data/i })).toBeInTheDocument();
    expect(await screen.findAllByText("Amina Rahman")).not.toHaveLength(0);
    expect(screen.queryByRole("status", { name: /loading data/i })).not.toBeInTheDocument();
    expect(screen.getByText((_, el) => el?.tagName === "P" && el.textContent.trim() === "1 doctor")).toBeInTheDocument();
  });

  it("shows an empty state when there are no doctors at all", async () => {
    mockApi(() => doctorsPage([]));
    renderPage();
    expect(await screen.findByText("No doctors yet")).toBeInTheDocument();
  });

  it("shows a different empty state when filters match nothing, and clears them", async () => {
    mockApi(() => doctorsPage([]));
    renderPage("/doctors?specialization=Cardiology");
    expect(await screen.findByText("No doctors match your filters")).toBeInTheDocument();
    await userEvent.click(screen.getAllByRole("button", { name: /clear filters/i })[0]);
    expect(await screen.findByText("No doctors yet")).toBeInTheDocument();
  });

  it("shows an error state (not an empty state) on failure and recovers on retry", async () => {
    let fail = true;
    mockApi(() => { if (fail) throw httpError(500, { message: "Something went wrong on our side" }); return doctorsPage([sampleDoctor()]); });
    renderPage();
    expect(await screen.findByText("Couldn't load doctors")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong on our side")).toBeInTheDocument();
    expect(screen.queryByText("No doctors yet")).not.toBeInTheDocument();

    fail = false;
    await userEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(await screen.findAllByText("Amina Rahman")).not.toHaveLength(0);
  });

  it("shows a helpful message on network failure", async () => {
    mockApi(() => { throw networkError(); });
    renderPage();
    expect(await screen.findByText(/couldn't reach the server/i)).toBeInTheDocument();
  });

  it("requests the next page from the server when Next is clicked", async () => {
    mockApi((config) =>
      doctorsPage([sampleDoctor({ _id: `d${config.params?.page ?? 1}`, name: `Doctor page ${config.params?.page ?? 1}` })], {
        page: config.params?.page ?? 1, total: 25, totalPages: 3, hasNextPage: (config.params?.page ?? 1) < 3, hasPreviousPage: (config.params?.page ?? 1) > 1,
      }),
    );
    renderPage();
    await screen.findAllByText("Doctor page 1");
    await userEvent.click(screen.getByRole("button", { name: /next page/i }));
    await screen.findAllByText("Doctor page 2");
    expect(listCalls().at(-1).params).toMatchObject({ page: 2 });
    expect(getUrl().search).toBe("?page=2");
    expect(screen.getByText(/page 2 of 3/i)).toBeInTheDocument();
  });

  it("debounces search and sends it to the server", async () => {
    mockApi(() => doctorsPage([sampleDoctor()]));
    renderPage();
    await screen.findAllByText("Amina Rahman");
    await userEvent.type(screen.getByRole("searchbox"), "ami");
    await waitFor(() => expect(listCalls().at(-1).params).toMatchObject({ search: "ami" }), { timeout: 2000 });
    // typing 3 characters must not produce one request per keystroke
    expect(listCalls().filter((c) => c.params?.search).length).toBeLessThanOrEqual(2);
  });

  it("confirms before deleting and calls the API once confirmed", async () => {
    mockApi(() => doctorsPage([sampleDoctor()]));
    renderPage();
    await screen.findAllByText("Amina Rahman");
    await userEvent.click(screen.getAllByRole("button", { name: /delete amina rahman/i })[0]);

    const dialog = await screen.findByRole("dialog", { name: /delete doctor/i });
    expect(vi.mocked(apiClient.request).mock.calls.some(([c]) => c.method === "DELETE")).toBe(false);
    await userEvent.click(within(dialog).getByRole("button", { name: /^delete$/i }));

    await waitFor(() => expect(vi.mocked(apiClient.request).mock.calls.some(([c]) => c.method === "DELETE" && c.url === "/doctors/507f1f77bcf86cd799439011")).toBe(true));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});
