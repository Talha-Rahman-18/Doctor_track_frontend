import axios from "axios";
import { API_BASE_URL, REQUEST_TIMEOUT_MS } from "./constants.js";

/**
 * Single Axios instance. Authentication is an HTTP-only cookie set by the server, so the browser
 * must send credentials; no token is ever read, stored or attached by JavaScript.
 * The custom header is the CSRF defence expected by the API for state-changing requests.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { "X-Requested-With": "XMLHttpRequest" },
});

apiClient.interceptors.request.use((config) => {
  const method = config.method?.toLowerCase();
  if (["post", "put", "patch", "delete"].includes(method)) {
    const csrfToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("_csrf="))
      ?.split("=")[1];

    if (csrfToken) {
      config.headers["X-CSRF-Token"] = decodeURIComponent(csrfToken);
    }
  }
  return config;
});

/** Converts any Axios failure into one predictable, serialisable shape for the UI. */
export function normalizeError(error) {
  if (error?.response) {
    const { status, data } = error.response;
    return {
      status,
      code: data?.code ?? null,
      message: data?.message ?? "Something went wrong. Please try again.",
      errors: Array.isArray(data?.errors) ? data.errors : [],
    };
  }
  if (error?.code === "ECONNABORTED" || error?.code === "ETIMEDOUT") {
    return { status: "TIMEOUT", code: "TIMEOUT", message: "The server took too long to respond. Please try again.", errors: [] };
  }
  return {
    status: "NETWORK_ERROR",
    code: "NETWORK_ERROR",
    message: "We couldn't reach the server. Check your connection and try again.",
    errors: [],
  };
}

export const getErrorMessage = (error, fallback = "Something went wrong. Please try again.") => error?.message || fallback;
