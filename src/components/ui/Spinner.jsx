"use client";

import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils.js";

export default function Spinner({ className, label }) {
  return (
    <span role="status" className="inline-flex items-center">
      <Loader2 className={cn("size-4 animate-spin", className)} aria-hidden="true" />
      <span className="sr-only">{label ?? "Loading"}</span>
    </span>
  );
}
