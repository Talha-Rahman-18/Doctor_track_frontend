"use client";

import { useId } from "react";
import { cn } from "../../lib/utils.js";

const controlClass = "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-brand-600";

export function FilterSelect({ label, value, onChange, options, placeholder = "All" }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-slate-600">{label}</label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={controlClass}>
        {placeholder !== null && <option value="">{placeholder}</option>}
        {options.filter(Boolean).map((option) => {
          const { value: optionValue, label: optionLabel } = typeof option === "string" ? { value: option, label: option } : option;
          return <option key={optionValue} value={optionValue}>{optionLabel}</option>;
        })}
      </select>
    </div>
  );
}

export function FilterDate({ label, value, onChange, min, max, className }) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-slate-600">{label}</label>
      <input id={id} type="date" value={value} min={min} max={max} onChange={(event) => onChange(event.target.value)} className={cn(controlClass)} />
    </div>
  );
}
