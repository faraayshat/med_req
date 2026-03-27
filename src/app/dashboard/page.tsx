"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { deleteCookie } from "cookies-next";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchSubmissions = async () => {
        try {
          const q = query(
            collection(db, "health_data"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
          );
          const querySnapshot = await getDocs(q);
          const data = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setSubmissions(data);
        } catch (error) {
          console.error("Error fetching submissions:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchSubmissions();
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    deleteCookie("__session");
    router.push("/login");
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Welcome, {user?.email}</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        <div className="bg-white p-6 rounded shadow mb-8">
          <h2 className="text-xl font-semibold mb-4 text-black">Your Dashboard</h2>
          <div className="flex gap-4">
            <Link
              href="/dashboard/new"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Fill Health Form
            </Link>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Past Submissions</h2>
          <div className="grid gap-4">
            {submissions.length === 0 ? (
              <p className="text-gray-500 italic">No submissions found.</p>
            ) : (
              submissions.map((sub) => (
                <div key={sub.id} className="bg-white p-4 rounded shadow border-l-4 border-blue-500">
                  <div className="flex justify-between">
                    <span className="font-semibold">{sub.fullName}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(sub.createdAt.seconds * 1000).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Symptoms: {sub.symptoms}</p>
                    <p>BMI: {sub.bmi?.toFixed(2)}</p>
                  </div>
                  <Link
                    href={`/results/${sub.id}`}
                    className="mt-3 inline-block text-blue-600 text-sm hover:underline"
                  >
                    View Results →
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
