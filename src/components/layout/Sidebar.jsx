"use client";

import { LayoutDashboard, Plus, Stethoscope, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "../../lib/constants.js";
import { cn } from "../../lib/utils.js";

const NAV_ITEMS = [
  { to: ROUTES.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { to: ROUTES.doctors, label: "Doctors", icon: Stethoscope },
  { to: ROUTES.patients, label: "Patients", icon: Users },
];

export function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-lg bg-brand-700 text-white">
        <Plus className="size-5" strokeWidth={3} aria-hidden="true" />
      </span>
      <span className="text-lg font-semibold tracking-tight text-slate-900">Doctor Tracker</span>
    </div>
  );
}

export default function Sidebar({ onNavigate }) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center px-5"><Brand /></div>
      <nav aria-label="Main navigation" className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const isActive = pathname === to || pathname?.startsWith(`${to}/`);
          return (
            <Link
              key={to}
              href={to}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive ? "bg-brand-50 text-brand-800" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>
      <p className="border-t border-slate-200 px-5 py-4 text-xs text-slate-500">Demo environment · fictional data only</p>
    </div>
  );
}
