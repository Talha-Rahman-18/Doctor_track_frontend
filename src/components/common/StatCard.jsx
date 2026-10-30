"use client";

import Card from "../ui/Card.jsx";
import Skeleton from "../ui/Skeleton.jsx";

export default function StatCard({ icon: Icon, label, value, hint, loading }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <span className="flex size-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
      {loading ? (
        <div className="mt-3 space-y-2" aria-busy="true">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-32" />
        </div>
      ) : (
        <>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
          {hint && <p className="mt-1 text-sm text-slate-500">{hint}</p>}
        </>
      )}
    </Card>
  );
}
