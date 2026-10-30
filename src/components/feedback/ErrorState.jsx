"use client";

import { CircleAlert, RefreshCw } from "lucide-react";
import Button from "../ui/Button.jsx";

/** Shown when a request FAILED. Never used for "no results", which is an EmptyState. */
export default function ErrorState({ title = "We couldn't load this", error, message, onRetry, retrying = false, action }) {
  const text = message ?? error?.message ?? "Something went wrong. Please try again.";
  return (
    <div role="alert" className="flex flex-col items-center px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600">
        <CircleAlert className="size-6" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-600">{text}</p>
      <div className="mt-5 flex gap-3">
        {onRetry && (
          <Button variant="secondary" onClick={onRetry} loading={retrying}>
            {!retrying && <RefreshCw className="size-4" aria-hidden="true" />}
            Try again
          </Button>
        )}
        {action}
      </div>
    </div>
  );
}
