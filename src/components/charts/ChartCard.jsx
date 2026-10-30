"use client";

import { ChartNoAxesColumn } from "lucide-react";
import EmptyState from "../feedback/EmptyState.jsx";
import ErrorState from "../feedback/ErrorState.jsx";
import Card from "../ui/Card.jsx";
import Skeleton from "../ui/Skeleton.jsx";

/** Frame with consistent loading / error / empty handling for every chart. */
export default function ChartCard({ title, description, isLoading, isError, error, onRetry, isEmpty, emptyMessage = "No data for this period.", height = 288, actions, children, className }) {
  return (
    <Card className={className}>
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
        </div>
        {actions}
      </div>
      <div className="p-4 sm:p-5">
        {isLoading ? (
          <div role="status" aria-label={`Loading ${title}`} style={{ height }} className="flex flex-col justify-end gap-2">
            <Skeleton className="h-full w-full" />
            <span className="sr-only">Loading chart…</span>
          </div>
        ) : isError ? (
          <ErrorState title="Chart unavailable" error={error} onRetry={onRetry} />
        ) : isEmpty ? (
          <EmptyState icon={ChartNoAxesColumn} title="No data to show" description={emptyMessage} />
        ) : (
          <div style={{ height }}>{children}</div>
        )}
      </div>
    </Card>
  );
}
