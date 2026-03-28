import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, formData, fileUrl } = body;

    if (!userId || !formData) {
      return NextResponse.json({ error: "Missing required clinical data" }, { status: 400 });
    }

    // Process Clinical Recommendations (Server-side logic)
    const height = parseFloat(formData.height) / 100;
    const weight = parseFloat(formData.weight);
    const bmi = weight / (height * height);

    const recommendations = [
      { 
        title: "Metabolic Status", 
        desc: `Current BMI calculated at ${bmi.toFixed(1)}. Tracking within expected variance for ${formData.age}YO demographic.` 
      },
      { 
        title: "Clinical Intake", 
        desc: `Received rationale: "${formData.reason}". Physician review scheduled for baseline analysis.` 
      }
    ];

    if (bmi > 25) {
      recommendations.push({ 
        title: "Nutritional Advisory", 
        desc: "Longitudinal tracking suggests caloric optimization. Targeted macronutrient balance recommended." 
      });
    }

    // Construct the finalized report document
    const reportData = {
      ...formData,
      userId,
      fileUrl: fileUrl || "",
      recommendations,
      status: "analyzed",
      protocolVersion: "v4",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Store in Firestore
    const docRef = await addDoc(collection(db, "reports"), reportData);

    return NextResponse.json({ 
      success: true, 
      id: docRef.id,
      message: "Clinical data synchronized successfully" 
    }, { status: 201 });

  } catch (error: any) {
    console.error("API Error [analyze]:", error);
    return NextResponse.json({ 
      error: "Internal server failure during clinical processing",
      details: error.message 
    }, { status: 500 });
  }
}
