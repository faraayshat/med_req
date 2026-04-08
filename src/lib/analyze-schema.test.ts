import { describe, expect, it } from "vitest";
import { analyzeFormSchema } from "@/lib/analyze-schema";

describe("analyzeFormSchema", () => {
  it("accepts valid payload and normalizes values", () => {
    const parsed = analyzeFormSchema.parse({
      formData: undefined,
      name: "  Jane Doe  ",
      age: "34",
      gender: "female",
      height: "165",
      weight: "64",
      reason: " Persistent headache ",
      symptoms: "Headache and mild nausea for two days",
      symptomDurationDays: "2",
      heartRate: "79",
      bloodOxygen: "98",
      temperature: "98.6",
      history: {
        existingConditions: "migraine",
        medications: "ibuprofen",
        allergies: "none",
        smoking: "never",
        alcohol: "none",
        familyHistory: "none",
      },
    });

    expect(parsed.name).toBe("Jane Doe");
    expect(parsed.age).toBe(34);
    expect(parsed.height).toBe(165);
    expect(parsed.history.existingConditions).toEqual(["migraine"]);
  });

  it("rejects out-of-range SpO2", () => {
    const parsed = analyzeFormSchema.safeParse({
      name: "John Smith",
      age: 28,
      gender: "male",
      height: 180,
      weight: 80,
      reason: "Routine check",
      symptoms: "No major symptoms reported",
      bloodOxygen: 120,
    });

    expect(parsed.success).toBe(false);
  });
});
