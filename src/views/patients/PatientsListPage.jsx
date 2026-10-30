"use client";

import { Plus, Users } from "lucide-react";
import { useCallback, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { FilterDate, FilterSelect } from "../../components/common/FilterField.jsx";
import PageHeader from "../../components/common/PageHeader.jsx";
import SearchInput from "../../components/common/SearchInput.jsx";
import ConfirmDialog from "../../components/feedback/ConfirmDialog.jsx";
import EmptyState from "../../components/feedback/EmptyState.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import DoctorCombobox from "../../components/forms/DoctorCombobox.jsx";
import { TableSkeleton } from "../../components/tables/DataTable.jsx";
import Pagination from "../../components/tables/Pagination.jsx";
import PatientsTable from "../../components/tables/PatientsTable.jsx";
import Button, { buttonStyles } from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import { useDeletePatientMutation, useGetPatientOptionsQuery, useGetPatientsQuery } from "../../features/patients/patientsApi.js";
import { useListParams } from "../../hooks/useListParams.js";
import { DEFAULT_PAGE_SIZE, PATIENT_SORT_OPTIONS, ROUTES } from "../../lib/constants.js";
import { formatNumber, pluralize } from "../../lib/utils.js";

const DEFAULTS = {
  page: 1, limit: DEFAULT_PAGE_SIZE, search: "", doctor: "", condition: "",
  startDate: "", endDate: "", sortBy: "createdAt", sortOrder: "desc",
};

export default function PatientsListPage() {
  const { params, update, clear, hasActiveFilters } = useListParams(DEFAULTS);
  const { data, isLoading, isFetching, isError, error, refetch } = useGetPatientsQuery(params);
  const { data: options } = useGetPatientOptionsQuery();
  const [deletePatient, { isLoading: isDeleting }] = useDeletePatientMutation();
  const [toDelete, setToDelete] = useState(null);

  const onSearch = useCallback((search) => update({ search }), [update]);
  const patients = data?.patients ?? [];
  const pagination = data?.pagination;
  const pastLastPage = !isError && !isLoading && patients.length === 0 && (pagination?.total ?? 0) > 0;

  const confirmDelete = async () => {
    try {
      await deletePatient(toDelete._id).unwrap();
      toast.success(`${toDelete.name} was deleted`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setToDelete(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Patients"
        description="All patients across every doctor."
        actions={<Link href={ROUTES.newPatient} className={buttonStyles()}><Plus className="size-4" aria-hidden="true" /> Add patient</Link>}
      />

      <Card className="mb-4 p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1 lg:pt-5">
            <SearchInput value={params.search} onChange={onSearch} label="Search patients" placeholder="Search by patient name…" />
          </div>
          <DoctorCombobox label="Doctor" hideLabel={false} allowClear value={params.doctor} onChange={(doctor) => update({ doctor })} placeholder="All doctors" />
          <FilterSelect label="Condition" value={params.condition} onChange={(v) => update({ condition: v })} options={options?.conditions ?? []} />
          <FilterSelect
            label="Sort by"
            value={`${params.sortBy}:${params.sortOrder}`}
            onChange={(v) => { const [sortBy, sortOrder] = v.split(":"); update({ sortBy, sortOrder }); }}
            options={PATIENT_SORT_OPTIONS}
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
            <strong className="text-slate-900">{formatNumber(pagination.total)}</strong> {pluralize(pagination.total, "patient")}
            {hasActiveFilters && " match your filters"}
          </p>
        )}
        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <ErrorState title="Couldn't load patients" error={error} onRetry={refetch} retrying={isFetching} />
        ) : pastLastPage ? (
          <EmptyState icon={Users} title="This page is empty" description="There are fewer results than this page number." action={<Button variant="secondary" onClick={() => update({ page: 1 })}>Back to first page</Button>} />
        ) : patients.length === 0 ? (
          hasActiveFilters ? (
            <EmptyState icon={Users} title="No patients match your filters" description="Try a different search term or remove some filters." action={<Button variant="secondary" onClick={clear}>Clear filters</Button>} />
          ) : (
            <EmptyState icon={Users} title="No patients yet" description="Patients are added under a doctor." action={<Link href={ROUTES.newPatient} className={buttonStyles()}><Plus className="size-4" aria-hidden="true" /> Add patient</Link>} />
          )
        ) : (
          <>
            <PatientsTable patients={patients} showDoctor isFetching={isFetching} onDelete={setToDelete} />
            <Pagination pagination={pagination} isFetching={isFetching} itemLabel="patients" onPageChange={(page) => update({ page })} onLimitChange={(limit) => update({ limit })} />
          </>
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete patient?"
        description={toDelete ? `${toDelete.name}'s record will be permanently deleted. This cannot be undone.` : ""}
        loading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
