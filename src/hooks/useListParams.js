import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

const NUMERIC_KEYS = new Set(["page", "limit"]);

/**
 * Keeps list state (page, search, filters, sort) in the URL so views can be refreshed, bookmarked
 * and shared. Only keys present in `defaults` are read from the URL; defaults are omitted from it.
 */
export function useListParams(defaults) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const params = useMemo(() => {
    const result = { ...defaults };
    for (const key of Object.keys(defaults)) {
      const raw = searchParams.get(key);
      if (raw === null || raw === "") continue;
      if (NUMERIC_KEYS.has(key)) {
        const number = Number.parseInt(raw, 10);
        if (Number.isInteger(number) && number > 0) result[key] = number;
      } else {
        result[key] = raw;
      }
    }
    return result;
  }, [searchParams, defaults]);

  const navigate = useCallback(
    (query) => {
      const qs = query.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const update = useCallback(
    (patch) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === "" || value === null || value === undefined || value === defaults[key]) next.delete(key);
        else next.set(key, String(value));
      }
      // Any filter change returns to the first page unless the page itself is being set.
      if (!("page" in patch)) next.delete("page");
      navigate(next);
    },
    [defaults, navigate, searchParams],
  );

  const clear = useCallback(() => navigate(new URLSearchParams()), [navigate]);

  const hasActiveFilters = useMemo(
    () => Object.keys(defaults).some((key) => !["page", "limit", "sortBy", "sortOrder"].includes(key) && params[key] !== defaults[key]),
    [defaults, params],
  );

  return { params, update, clear, hasActiveFilters };
}
