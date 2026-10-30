"use client";

import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SEARCH_DEBOUNCE_MS } from "../../lib/constants.js";
import { useDebounce } from "../../hooks/useDebounce.js";

/**
 * Debounced search box. `value` is the committed value (e.g. from the URL); typing is local until
 * the debounce settles, so each keystroke does not trigger a request.
 */
export default function SearchInput({ value = "", onChange, label = "Search", placeholder = "Search…", maxLength = 50 }) {
  const [text, setText] = useState(value);
  const debounced = useDebounce(text, SEARCH_DEBOUNCE_MS);
  const lastEmitted = useRef(value);

  useEffect(() => {
    if (debounced.trim() !== lastEmitted.current.trim()) {
      lastEmitted.current = debounced;
      onChange(debounced.trim());
    }
  }, [debounced, onChange]);

  // Sync when the value changes from outside (e.g. "Clear filters"), but not from our own emit.
  useEffect(() => {
    if (value !== lastEmitted.current.trim()) {
      lastEmitted.current = value;
      setText(value);
    }
  }, [value]);

  return (
    <div className="relative">
      <label htmlFor="list-search" className="sr-only">{label}</label>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
      <input
        id="list-search"
        type="search"
        value={text}
        maxLength={maxLength}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(event) => setText(event.target.value)}
        className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-brand-600"
      />
    </div>
  );
}
