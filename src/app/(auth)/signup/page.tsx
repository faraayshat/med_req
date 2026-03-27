"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, Mail, Lock, UserPlus, AlertCircle, User, Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { doc, setDoc } from "firebase/firestore";
import { setCookie } from "cookies-next";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phoneNumber: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Store additional user details in Firestore
      await setDoc(doc(db, "users", user.uid), {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        createdAt: new Date().toISOString(),
      });

      setCookie("__session", user.uid, { maxAge: 60 * 60 * 24 * 7 });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // For Google sign-in, we might not have all details initially
      // but we ensure a user doc exists
      await setDoc(doc(db, "users", user.uid), {
        fullName: user.displayName || "Google User",
        email: user.email,
        createdAt: new Date().toISOString(),
      }, { merge: true });

      setCookie("__session", user.uid, { maxAge: 60 * 60 * 24 * 7 });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl border border-slate-100"
      >
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-blue-100 p-3 rounded-full mb-4">
            <Activity className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
          <p className="text-slate-500 text-sm mt-1">Join HealthMed to track your medical journey</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 rounded-xl py-2.5 text-slate-700 font-semibold hover:bg-slate-50 transition-all mb-6 active:scale-[0.98]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-semibold">Or with email</span></div>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                <input
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="pl-10 w-full border border-slate-200 rounded-xl py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                <input
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 000-0000"
                  className="pl-10 w-full border border-slate-200 rounded-xl py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Address (Optional)</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
              <input
                name="address"
                type="text"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="123 Health St, Medical City"
                className="pl-10 w-full border border-slate-200 rounded-xl py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@example.com"
                  className="pl-10 w-full border border-slate-200 rounded-xl py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="pl-10 w-full border border-slate-200 rounded-xl py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold rounded-xl py-3 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-70 mt-4"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Create Account
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
