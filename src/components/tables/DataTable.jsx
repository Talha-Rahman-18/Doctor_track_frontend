"use client";

import { cn } from "../../lib/utils.js";
import Skeleton from "../ui/Skeleton.jsx";

/**
 * Responsive data table. From `md` up it renders a real <table>; on small screens the same column
 * definitions render as stacked cards, so there is no horizontal scrolling on phones.
 * columns: [{ key, header, cell(row), className?, hideOnMobileLabel? }]. The first column is the card title.
 */
export default function DataTable({ columns, rows, getRowKey = (row) => row._id, isFetching = false, caption }) {
  const [titleColumn, ...otherColumns] = columns;

  return (
    <div aria-busy={isFetching} className={cn("transition-opacity", isFetching && "opacity-60")}>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <tr>
              {columns.map((column) => (
                <th key={column.key} scope="col" className={cn("px-4 py-3", column.className)}>{column.header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={getRowKey(row)} className="hover:bg-slate-50/70">
                {columns.map((column) => (
                  <td key={column.key} className={cn("px-4 py-3 align-middle", column.className)}>{column.cell(row)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-slate-100 md:hidden">
        {rows.map((row) => (
          <li key={getRowKey(row)} className="space-y-3 p-4">
            <div>{titleColumn.cell(row)}</div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {otherColumns
                .filter((column) => column.header)
                .map((column) => (
                  <div key={column.key} className={column.key === "actions" ? "col-span-2" : undefined}>
                    {column.key !== "actions" && <dt className="text-xs text-slate-500">{column.header}</dt>}
                    <dd className="text-slate-900">{column.cell(row)}</dd>
                  </div>
                ))}
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TableSkeleton({ rows = 6 }) {
  return (
    <div role="status" aria-label="Loading data" aria-busy="true" className="divide-y divide-slate-100">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-4 px-4 py-4">
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="hidden h-4 w-24 sm:block" />
          <Skeleton className="hidden h-4 w-16 md:block" />
        </div>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}
