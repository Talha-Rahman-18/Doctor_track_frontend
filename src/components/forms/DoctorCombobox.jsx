"use client";

import { Check, ChevronsUpDown, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useGetDoctorQuery, useGetDoctorsQuery } from "../../features/doctors/doctorsApi.js";
import { useDebounce } from "../../hooks/useDebounce.js";
import { cn } from "../../lib/utils.js";
import Spinner from "../ui/Spinner.jsx";
import { Field } from "./FormFields.jsx";

/**
 * Searchable doctor picker. Options are fetched from the server as the user types (limited to 8),
 * so it scales to large doctor lists. Implements the ARIA combobox/listbox pattern.
 */
export default function DoctorCombobox({ label = "Doctor", value, onChange, error, required, allowClear = false, placeholder = "Search doctors by name…", hideLabel = false }) {
  const baseId = useId();
  const listId = `${baseId}-list`;
  const containerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const debounced = useDebounce(query, 300);

  const { data: selected } = useGetDoctorQuery(value, { skip: !value });
  const { data, isFetching, isError } = useGetDoctorsQuery(
    { search: debounced.trim() || undefined, limit: 8, sortBy: "name", sortOrder: "asc" },
    { skip: !open },
  );
  const options = data?.doctors ?? [];

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const choose = (doctor) => {
    onChange(doctor?._id ?? "");
    setQuery("");
    setOpen(false);
  };

  const onKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => Math.min(index + 1, options.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && open && options[activeIndex]) {
      event.preventDefault();
      choose(options[activeIndex]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  const inputValue = open ? query : (selected ? `${selected.name} · ${selected.specialization}` : "");

  return (
    <div ref={containerRef} className="relative">
      <Field id={baseId} label={hideLabel ? <span className="sr-only">{label}</span> : label} error={error} required={required}>
        <div className="relative">
          <input
            id={baseId}
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? `${baseId}-error` : undefined}
            aria-activedescendant={open && options[activeIndex] ? `${baseId}-opt-${activeIndex}` : undefined}
            autoComplete="off"
            placeholder={selected && !open ? undefined : placeholder}
            value={inputValue}
            onFocus={() => setOpen(true)}
            onChange={(event) => { setQuery(event.target.value); setActiveIndex(0); setOpen(true); }}
            onKeyDown={onKeyDown}
            className={cn(
              "h-10 w-full rounded-lg border bg-white pl-3 pr-16 text-sm placeholder:text-slate-400",
              error ? "border-red-500" : "border-slate-300 focus:border-brand-600",
            )}
          />
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
            {allowClear && value && (
              <button type="button" aria-label="Clear selected doctor" onClick={() => choose(null)} className="rounded p-1 text-slate-400 hover:text-slate-700">
                <X className="size-4" aria-hidden="true" />
              </button>
            )}
            <ChevronsUpDown className="size-4 text-slate-400" aria-hidden="true" />
          </div>
        </div>
      </Field>

      {open && (
        <ul id={listId} role="listbox" aria-label="Doctors" className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {isFetching && !options.length && (
            <li className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500"><Spinner /> Searching…</li>
          )}
          {isError && <li className="px-3 py-2 text-sm text-red-700">Couldn't load doctors. Try again.</li>}
          {!isFetching && !isError && !options.length && <li className="px-3 py-2 text-sm text-slate-500">No doctors found</li>}
          {options.map((doctor, index) => (
            <li
              key={doctor._id}
              id={`${baseId}-opt-${index}`}
              role="option"
              aria-selected={doctor._id === value}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(doctor)}
              onMouseEnter={() => setActiveIndex(index)}
              className={cn("flex cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm", index === activeIndex && "bg-brand-50")}
            >
              <span>
                <span className="block font-medium text-slate-900">{doctor.name}</span>
                <span className="block text-xs text-slate-500">{doctor.specialization} · {doctor.hospital}</span>
              </span>
              {doctor._id === value && <Check className="size-4 text-brand-700" aria-hidden="true" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
