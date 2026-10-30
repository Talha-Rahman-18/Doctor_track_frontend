import { createSlice } from "@reduxjs/toolkit";

/**
 * Deliberately tiny. Whether the user is authenticated is decided by the server (GET /auth/me,
 * cached by RTK Query), never by a flag stored here. This slice only remembers that a
 * previously valid session was rejected so the UI can explain why the user is back at /login.
 */
const authSlice = createSlice({
  name: "auth",
  initialState: { sessionExpired: false },
  reducers: {
    sessionExpired(state) {
      state.sessionExpired = true;
    },
    sessionCleared(state) {
      state.sessionExpired = false;
    },
  },
});

export const { sessionExpired, sessionCleared } = authSlice.actions;
export const selectSessionExpired = (state) => state.auth.sessionExpired;
export default authSlice.reducer;
