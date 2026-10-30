import { z } from "zod";
import { phoneSchema, requiredText } from "./common.schema.js";

export const doctorSchema = z.object({
  name: requiredText("Name", { min: 2, max: 100 }),
  specialization: requiredText("Specialization", { max: 100 }),
  hospital: requiredText("Hospital", { max: 150 }),
  phone: phoneSchema,
  email: z.string().trim().min(1, "Email is required").max(254).pipe(z.email("Enter a valid email address")),
});

export const doctorDefaults = { name: "", specialization: "", hospital: "", phone: "", email: "" };
export const doctorFields = Object.keys(doctorDefaults);
