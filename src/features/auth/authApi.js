import { baseApi } from "../../services/baseApi.js";
import { sessionCleared } from "./authSlice.js";

const toUser = (apiUser) => ({
  id: apiUser.id ?? apiUser._id,
  name: apiUser.name,
  email: apiUser.email,
  role: apiUser.role,
});

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMe: build.query({
      query: () => ({ url: "/auth/me" }),
      transformResponse: (response) => toUser(response.data.user),
      providesTags: ["Me"],
    }),
    login: build.mutation({
      query: (credentials) => ({ url: "/auth/login", method: "POST", data: credentials }),
      transformResponse: (response) => toUser(response.data.user),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data: user } = await queryFulfilled;
          dispatch(sessionCleared());
          // The login response already carries the user, so seed the session cache directly.
          dispatch(authApi.util.upsertQueryData("getMe", undefined, user));
        } catch {
          /* the component displays the error */
        }
      },
    }),
    logout: build.mutation({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          // Drop every cached server response (patient data included) once the session ends.
          dispatch(sessionCleared());
          dispatch(baseApi.util.resetApiState());
        }
      },
    }),
  }),
});

export const { useGetMeQuery, useLoginMutation, useLogoutMutation } = authApi;
