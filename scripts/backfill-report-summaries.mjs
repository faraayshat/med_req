import admin from "firebase-admin";

const adminConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(adminConfig),
  });
}

const db = admin.firestore();

function toMillis(value) {
  if (!value) return Date.now();
  if (typeof value.toMillis === "function") return value.toMillis();
  return Date.now();
}

function buildSummary(reportId, report) {
  return {
    reportId,
    userId: report.userId || null,
    name: report.name || "Unknown Patient",
    reason: report.reason || "General Assessment",
    status: report.status || "pending",
    bmiStatus: report.bmiStatus || null,
    overallConfidence: report.overallConfidence ?? null,
    createdAt: report.createdAt || admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: report.updatedAt || admin.firestore.FieldValue.serverTimestamp(),
  };
}

async function backfill() {
  const pageSize = 200;
  let totalScanned = 0;
  let totalWritten = 0;
  let cursor = null;

  while (true) {
    let query = db.collection("reports").orderBy(admin.firestore.FieldPath.documentId()).limit(pageSize);
    if (cursor) {
      query = query.startAfter(cursor);
    }

    const snapshot = await query.get();
    if (snapshot.empty) {
      break;
    }

    const writer = db.bulkWriter();

    for (const doc of snapshot.docs) {
      totalScanned += 1;
      const report = doc.data();

      if (!report.userId) {
        continue;
      }

      const summaryRef = db.collection("reportSummaries").doc(doc.id);
      writer.set(summaryRef, buildSummary(doc.id, report), { merge: true });
      totalWritten += 1;
    }

    await writer.close();

    cursor = snapshot.docs[snapshot.docs.length - 1];

    const oldest = snapshot.docs[0]?.data()?.createdAt;
    const newest = snapshot.docs[snapshot.docs.length - 1]?.data()?.createdAt;
    console.log(
      `Processed batch: scanned=${snapshot.docs.length}, totalScanned=${totalScanned}, totalWritten=${totalWritten}, ` +
      `window=${new Date(toMillis(oldest)).toISOString()}..${new Date(toMillis(newest)).toISOString()}`
    );

    if (snapshot.size < pageSize) {
      break;
    }
  }

  console.log(`Backfill complete. scanned=${totalScanned}, written=${totalWritten}`);
}

backfill()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Backfill failed:", error);
    process.exit(1);
  });
