"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import PageHeader from "../../components/common/PageHeader.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import PatientForm from "../../components/forms/PatientForm.jsx";
import { buttonStyles } from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import Skeleton from "../../components/ui/Skeleton.jsx";
import { useCreateDoctorPatientMutation } from "../../features/doctors/doctorsApi.js";
import { useGetPatientQuery, useUpdatePatientMutation } from "../../features/patients/patientsApi.js";
import { ROUTES } from "../../lib/constants.js";

export default function PatientFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const router = useRouter();
  const { data: patient, isLoading, isError, error, refetch } = useGetPatientQuery(id, { skip: !isEdit });
  const [createPatient] = useCreateDoctorPatientMutation();
  const [updatePatient] = useUpdatePatientMutation();

  const onSubmit = async ({ doctor, ...fields }) => {
    // Same form values, two endpoints: new patients are created under a doctor; edits may reassign.
    if (isEdit) {
      await updatePatient({ id, body: { ...fields, doctor } }).unwrap();
      toast.success("Patient updated");
      router.push(ROUTES.patient(id));
    } else {
      const created = await createPatient({ doctorId: doctor, body: fields }).unwrap();
      toast.success(`${created.name} was added`);
      router.push(ROUTES.patient(created._id));
    }
  };

  const back = <Link href={isEdit ? ROUTES.patient(id) : ROUTES.patients} className="inline-flex items-center gap-1 hover:text-slate-800"><ArrowLeft className="size-4" aria-hidden="true" /> {isEdit ? "Back to patient" : "All patients"}</Link>;

  return (
    <>
      <PageHeader breadcrumb={back} title={isEdit ? "Edit patient" : "Add patient"} description={isEdit ? "Update this patient's information or reassign their doctor." : "Choose a doctor and enter the patient's details."} />
      <div className="max-w-3xl">
        {isEdit && isLoading ? (
          <Card className="space-y-5 p-6" role="status" aria-label="Loading patient">
            {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </Card>
        ) : isEdit && isError ? (
          <Card>
            <ErrorState
              title={error?.status === 404 ? "Patient not found" : "Couldn't load patient"}
              error={error}
              onRetry={error?.status === 404 ? undefined : refetch}
              action={<Link href={ROUTES.patients} className={buttonStyles({ variant: "secondary" })}>Back to patients</Link>}
            />
          </Card>
        ) : (
          <Card className="p-6">
            <PatientForm
              withDoctorField
              defaultValues={isEdit ? { name: patient.name, age: patient.age, gender: patient.gender, phone: patient.phone, condition: patient.condition, notes: patient.notes ?? "", doctor: patient.doctor?._id ?? "" } : undefined}
              onSubmit={onSubmit}
              submitLabel={isEdit ? "Save changes" : "Create patient"}
              onCancel={() => router.push(isEdit ? ROUTES.patient(id) : ROUTES.patients)}
            />
          </Card>
        )}
      </div>
    </>
  );
}
