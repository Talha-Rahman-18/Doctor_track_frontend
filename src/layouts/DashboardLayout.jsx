"use client";

import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Sidebar from "../components/layout/Sidebar.jsx";
import Topbar from "../components/layout/Topbar.jsx";
import Spinner from "../components/ui/Spinner.jsx";

export default function DashboardLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile drawer after navigating, and on Escape.
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (event) => event.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <div className="min-h-screen lg:pl-64">
      <a href="#main" className="sr-only z-50 rounded-md bg-white px-3 py-2 text-sm focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to main content
      </a>

      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 lg:block">
        <Sidebar />
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMenuOpen(false)} aria-hidden="true" />
          <div className="relative h-full w-72 max-w-[85vw] shadow-xl">
            <Sidebar onNavigate={() => setMenuOpen(false)} />
            <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close navigation menu" className="absolute right-3 top-4 rounded-md p-1.5 text-slate-500 hover:bg-slate-100">
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <Topbar onOpenMenu={() => setMenuOpen(true)} />
      <main id="main" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="flex justify-center py-24"><Spinner className="size-7 text-brand-700" label="Loading page" /></div>}>
          {children}
        </Suspense>
      </main>
    </div>
  );
}
