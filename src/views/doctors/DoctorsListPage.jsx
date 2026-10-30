"use client";

import { Plus, Stethoscope } from "lucide-react";
import { useCallback, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { FilterDate, FilterSelect } from "../../components/common/FilterField.jsx";
import PageHeader from "../../components/common/PageHeader.jsx";
import RowActions from "../../components/common/RowActions.jsx";
import SearchInput from "../../components/common/SearchInput.jsx";
import ConfirmDialog from "../../components/feedback/ConfirmDialog.jsx";
import EmptyState from "../../components/feedback/EmptyState.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import DataTable, { TableSkeleton } from "../../components/tables/DataTable.jsx";
import Pagination from "../../components/tables/Pagination.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button, { buttonStyles } from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import { useDeleteDoctorMutation, useGetDoctorOptionsQuery, useGetDoctorsQuery } from "../../features/doctors/doctorsApi.js";
import { useListParams } from "../../hooks/useListParams.js";
import { DEFAULT_PAGE_SIZE, DOCTOR_SORT_OPTIONS, ROUTES } from "../../lib/constants.js";
import { formatDate, formatNumber, pluralize } from "../../lib/utils.js";

const DEFAULTS = {
  page: 1, limit: DEFAULT_PAGE_SIZE, search: "", specialization: "", hospital: "",
  startDate: "", endDate: "", sortBy: "createdAt", sortOrder: "desc",
};

export default function DoctorsListPage() {
  const { params, update, clear, hasActiveFilters } = useListParams(DEFAULTS);
  const { data, isLoading, isFetching, isError, error, refetch } = useGetDoctorsQuery(params);
  const { data: options } = useGetDoctorOptionsQuery();
  const [deleteDoctor, { isLoading: isDeleting }] = useDeleteDoctorMutation();
  const [toDelete, setToDelete] = useState(null);

  const onSearch = useCallback((search) => update({ search }), [update]);
  const doctors = data?.doctors ?? [];
  const pagination = data?.pagination;

  const confirmDelete = async () => {
    try {
      await deleteDoctor(toDelete._id).unwrap();
      toast.success(`${toDelete.name} was deleted`);
      setToDelete(null);
    } catch (err) {
      // e.g. 409: doctor still has patients. Explain it instead of failing silently.
      toast.error(err.message);
      setToDelete(null);
    }
  };

  const columns = [
    {
      key: "name", header: "Doctor",
      cell: (d) => (
        <div>
          <Link href={ROUTES.doctor(d._id)} className="font-medium text-slate-900 hover:text-brand-700 hover:underline">{d.name}</Link>
          <p className="text-xs text-slate-500">{d.email}</p>
        </div>
      ),
    },
    { key: "specialization", header: "Specialization", cell: (d) => <Badge tone="brand">{d.specialization}</Badge> },
    { key: "hospital", header: "Hospital", cell: (d) => d.hospital },
    { key: "phone", header: "Phone", cell: (d) => d.phone },
    { key: "patients", header: "Patients", cell: (d) => formatNumber(d.patientCount), className: "md:text-right" },
    { key: "createdAt", header: "Added", cell: (d) => formatDate(d.createdAt) },
    {
      key: "actions", header: <span className="sr-only">Actions</span>,
      cell: (d) => <RowActions name={d.name} viewTo={ROUTES.doctor(d._id)} editTo={ROUTES.editDoctor(d._id)} onDelete={() => setToDelete(d)} />,
    },
  ];

  const pastLastPage = !isError && !isLoading && doctors.length === 0 && (pagination?.total ?? 0) > 0;

  return (
    <>
      <PageHeader
        title="Doctors"
        description="Search, filter and manage the doctors in your directory."
        actions={<Link href={ROUTES.newDoctor} className={buttonStyles()}><Plus className="size-4" aria-hidden="true" /> Add doctor</Link>}
      />

      <Card className="mb-4 p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1 lg:pt-5">
            <SearchInput value={params.search} onChange={onSearch} label="Search doctors" placeholder="Search by name or email…" />
          </div>
          <FilterSelect label="Specialization" value={params.specialization} onChange={(v) => update({ specialization: v })} options={options?.specializations ?? []} />
          <FilterSelect label="Hospital" value={params.hospital} onChange={(v) => update({ hospital: v })} options={options?.hospitals ?? []} />
          <FilterSelect
            label="Sort by"
            value={`${params.sortBy}:${params.sortOrder}`}
            onChange={(v) => { const [sortBy, sortOrder] = v.split(":"); update({ sortBy, sortOrder }); }}
            options={DOCTOR_SORT_OPTIONS}
            placeholder={null}
          />
          <FilterDate label="Added from" value={params.startDate} max={params.endDate || undefined} onChange={(v) => update({ startDate: v })} />
          <FilterDate label="Added to" value={params.endDate} min={params.startDate || undefined} onChange={(v) => update({ endDate: v })} />
          <div className="flex items-end">
            {hasActiveFilters && <Button variant="secondary" onClick={clear}>Clear filters</Button>}
          </div>
        </div>
      </Card>

      <Card>
        {pagination && (
          <p className="border-b border-slate-100 px-4 py-3 text-sm text-slate-600" aria-live="polite">
            <strong className="text-slate-900">{formatNumber(pagination.total)}</strong> {pluralize(pagination.total, "doctor")}
            {hasActiveFilters && " match your filters"}
          </p>
        )}

        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <ErrorState title="Couldn't load doctors" error={error} onRetry={refetch} retrying={isFetching} />
        ) : pastLastPage ? (
          <EmptyState icon={Stethoscope} title="This page is empty" description="There are fewer results than this page number." action={<Button variant="secondary" onClick={() => update({ page: 1 })}>Back to first page</Button>} />
        ) : doctors.length === 0 ? (
          hasActiveFilters ? (
            <EmptyState icon={Stethoscope} title="No doctors match your filters" description="Try a different search term or remove some filters." action={<Button variant="secondary" onClick={clear}>Clear filters</Button>} />
          ) : (
            <EmptyState icon={Stethoscope} title="No doctors yet" description="Add your first doctor to start tracking patients." action={<Link href={ROUTES.newDoctor} className={buttonStyles()}><Plus className="size-4" aria-hidden="true" /> Add doctor</Link>} />
          )
        ) : (
          <>
            <DataTable columns={columns} rows={doctors} isFetching={isFetching} caption="Doctors" />
            <Pagination pagination={pagination} isFetching={isFetching} itemLabel="doctors" onPageChange={(page) => update({ page })} onLimitChange={(limit) => update({ limit })} />
          </>
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete doctor?"
        description={toDelete ? `${toDelete.name} will be permanently removed. A doctor who still has patients cannot be deleted; reassign or delete those patients first.` : ""}
        loading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
