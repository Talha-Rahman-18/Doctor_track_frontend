"use client";

import Spinner from "./Spinner.jsx";
import { cn } from "../../lib/utils.js";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60";

const variants = {
  primary: "bg-brand-700 text-white hover:bg-brand-800 shadow-sm",
  secondary: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
};

const sizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  icon: "size-8",
};

/** Class helper so <Link> elements can look like buttons without nesting interactive elements. */
export const buttonStyles = ({ variant = "primary", size = "md", className } = {}) =>
  cn(base, variants[variant], sizes[size], className);

export default function Button({ variant = "primary", size = "md", loading = false, disabled, className, children, type = "button", ...props }) {
  return (
    <button type={type} disabled={disabled || loading} aria-busy={loading || undefined} className={buttonStyles({ variant, size, className })} {...props}>
      {loading && <Spinner className="size-4" />}
      {children}
    </button>
  );
}
