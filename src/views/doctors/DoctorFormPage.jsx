"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import PageHeader from "../../components/common/PageHeader.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import DoctorForm from "../../components/forms/DoctorForm.jsx";
import Card from "../../components/ui/Card.jsx";
import Skeleton from "../../components/ui/Skeleton.jsx";
import { buttonStyles } from "../../components/ui/Button.jsx";
import { useCreateDoctorMutation, useGetDoctorQuery, useUpdateDoctorMutation } from "../../features/doctors/doctorsApi.js";
import { ROUTES } from "../../lib/constants.js";

function FormSkeleton() {
  return (
    <Card className="space-y-5 p-6" role="status" aria-label="Loading doctor">
      {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-10 w-full" />)}
    </Card>
  );
}

export default function DoctorFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const router = useRouter();
  const { data: doctor, isLoading, isError, error, refetch } = useGetDoctorQuery(id, { skip: !isEdit });
  const [createDoctor] = useCreateDoctorMutation();
  const [updateDoctor] = useUpdateDoctorMutation();

  const onSubmit = async (values, { addAnother } = {}) => {
    if (isEdit) {
      await updateDoctor({ id, body: values }).unwrap();
      toast.success("Doctor updated");
      router.push(ROUTES.doctor(id));
      return;
    }
    const created = await createDoctor(values).unwrap();
    toast.success(`${created.name} was added`);
    if (!addAnother) router.push(ROUTES.doctor(created._id));
  };

  const back = <Link href={isEdit ? ROUTES.doctor(id) : ROUTES.doctors} className="inline-flex items-center gap-1 hover:text-slate-800"><ArrowLeft className="size-4" aria-hidden="true" /> {isEdit ? "Back to doctor" : "All doctors"}</Link>;

  return (
    <>
      <PageHeader breadcrumb={back} title={isEdit ? "Edit doctor" : "Add doctor"} description={isEdit ? "Update this doctor's details." : "Create a new doctor record."} />
      <div className="max-w-3xl">
        {isEdit && isLoading ? (
          <FormSkeleton />
        ) : isEdit && isError ? (
          <Card>
            <ErrorState
              title={error?.status === 404 ? "Doctor not found" : "Couldn't load doctor"}
              error={error}
              onRetry={error?.status === 404 ? undefined : refetch}
              action={<Link href={ROUTES.doctors} className={buttonStyles({ variant: "secondary" })}>Back to doctors</Link>}
            />
          </Card>
        ) : (
          <Card className="p-6">
            <DoctorForm
              defaultValues={isEdit ? { name: doctor.name, specialization: doctor.specialization, hospital: doctor.hospital, phone: doctor.phone, email: doctor.email } : undefined}
              onSubmit={onSubmit}
              submitLabel={isEdit ? "Save changes" : "Create doctor"}
              allowAddAnother={!isEdit}
              onCancel={() => router.push(isEdit ? ROUTES.doctor(id) : ROUTES.doctors)}
            />
          </Card>
        )}
      </div>
    </>
  );
}
