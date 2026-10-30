"use client";

import { cn } from "../../lib/utils.js";

export default function Skeleton({ className }) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-md bg-slate-200/80", className)} />;
}
