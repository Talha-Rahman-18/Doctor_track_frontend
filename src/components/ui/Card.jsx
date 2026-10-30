"use client";

import { cn } from "../../lib/utils.js";

export default function Card({ className, children, as: Tag = "div", ...props }) {
  return (
    <Tag className={cn("rounded-xl border border-slate-200 bg-white shadow-card", className)} {...props}>
      {children}
    </Tag>
  );
}
