import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { makeStore } from "../app/store.js";
import { setUrl } from "./mockNavigation.js";

/** Renders `ui` at `route` inside a fresh store (no shared cache between tests) with a mocked Next router. */
export function renderWithProviders(ui, { route = "/", params = {} } = {}) {
  setUrl(route, params);
  const store = makeStore();
  const result = render(<Provider store={store}>{ui}</Provider>);
  return { store, ...result };
}

/** What Axios rejects with for a non-2xx response; consumed by normalizeError(). */
export const httpError = (status, body = {}) => ({ response: { status, data: { success: false, ...body } } });

export const networkError = () => Object.assign(new Error("Network Error"), { code: "ERR_NETWORK" });

export const ok = (body) => ({ data: { success: true, ...body } });

export const sampleDoctor = (overrides = {}) => ({
  _id: "507f1f77bcf86cd799439011",
  name: "Amina Rahman",
  specialization: "Cardiology",
  hospital: "Riverside General Hospital",
  phone: "+15550100100",
  email: "amina.rahman@example.org",
  patientCount: 3,
  createdAt: "2026-08-15T10:00:00.000Z",
  ...overrides,
});

export const doctorsPage = (doctors, pagination = {}) =>
  ok({
    data: { doctors },
    pagination: { page: 1, limit: 10, total: doctors.length, totalPages: doctors.length ? 1 : 0, hasNextPage: false, hasPreviousPage: false, ...pagination },
  });
