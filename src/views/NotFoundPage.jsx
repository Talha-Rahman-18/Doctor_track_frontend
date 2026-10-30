"use client";

import { Compass } from "lucide-react";
import Link from "next/link";
import { buttonStyles } from "../components/ui/Button.jsx";
import { ROUTES } from "../lib/constants.js";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <Compass className="size-7" aria-hidden="true" />
      </span>
      <p className="mt-4 text-sm font-semibold text-brand-700">Error 404</p>
      <h1 className="mt-1 text-2xl font-semibold text-slate-900">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-600">The page you're looking for doesn't exist or has been moved.</p>
      <Link href={ROUTES.dashboard} className={buttonStyles({ className: "mt-6" })}>Go to dashboard</Link>
    </main>
  );
}
