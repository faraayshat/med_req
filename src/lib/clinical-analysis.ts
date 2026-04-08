import type { AnalyzeFormData } from "@/lib/analyze-schema";

export type Citation = {
  title: string;
  url: string;
  publisher: string;
};

export type Recommendation = {
  title: string;
  desc: string;
  medication: string;
  confidence: number;
  modelScore: number;
  ruleConfidence: number;
  citations: Citation[];
};

const TRUSTED_CITATIONS = {
  emergencyChestPain: {
    title: "Heart attack signs and symptoms",
    url: "https://www.cdc.gov/heartdisease/heart_attack.htm",
    publisher: "CDC",
  },
  breathingEmergency: {
    title: "Shortness of breath overview",
    url: "https://www.nhs.uk/conditions/shortness-of-breath/",
    publisher: "NHS",
  },
  bmi: {
    title: "Assessing Your Weight and Health Risk",
    url: "https://www.cdc.gov/healthy-weight-growth/assessing/",
    publisher: "CDC",
  },
  fever: {
    title: "Fever in adults",
    url: "https://www.mayoclinic.org/symptoms/fever/basics/definition/sym-20050997",
    publisher: "Mayo Clinic",
  },
  spo2: {
    title: "Pulse oximetry",
    url: "https://medlineplus.gov/lab-tests/pulse-oximetry/",
    publisher: "MedlinePlus",
  },
  heartRate: {
    title: "Target Heart Rates Chart",
    url: "https://www.heart.org/en/healthy-living/fitness/fitness-basics/target-heart-rates",
    publisher: "American Heart Association",
  },
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function keywordModelScore(text: string, keywords: string[]): number {
  const normalized = text.toLowerCase();
  const hits = keywords.reduce((count, keyword) => (normalized.includes(keyword) ? count + 1 : count), 0);
  return clamp(0.45 + hits * 0.12, 0, 0.98);
}

function buildRecommendation(args: {
  title: string;
  desc: string;
  medication: string;
  modelScore: number;
  ruleConfidence: number;
  citations: Citation[];
}): Recommendation {
  const confidence = Number(((args.modelScore * 0.45 + args.ruleConfidence * 0.55) * 100).toFixed(1));
  return {
    title: args.title,
    desc: args.desc,
    medication: args.medication,
    confidence,
    modelScore: Number((args.modelScore * 100).toFixed(1)),
    ruleConfidence: Number((args.ruleConfidence * 100).toFixed(1)),
    citations: args.citations,
  };
}

export function classifyBmi(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

export function buildClinicalAssessment(formData: AnalyzeFormData) {
  const heightM = formData.height / 100;
  const bmi = formData.weight / (heightM * heightM);
  const bmiRounded = Number(bmi.toFixed(1));
  const bmiStatus = classifyBmi(bmiRounded);

  const symptomText = `${formData.reason} ${formData.symptoms}`.toLowerCase();
  const recommendations: Recommendation[] = [];

  const emergencyKeywords = ["chest pain", "difficulty breathing", "stroke", "fainting", "severe bleeding"];
  if (emergencyKeywords.some((word) => symptomText.includes(word))) {
    recommendations.push(
      buildRecommendation({
        title: "Possible Emergency Red Flag",
        desc: "Your symptom profile includes high-risk emergency keywords that require immediate in-person evaluation.",
        medication: "Call local emergency services or go to the nearest emergency department immediately.",
        modelScore: keywordModelScore(symptomText, emergencyKeywords),
        ruleConfidence: 0.98,
        citations: [TRUSTED_CITATIONS.emergencyChestPain, TRUSTED_CITATIONS.breathingEmergency],
      })
    );
  }

  if (bmiRounded >= 25) {
    recommendations.push(
      buildRecommendation({
        title: "Elevated BMI Risk",
        desc: `BMI ${bmiRounded} (${bmiStatus}) is associated with increased cardiometabolic risk in population-level evidence.`,
        medication: "Discuss nutrition, activity, and longitudinal weight goals with a licensed clinician.",
        modelScore: 0.78,
        ruleConfidence: 0.9,
        citations: [TRUSTED_CITATIONS.bmi],
      })
    );
  }

  if (formData.temperature !== undefined && formData.temperature >= 100.4) {
    recommendations.push(
      buildRecommendation({
        title: "Fever Pattern Detected",
        desc: `Recorded temperature (${formData.temperature} F) falls in febrile range and should be correlated with infection symptoms.`,
        medication: "Hydration, rest, and clinician follow-up if persistent or worsening symptoms.",
        modelScore: keywordModelScore(symptomText, ["fever", "chills", "infection", "body ache"]),
        ruleConfidence: 0.86,
        citations: [TRUSTED_CITATIONS.fever],
      })
    );
  }

  if (formData.bloodOxygen !== undefined && formData.bloodOxygen < 92) {
    recommendations.push(
      buildRecommendation({
        title: "Low Oxygen Saturation",
        desc: `SpO2 ${formData.bloodOxygen}% may indicate hypoxemia risk and should be rechecked and clinically evaluated.`,
        medication: "Seek urgent clinical review, especially if accompanied by breathlessness or chest symptoms.",
        modelScore: keywordModelScore(symptomText, ["shortness of breath", "breathing", "fatigue"]),
        ruleConfidence: 0.93,
        citations: [TRUSTED_CITATIONS.spo2],
      })
    );
  }

  if (formData.heartRate !== undefined && (formData.heartRate < 50 || formData.heartRate > 120)) {
    recommendations.push(
      buildRecommendation({
        title: "Heart Rate Outlier",
        desc: `Heart rate of ${formData.heartRate} BPM is outside common resting range for adults and merits clinical correlation.`,
        medication: "Repeat vitals at rest and discuss with a clinician if persistent or symptomatic.",
        modelScore: keywordModelScore(symptomText, ["palpitation", "dizziness", "fatigue", "chest"]),
        ruleConfidence: 0.84,
        citations: [TRUSTED_CITATIONS.heartRate],
      })
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      buildRecommendation({
        title: "No Immediate High-Risk Signal",
        desc: "Current symptoms and vitals do not match high-risk rule thresholds, but clinical follow-up is still recommended.",
        medication: "Continue monitoring symptoms and seek medical advice if new or worsening signs appear.",
        modelScore: 0.67,
        ruleConfidence: 0.7,
        citations: [TRUSTED_CITATIONS.bmi],
      })
    );
  }

  const overallConfidence = Number(
    (recommendations.reduce((sum, item) => sum + item.confidence, 0) / recommendations.length).toFixed(1)
  );

  return {
    bmi: bmiRounded,
    bmiStatus,
    recommendations,
    overallConfidence,
  };
}
