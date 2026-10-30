"use client";

import { cn } from "../../lib/utils.js";

const tones = {
  neutral: "bg-slate-100 text-slate-700",
  brand: "bg-brand-50 text-brand-800 ring-brand-200",
  success: "bg-green-50 text-green-800 ring-green-200",
  warning: "bg-amber-50 text-amber-800 ring-amber-200",
  danger: "bg-red-50 text-red-800 ring-red-200",
};

export default function Badge({ tone = "neutral", className, children }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ring-transparent", tones[tone], className)}>
      {children}
    </span>
  );
}
