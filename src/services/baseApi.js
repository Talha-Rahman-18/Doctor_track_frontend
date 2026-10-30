import { createApi } from "@reduxjs/toolkit/query/react";
import { sessionExpired } from "../features/auth/authSlice.js";
import { apiClient, normalizeError } from "../lib/api.js";
import { ROUTES } from "../lib/constants.js";
import { navigateTo } from "../lib/navigation.js";

const isAuthEndpoint = (url) => url.startsWith("/auth/");

/** RTK Query base query backed by Axios, with centralised handling of 401 and 403 responses. */
const axiosBaseQuery = async ({ url, method = "GET", data, params }, api) => {
  try {
    const response = await apiClient.request({ url, method, data, params });
    return { data: response.data };
  } catch (caught) {
    const error = normalizeError(caught);

    // Session expired mid-use: ProtectedRoute reacts to this flag and sends the user to /login.
    if (error.status === 401 && !isAuthEndpoint(url)) api.dispatch(sessionExpired());

    // Authenticated but not permitted: a dedicated 403 experience, never the login page.
    if (error.status === 403 && error.code === "FORBIDDEN") navigateTo(ROUTES.forbidden);

    return { error };
  }
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery,
  tagTypes: ["Me", "Doctor", "DoctorList", "DoctorOptions", "Patient", "PatientList", "PatientOptions", "Dashboard"],
  // Data is refetched when a component mounts after 60 s, so list screens do not show stale rows.
  refetchOnMountOrArgChange: 60,
  refetchOnReconnect: true,
  endpoints: () => ({}),
});
