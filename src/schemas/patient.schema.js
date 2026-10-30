import { z } from "zod";
import { objectIdSchema, phoneSchema, requiredText } from "./common.schema.js";

const patientShape = {
  name: requiredText("Name", { min: 2, max: 100 }),
  // The age input uses valueAsNumber, so an empty box arrives as NaN.
  age: z
    .number({ error: "Age is required" })
    .refine((value) => !Number.isNaN(value), "Age is required")
    .int("Age must be a whole number")
    .min(0, "Age must be 0 or greater")
    .max(120, "Age must be 120 or less"),
  gender: z.enum(["male", "female", "other"], { error: "Select a gender" }),
  phone: phoneSchema,
  condition: requiredText("Condition", { max: 100 }),
  notes: z.string().trim().max(1000, "Notes must be at most 1000 characters"),
};

/** Used when the doctor is fixed by context (e.g. adding from a doctor's page). */
export const patientSchema = z.object(patientShape);

/** Used on the Patients page, where the doctor must be chosen. */
export const patientWithDoctorSchema = z.object({ ...patientShape, doctor: objectIdSchema });

export const patientDefaults = { name: "", age: NaN, gender: "", phone: "", condition: "", notes: "" };
export const patientFields = [...Object.keys(patientDefaults), "doctor"];
