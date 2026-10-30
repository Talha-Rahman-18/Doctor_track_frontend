"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { PAGE_SIZE_OPTIONS } from "../../lib/constants.js";
import { formatNumber } from "../../lib/utils.js";
import Button from "../ui/Button.jsx";

export default function Pagination({ pagination, onPageChange, onLimitChange, isFetching = false, itemLabel = "results" }) {
  if (!pagination || pagination.total === 0) return null;
  const { page, limit, total, totalPages, hasNextPage, hasPreviousPage } = pagination;
  const first = (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);

  return (
    <nav aria-label="Pagination" className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-600" aria-live="polite">
        {total > 0 && first <= total ? <>Showing <strong>{first}–{last}</strong> of <strong>{formatNumber(total)}</strong> {itemLabel}</> : <>{formatNumber(total)} {itemLabel}</>}
      </p>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        {onLimitChange && (
          <label className="flex items-center gap-2 text-sm text-slate-600">
            Rows
            <select value={limit} onChange={(event) => onLimitChange(Number(event.target.value))} className="h-8 rounded-md border border-slate-300 bg-white px-2 text-sm">
              {PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
          </label>
        )}
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => onPageChange(page - 1)} disabled={!hasPreviousPage || isFetching} aria-label="Previous page">
            <ChevronLeft className="size-4" aria-hidden="true" /> Prev
          </Button>
          <span className="min-w-20 text-center text-sm text-slate-600">Page {page} of {Math.max(totalPages, 1)}</span>
          <Button variant="secondary" size="sm" onClick={() => onPageChange(page + 1)} disabled={!hasNextPage || isFetching} aria-label="Next page">
            Next <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
