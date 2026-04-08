import { describe, expect, it } from "vitest";
import { buildClinicalAssessment, classifyBmi } from "@/lib/clinical-analysis";

describe("classifyBmi", () => {
  it("classifies BMI ranges", () => {
    expect(classifyBmi(17.8)).toBe("Underweight");
    expect(classifyBmi(22.1)).toBe("Normal");
    expect(classifyBmi(27.2)).toBe("Overweight");
    expect(classifyBmi(31.9)).toBe("Obese");
  });
});

describe("buildClinicalAssessment", () => {
  it("flags emergency keyword triage", () => {
    const result = buildClinicalAssessment({
      name: "Test User",
      age: 40,
      gender: "male",
      height: 175,
      weight: 80,
      reason: "Severe chest pain",
      symptoms: "I have chest pain with breathing difficulty",
      symptomDurationDays: 1,
      heartRate: 122,
      bloodOxygen: 89,
      temperature: 101.2,
      history: {
        existingConditions: ["hypertension"],
        medications: ["amlodipine"],
        allergies: [],
        smoking: "former",
        alcohol: "occasional",
        familyHistory: "Family history of coronary artery disease",
      },
    });

    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.recommendations.some((item) => item.title.includes("Emergency"))).toBe(true);
    expect(result.overallConfidence).toBeGreaterThan(70);
  });
});
