"use client";

import { useId } from "react";
import { cn } from "../../lib/utils.js";

const controlClass = (error) =>
  cn(
    "w-full rounded-lg border bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500",
    error ? "border-red-500 focus:border-red-600" : "border-slate-300 focus:border-brand-600",
  );

/** Label + control + hint + accessible error message, shared by every field type. */
export function Field({ id, label, error, hint, required, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-600" aria-hidden="true">*</span>}
      </label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p id={`${id}-error`} role="alert" className="mt-1 text-xs font-medium text-red-700">{error}</p>}
    </div>
  );
}

const describedBy = (id, error, hint) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined);

// React 19 passes `ref` as a regular prop, which is what react-hook-form's register() needs.
export function TextField({ label, error, hint, required, className, ref, ...props }) {
  const id = useId();
  return (
    <Field id={id} label={label} error={error} hint={hint} required={required}>
      <input
        id={id}
        ref={ref}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={cn(controlClass(error), "h-10", className)}
        {...props}
      />
    </Field>
  );
}

export function SelectField({ label, error, hint, required, options, placeholder, ref, ...props }) {
  const id = useId();
  return (
    <Field id={id} label={label} error={error} hint={hint} required={required}>
      <select
        id={id}
        ref={ref}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={cn(controlClass(error), "h-10")}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </Field>
  );
}

export function TextareaField({ label, error, hint, required, ref, ...props }) {
  const id = useId();
  return (
    <Field id={id} label={label} error={error} hint={hint} required={required}>
      <textarea
        id={id}
        ref={ref}
        rows={4}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={cn(controlClass(error), "py-2")}
        {...props}
      />
    </Field>
  );
}
