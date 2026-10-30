"use client";

import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import PageHeader from "../../components/common/PageHeader.jsx";
import ConfirmDialog from "../../components/feedback/ConfirmDialog.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button, { buttonStyles } from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import Skeleton from "../../components/ui/Skeleton.jsx";
import { useDeletePatientMutation, useGetPatientQuery } from "../../features/patients/patientsApi.js";
import { ROUTES } from "../../lib/constants.js";
import { formatDate } from "../../lib/utils.js";

function Detail({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900">{children || "—"}</dd>
    </div>
  );
}

export default function PatientDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: patient, isLoading, isError, error, refetch, isFetching } = useGetPatientQuery(id);
  const [deletePatient, { isLoading: isDeleting }] = useDeletePatientMutation();
  const [confirming, setConfirming] = useState(false);

  const onDelete = async () => {
    try {
      await deletePatient(id).unwrap();
      toast.success("Patient deleted");
      router.replace(ROUTES.patients);
    } catch (err) {
      toast.error(err.message);
      setConfirming(false);
    }
  };

  const back = <Link href={ROUTES.patients} className="inline-flex items-center gap-1 hover:text-slate-800"><ArrowLeft className="size-4" aria-hidden="true" /> All patients</Link>;

  if (isLoading) {
    return (
      <>
        <PageHeader breadcrumb={back} title="Patient" />
        <Card className="space-y-4 p-6" role="status" aria-label="Loading patient">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-24 w-full" />
        </Card>
      </>
    );
  }
  if (isError) {
    const missing = error?.status === 404;
    return (
      <>
        <PageHeader breadcrumb={back} title="Patient" />
        <Card>
          <ErrorState title={missing ? "Patient not found" : "Couldn't load patient"} message={missing ? "This patient may have been deleted." : undefined} error={error} onRetry={missing ? undefined : refetch} retrying={isFetching} />
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        breadcrumb={back}
        title={patient.name}
        description={`${patient.age} years old · added ${formatDate(patient.createdAt)}`}
        actions={
          <>
            <Link href={ROUTES.editPatient(id)} className={buttonStyles({ variant: "secondary" })}><Pencil className="size-4" aria-hidden="true" /> Edit</Link>
            <Button variant="danger" onClick={() => setConfirming(true)}><Trash2 className="size-4" aria-hidden="true" /> Delete</Button>
          </>
        }
      />
      <Card className="max-w-3xl p-6">
        <dl className="grid gap-6 sm:grid-cols-2">
          <Detail label="Condition"><Badge tone="brand">{patient.condition}</Badge></Detail>
          <Detail label="Gender"><span className="capitalize">{patient.gender}</span></Detail>
          <Detail label="Phone">{patient.phone}</Detail>
          <Detail label="Doctor">
            {patient.doctor?._id ? (
              <Link href={ROUTES.doctor(patient.doctor._id)} className="text-brand-700 hover:underline">
                {patient.doctor.name} <span className="text-slate-500">· {patient.doctor.specialization}</span>
              </Link>
            ) : (
              <span className="text-slate-500">Doctor unavailable</span>
            )}
          </Detail>
          <div className="sm:col-span-2"><Detail label="Notes"><span className="whitespace-pre-wrap">{patient.notes}</span></Detail></div>
        </dl>
      </Card>
      <ConfirmDialog open={confirming} title="Delete patient?" description={`${patient.name}'s record will be permanently deleted. This cannot be undone.`} loading={isDeleting} onConfirm={onDelete} onCancel={() => setConfirming(false)} />
    </>
  );
}
