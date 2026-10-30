"use client";

import Spinner from "../ui/Spinner.jsx";

export default function FullPageLoader({ label = "Loading…" }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-slate-600">
      <Spinner className="size-8 text-brand-700" label={label} />
      <p className="text-sm" aria-hidden="true">{label}</p>
    </div>
  );
}
