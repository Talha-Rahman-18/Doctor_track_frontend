"use client";

import { CalendarRange, Stethoscope, TrendingUp, Users } from "lucide-react";
import { useMemo, useState } from "react";
import ChartCard from "../../components/charts/ChartCard.jsx";
import HorizontalBarChart from "../../components/charts/HorizontalBarChart.jsx";
import TrendChart from "../../components/charts/TrendChart.jsx";
import { FilterDate, FilterSelect } from "../../components/common/FilterField.jsx";
import PageHeader from "../../components/common/PageHeader.jsx";
import StatCard from "../../components/common/StatCard.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import Card from "../../components/ui/Card.jsx";
import { useGetOverviewQuery, useGetPatientsPerDoctorQuery, useGetTrendsQuery } from "../../features/dashboard/dashboardApi.js";
import { DASHBOARD_PRESETS } from "../../lib/constants.js";
import { formatNumber, pluralize, utcDate } from "../../lib/utils.js";

const MAX_RANGE_DAYS = 365 * 5;
const MONTHLY_THRESHOLD_DAYS = 120;

const spanInDays = (start, end) => Math.round((new Date(end) - new Date(start)) / 86_400_000) + 1;

export default function DashboardPage() {
  const [preset, setPreset] = useState("30");
  const [custom, setCustom] = useState({ startDate: utcDate(-29), endDate: utcDate(0) });

  const range = useMemo(
    () => (preset === "custom" ? custom : { startDate: utcDate(-(Number(preset) - 1)), endDate: utcDate(0) }),
    [preset, custom],
  );

  const span = spanInDays(range.startDate, range.endDate);
  const rangeError =
    !range.startDate || !range.endDate ? "Choose both a start and an end date."
    : range.startDate > range.endDate ? "The start date must be on or before the end date."
    : span > MAX_RANGE_DAYS ? "Choose a range of 5 years or less."
    : null;
  const skip = Boolean(rangeError);
  const interval = span > MONTHLY_THRESHOLD_DAYS ? "month" : "day";

  const overview = useGetOverviewQuery(range, { skip });
  const trends = useGetTrendsQuery({ ...range, interval }, { skip });
  const perDoctor = useGetPatientsPerDoctorQuery({ limit: 10 });

  const totals = overview.data?.totals;
  const inRange = overview.data?.inRange;
  const topConditions = overview.data?.topConditions ?? [];
  const periodLabel = preset === "custom" ? "in selected period" : `in the last ${preset} days`;

  return (
    <>
      <PageHeader title="Dashboard" description="Overview of doctors, patients and registration activity." />

      <Card className="mb-6 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <CalendarRange className="size-5 text-slate-500" aria-hidden="true" /> Period
          </div>
          <div className="w-44">
            <FilterSelect label="Date range" value={preset} onChange={setPreset} options={DASHBOARD_PRESETS} placeholder={null} />
          </div>
          {preset === "custom" && (
            <>
              <FilterDate label="From" value={custom.startDate} max={custom.endDate || utcDate(0)} onChange={(value) => setCustom((c) => ({ ...c, startDate: value }))} />
              <FilterDate label="To" value={custom.endDate} min={custom.startDate} max={utcDate(0)} onChange={(value) => setCustom((c) => ({ ...c, endDate: value }))} />
            </>
          )}
        </div>
        {rangeError && <p role="alert" className="mt-3 text-sm text-red-700">{rangeError}</p>}
      </Card>

      {overview.isError ? (
        <Card className="mb-6"><ErrorState title="Couldn't load summary figures" error={overview.error} onRetry={overview.refetch} retrying={overview.isFetching} /></Card>
      ) : (
        <section aria-label="Summary" className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Stethoscope} label="Total doctors" value={formatNumber(totals?.doctors)} hint={inRange ? `+${formatNumber(inRange.doctors)} ${periodLabel}` : undefined} loading={overview.isLoading} />
          <StatCard icon={Users} label="Total patients" value={formatNumber(totals?.patients)} hint={inRange ? `+${formatNumber(inRange.patients)} ${periodLabel}` : undefined} loading={overview.isLoading} />
          <StatCard icon={TrendingUp} label="Avg. patients per doctor" value={totals?.averagePatientsPerDoctor ?? 0} hint="All time" loading={overview.isLoading} />
          <StatCard icon={CalendarRange} label="New patients" value={formatNumber(inRange?.patients)} hint={`${span} ${pluralize(span, "day")} · ${range.startDate} to ${range.endDate}`} loading={overview.isLoading} />
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-5">
        <ChartCard
          className="xl:col-span-5"
          title="Registrations over time"
          description={`New doctors and patients per ${interval}${interval === "month" ? " (range is longer than 120 days)" : ""}`}
          isLoading={!skip && trends.isLoading}
          isError={trends.isError}
          error={trends.error}
          onRetry={trends.refetch}
          isEmpty={skip || !trends.data?.series?.some((point) => point.doctors || point.patients)}
          emptyMessage={skip ? "Select a valid date range." : "No doctors or patients were added in this period."}
          height={300}
        >
          <TrendChart series={trends.data?.series ?? []} interval={interval} />
        </ChartCard>

        <ChartCard
          className="xl:col-span-3"
          title="Patients per doctor"
          description="Top 10 doctors by number of assigned patients (all time)"
          isLoading={perDoctor.isLoading}
          isError={perDoctor.isError}
          error={perDoctor.error}
          onRetry={perDoctor.refetch}
          isEmpty={!perDoctor.data?.length}
          emptyMessage="Add patients to doctors to see this chart."
          height={Math.max(260, (perDoctor.data?.length ?? 0) * 34 + 40)}
        >
          <HorizontalBarChart data={perDoctor.data ?? []} categoryKey="doctorName" valueKey="patientCount" valueLabel="Patients" />
        </ChartCard>

        <ChartCard
          className="xl:col-span-2"
          title="Top conditions"
          description={`Most common conditions among patients added ${periodLabel}`}
          isLoading={!skip && overview.isLoading}
          isError={overview.isError}
          error={overview.error}
          onRetry={overview.refetch}
          isEmpty={skip || !topConditions.length}
          emptyMessage="No patients were added in this period."
          height={Math.max(260, topConditions.length * 34 + 40)}
        >
          <HorizontalBarChart data={topConditions} categoryKey="condition" valueKey="count" valueLabel="Patients" color="#2563eb" />
        </ChartCard>
      </div>
    </>
  );
}
