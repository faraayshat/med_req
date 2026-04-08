import { z } from "zod";

const optionalNumber = (min: number, max: number) =>
  z
    .union([z.string(), z.number()])
    .optional()
    .transform((value) => {
      if (value === undefined || value === null || value === "") {
        return undefined;
      }
      const parsed = typeof value === "number" ? value : Number(value);
      return Number.isFinite(parsed) ? parsed : Number.NaN;
    })
    .refine((value) => value === undefined || !Number.isNaN(value), "Must be a number")
    .refine((value) => value === undefined || (value >= min && value <= max), `Must be between ${min} and ${max}`);

const requiredNumber = (min: number, max: number) =>
  z
    .union([z.string(), z.number()])
    .transform((value) => {
      const parsed = typeof value === "number" ? value : Number(value);
      return Number.isFinite(parsed) ? parsed : Number.NaN;
    })
    .refine((value) => !Number.isNaN(value), "Must be a number")
    .refine((value) => value >= min && value <= max, `Must be between ${min} and ${max}`);

const trimmed = (min: number, max: number) =>
  z
    .string()
    .transform((v) => v.trim().replace(/\s+/g, " "))
    .refine((v) => v.length >= min, `Must be at least ${min} characters`)
    .refine((v) => v.length <= max, `Must be at most ${max} characters`);

const stringList = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((value) => {
    if (!value) return [] as string[];
    if (Array.isArray(value)) {
      return value.map((item) => item.trim()).filter(Boolean).slice(0, 20);
    }
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 20);
  });

export const analyzeFormSchema = z.object({
  name: trimmed(2, 120),
  age: requiredNumber(1, 120),
  gender: z.enum(["male", "female", "other"]),
  height: requiredNumber(50, 272),
  weight: requiredNumber(2, 635),
  reason: trimmed(5, 300),
  symptoms: trimmed(10, 2000).refine((v) => v.length <= 1200, "Symptoms must be 1200 characters or less"),
  symptomDurationDays: optionalNumber(0, 3650),
  heartRate: optionalNumber(30, 220),
  bloodOxygen: optionalNumber(50, 100),
  temperature: optionalNumber(86, 113),
  history: z
    .object({
      existingConditions: stringList,
      medications: stringList,
      allergies: stringList,
      smoking: z.enum(["never", "former", "current", "unknown"]).default("unknown"),
      alcohol: z.enum(["none", "occasional", "regular", "unknown"]).default("unknown"),
      familyHistory: trimmed(0, 1000).optional().transform((v) => (v ? v : "")),
    })
    .default({
      existingConditions: [],
      medications: [],
      allergies: [],
      smoking: "unknown",
      alcohol: "unknown",
      familyHistory: "",
    }),
});

export type AnalyzeFormInput = z.input<typeof analyzeFormSchema>;
export type AnalyzeFormData = z.output<typeof analyzeFormSchema>;

export function formatZodIssues(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.join(".") || "body";
    return `${path}: ${issue.message}`;
  });
}
