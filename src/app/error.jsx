"use client";

import ErrorState from "../components/feedback/ErrorState.jsx";

/** Last-resort boundary for rendering errors. Never shows stack traces. */
export default function GlobalError({ error, reset }) {
  if (process.env.NODE_ENV !== "production") console.error(error);
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <ErrorState title="Something went wrong" message="The page failed to load. Try again, or reload the page." onRetry={reset} />
    </div>
  );
}
