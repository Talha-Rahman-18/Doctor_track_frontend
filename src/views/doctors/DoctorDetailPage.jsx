"use client";

import { ArrowLeft, Building2, Mail, Pencil, Phone, Plus, Trash2, Users } from "lucide-react";
import { useCallback, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import PageHeader from "../../components/common/PageHeader.jsx";
import SearchInput from "../../components/common/SearchInput.jsx";
import ConfirmDialog from "../../components/feedback/ConfirmDialog.jsx";
import EmptyState from "../../components/feedback/EmptyState.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import PatientForm from "../../components/forms/PatientForm.jsx";
import { TableSkeleton } from "../../components/tables/DataTable.jsx";
import Pagination from "../../components/tables/Pagination.jsx";
import PatientsTable from "../../components/tables/PatientsTable.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button, { buttonStyles } from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Skeleton from "../../components/ui/Skeleton.jsx";
import {
  useCreateDoctorPatientMutation,
  useDeleteDoctorMutation,
  useGetDoctorPatientsQuery,
  useGetDoctorQuery,
} from "../../features/doctors/doctorsApi.js";
import { useDeletePatientMutation } from "../../features/patients/patientsApi.js";
import { useListParams } from "../../hooks/useListParams.js";
import { DEFAULT_PAGE_SIZE, ROUTES } from "../../lib/constants.js";
import { formatDate, formatNumber } from "../../lib/utils.js";

const DEFAULTS = { page: 1, limit: DEFAULT_PAGE_SIZE, search: "" };

function InfoRow({ icon: Icon, children }) {
  return (
    <li className="flex items-center gap-3 text-sm text-slate-700">
      <Icon className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
      <span className="min-w-0 break-words">{children}</span>
    </li>
  );
}

export default function DoctorDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { params, update, hasActiveFilters } = useListParams(DEFAULTS);

  const doctorQuery = useGetDoctorQuery(id);
  const { data: doctor } = doctorQuery;
  const patientsQuery = useGetDoctorPatientsQuery({ id, ...params }, { skip: !doctor });
  const [createPatient] = useCreateDoctorPatientMutation();
  const [deletePatient, { isLoading: isDeletingPatient }] = useDeletePatientMutation();
  const [deleteDoctor, { isLoading: isDeletingDoctor }] = useDeleteDoctorMutation();

  const [adding, setAdding] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [confirmingDoctorDelete, setConfirmingDoctorDelete] = useState(false);

  const onSearch = useCallback((search) => update({ search }), [update]);
  const closeAdd = useCallback(() => setAdding(false), []);

  const back = <Link href={ROUTES.doctors} className="inline-flex items-center gap-1 hover:text-slate-800"><ArrowLeft className="size-4" aria-hidden="true" /> All doctors</Link>;

  if (doctorQuery.isLoading) {
    return (
      <>
        <PageHeader breadcrumb={back} title="Doctor" />
        <div role="status" aria-label="Loading doctor" className="space-y-6">
          <Card className="space-y-3 p-6"><Skeleton className="h-6 w-1/3" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-4 w-1/4" /></Card>
          <Card><TableSkeleton rows={4} /></Card>
        </div>
      </>
    );
  }

  if (doctorQuery.isError) {
    const missing = doctorQuery.error?.status === 404;
    return (
      <>
        <PageHeader breadcrumb={back} title="Doctor" />
        <Card>
          <ErrorState
            title={missing ? "Doctor not found" : "Couldn't load doctor"}
            message={missing ? "This doctor may have been deleted." : undefined}
            error={doctorQuery.error}
            onRetry={missing ? undefined : doctorQuery.refetch}
            retrying={doctorQuery.isFetching}
            action={<Link href={ROUTES.doctors} className={buttonStyles({ variant: "secondary" })}>Back to doctors</Link>}
          />
        </Card>
      </>
    );
  }

  const { data, isLoading, isFetching, isError, error, refetch } = patientsQuery;
  const patients = data?.patients ?? [];
  const pagination = data?.pagination;

  const onAddPatient = async (values) => {
    const created = await createPatient({ doctorId: id, body: values }).unwrap();
    toast.success(`${created.name} was added to ${doctor.name}`);
    setAdding(false);
  };

  const onDeletePatient = async () => {
    try {
      await deletePatient(patientToDelete._id).unwrap();
      toast.success(`${patientToDelete.name} was deleted`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPatientToDelete(null);
    }
  };

  const onDeleteDoctor = async () => {
    try {
      await deleteDoctor(id).unwrap();
      toast.success(`${doctor.name} was deleted`);
      router.replace(ROUTES.doctors);
    } catch (err) {
      // 409 when patients remain: the server message tells the admin what to do next.
      toast.error(err.message);
      setConfirmingDoctorDelete(false);
    }
  };

  return (
    <>
      <PageHeader
        breadcrumb={back}
        title={doctor.name}
        description={`${doctor.specialization} · ${doctor.hospital}`}
        actions={
          <>
            <Link href={ROUTES.editDoctor(id)} className={buttonStyles({ variant: "secondary" })}><Pencil className="size-4" aria-hidden="true" /> Edit</Link>
            <Button variant="danger" onClick={() => setConfirmingDoctorDelete(true)}><Trash2 className="size-4" aria-hidden="true" /> Delete</Button>
          </>
        }
      />

      <Card className="mb-6 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <ul className="space-y-2.5">
            <InfoRow icon={Building2}>{doctor.hospital}</InfoRow>
            <InfoRow icon={Phone}>{doctor.phone}</InfoRow>
            <InfoRow icon={Mail}>{doctor.email}</InfoRow>
          </ul>
          <div className="flex gap-6 sm:text-right">
            <div><p className="text-2xl font-semibold">{formatNumber(doctor.patientCount)}</p><p className="text-xs text-slate-500">Patients</p></div>
            <div><Badge tone="brand">{doctor.specialization}</Badge><p className="mt-1.5 text-xs text-slate-500">Added {formatDate(doctor.createdAt)}</p></div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-slate-900">Patients</h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="sm:w-64"><SearchInput value={params.search} onChange={onSearch} label="Search this doctor's patients" placeholder="Search patients…" /></div>
            <Button onClick={() => setAdding(true)}><Plus className="size-4" aria-hidden="true" /> Add patient</Button>
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={4} />
        ) : isError ? (
          <ErrorState title="Couldn't load patients" error={error} onRetry={refetch} retrying={isFetching} />
        ) : patients.length === 0 ? (
          hasActiveFilters ? (
            <EmptyState icon={Users} title="No patients match your search" description="Try a different name." />
          ) : (
            <EmptyState icon={Users} title="No patients assigned to this doctor" description="Add the first patient to start tracking their care." action={<Button onClick={() => setAdding(true)}><Plus className="size-4" aria-hidden="true" /> Add patient</Button>} />
          )
        ) : (
          <>
            <PatientsTable patients={patients} isFetching={isFetching} onDelete={setPatientToDelete} />
            <Pagination pagination={pagination} isFetching={isFetching} itemLabel="patients" onPageChange={(page) => update({ page })} onLimitChange={(limit) => update({ limit })} />
          </>
        )}
      </Card>

      <Modal open={adding} onClose={closeAdd} title={`Add patient to ${doctor.name}`} size="lg">
        <PatientForm onSubmit={onAddPatient} submitLabel="Add patient" onCancel={closeAdd} />
      </Modal>

      <ConfirmDialog
        open={Boolean(patientToDelete)}
        title="Delete patient?"
        description={patientToDelete ? `${patientToDelete.name}'s record will be permanently deleted. This cannot be undone.` : ""}
        loading={isDeletingPatient}
        onConfirm={onDeletePatient}
        onCancel={() => setPatientToDelete(null)}
      />
      <ConfirmDialog
        open={confirmingDoctorDelete}
        title="Delete doctor?"
        description={`${doctor.name} will be permanently removed. This is only possible when the doctor has no patients.`}
        loading={isDeletingDoctor}
        onConfirm={onDeleteDoctor}
        onCancel={() => setConfirmingDoctorDelete(false)}
      />
    </>
  );
}
