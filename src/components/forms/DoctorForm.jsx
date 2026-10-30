"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { applyServerErrors } from "../../lib/forms.js";
import { doctorDefaults, doctorFields, doctorSchema } from "../../schemas/doctor.schema.js";
import FormAlert from "../feedback/FormAlert.jsx";
import Button from "../ui/Button.jsx";
import { TextField } from "./FormFields.jsx";

/**
 * Create/edit form. `onSubmit(values, { addAnother })` must return a promise; if it rejects with a
 * normalised API error, field errors are shown beside inputs and the entered values are kept.
 */
export default function DoctorForm({ defaultValues = doctorDefaults, onSubmit, submitLabel = "Save doctor", onCancel, allowAddAnother = false }) {
  const addAnother = useRef(false);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(doctorSchema), defaultValues, mode: "onBlur", shouldFocusError: true });

  const submit = async (values) => {
    clearErrors("root.server");
    const wantsAnother = addAnother.current;
    addAnother.current = false;
    try {
      await onSubmit(values, { addAnother: wantsAnother });
      if (wantsAnother) reset(doctorDefaults);
    } catch (error) {
      applyServerErrors(error, setError, doctorFields);
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-5">
      <FormAlert message={errors.root?.server?.message} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Full name" required autoComplete="off" error={errors.name?.message} {...register("name")} />
        <TextField label="Specialization" required error={errors.specialization?.message} {...register("specialization")} />
        <TextField label="Hospital" required className="sm:col-span-2" error={errors.hospital?.message} {...register("hospital")} />
        <TextField label="Phone" type="tel" required hint="Digits with an optional leading +, e.g. +8801712345678" error={errors.phone?.message} {...register("phone")} />
        <TextField label="Email" type="email" required autoComplete="off" error={errors.email?.message} {...register("email")} />
      </div>
      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        )}
        {allowAddAnother && (
          <Button variant="secondary" type="submit" disabled={isSubmitting} onClick={() => { addAnother.current = true; }}>
            Save and add another
          </Button>
        )}
        <Button type="submit" loading={isSubmitting}>{submitLabel}</Button>
      </div>
    </form>
  );
}
