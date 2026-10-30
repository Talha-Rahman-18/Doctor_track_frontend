"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { GENDER_OPTIONS } from "../../lib/constants.js";
import { applyServerErrors } from "../../lib/forms.js";
import { patientDefaults, patientFields, patientSchema, patientWithDoctorSchema } from "../../schemas/patient.schema.js";
import FormAlert from "../feedback/FormAlert.jsx";
import Button from "../ui/Button.jsx";
import DoctorCombobox from "./DoctorCombobox.jsx";
import { SelectField, TextField, TextareaField } from "./FormFields.jsx";

/**
 * Create/edit form for patients. When `withDoctorField` is false the doctor is fixed by context
 * (e.g. adding a patient from a doctor's page) and is not part of the form values.
 */
export default function PatientForm({ defaultValues, withDoctorField = false, onSubmit, submitLabel = "Save patient", onCancel }) {
  const {
    register,
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(withDoctorField ? patientWithDoctorSchema : patientSchema),
    defaultValues: { ...patientDefaults, ...(withDoctorField ? { doctor: "" } : {}), ...defaultValues },
    mode: "onBlur",
    shouldFocusError: true,
  });

  const submit = async (values) => {
    clearErrors("root.server");
    try {
      await onSubmit(values);
    } catch (error) {
      applyServerErrors(error, setError, patientFields);
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-5">
      <FormAlert message={errors.root?.server?.message} />
      <div className="grid gap-5 sm:grid-cols-2">
        {withDoctorField && (
          <div className="sm:col-span-2">
            <Controller
              name="doctor"
              control={control}
              render={({ field }) => (
                <DoctorCombobox required value={field.value} onChange={field.onChange} error={errors.doctor?.message} />
              )}
            />
          </div>
        )}
        <TextField label="Full name" required autoComplete="off" className="sm:col-span-2" error={errors.name?.message} {...register("name")} />
        <TextField label="Age" type="number" inputMode="numeric" min={0} max={120} required error={errors.age?.message} {...register("age", { valueAsNumber: true })} />
        <SelectField label="Gender" required placeholder="Select gender" options={GENDER_OPTIONS} error={errors.gender?.message} {...register("gender")} />
        <TextField label="Phone" type="tel" required error={errors.phone?.message} {...register("phone")} />
        <TextField label="Condition" required hint="e.g. Hypertension" error={errors.condition?.message} {...register("condition")} />
        <div className="sm:col-span-2">
          <TextareaField label="Notes" hint="Optional. Keep clinical notes brief. Do not enter real patient data in this demo." error={errors.notes?.message} {...register("notes")} />
        </div>
      </div>
      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        {onCancel && <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>}
        <Button type="submit" loading={isSubmitting}>{submitLabel}</Button>
      </div>
    </form>
  );
}
