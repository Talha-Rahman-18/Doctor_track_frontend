import { z } from "zod";

/** Mirrors the server's phone policy: separators are ignored, 8-15 digits, optional leading "+". */
export const phoneSchema = z
  .string()
  .trim()
  .min(1, "Phone is required")
  .refine((value) => /^\+?\d{8,15}$/.test(value.replace(/[\s\-().]/g, "")), "Enter a valid phone number (8-15 digits, optional leading +)");

export const requiredText = (label, { min = 1, max = 100 } = {}) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .min(min, `${label} must be at least ${min} characters`)
    .max(max, `${label} must be at most ${max} characters`);

export const objectIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, "Select a doctor");
