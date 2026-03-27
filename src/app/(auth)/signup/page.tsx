"use client";

import { useState } from "react";
import { auth, db, googleProvider } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setCookie } from "cookies-next";
import { Heart, User, Mail, Lock, Phone, MapPin, Languages, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    address: ""
  });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAuthSuccess = async (user: any, extraData: any = {}) => {
    try {
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        fullName: extraData.fullName || user.displayName || "Patient",
        phone: extraData.phone || "",
        address: extraData.address || "",
        createdAt: new Date()
      }, { merge: true });

      setCookie("__session", user.uid, { maxAge: 60 * 60 * 24 * 7 });
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Firestore Error:", err);
      setError("Failed to create medical profile. Please try again.");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await handleAuthSuccess(user, { 
        fullName: formData.fullName, 
        phone: formData.phone, 
        address: formData.address 
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const { user } = await signInWithPopup(auth, googleProvider);
      await handleAuthSuccess(user);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const inputClasses = "hospital-input pl-12";
  const iconClasses = "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-hospital-300";

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-hospital-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl"
      >
        <div className="text-center mb-10">
          <div className="inline-flex p-3 bg-white rounded-2xl shadow-soft mb-4">
             <Heart className="w-8 h-8 text-hospital-600 fill-hospital-50" />
          </div>
          <h1 className="hospital-heading mb-2">Patient Onboarding</h1>
          <p className="text-slate-500 font-medium">Complete your medical profile below</p>
        </div>

        <div className="hospital-card grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <form onSubmit={handleSignup} className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
              <div className="relative">
                <User className={iconClasses} />
                <input
                  type="text"
                  placeholder="John Doe"
                  className={inputClasses}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
              <div className="relative">
                <Mail className={iconClasses} />
                <input
                  type="email"
                  placeholder="john@hospital.com"
                  className={inputClasses}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Emergency Phone</label>
              <div className="relative">
                <Phone className={iconClasses} />
                <input
                  type="tel"
                  placeholder="+234..."
                  className={inputClasses}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
              <div className="relative">
                <Lock className={iconClasses} />
                <input
                  type="password"
                  placeholder="••••••••"
                  className={inputClasses}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Residential Address</label>
              <div className="relative">
                <MapPin className={iconClasses} />
                <input
                  type="text"
                  placeholder="Your full address"
                  className={inputClasses}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
            </div>

            {error && <div className="md:col-span-2 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">{error}</div>}

            <button type="submit" className="md:col-span-2 hospital-button-primary py-4 text-lg mt-4 group">
              Register Account
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="md:col-span-2 relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-hospital-100"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-slate-400 font-bold">Or use external identity</span></div>
          </div>

          <button onClick={handleGoogleSignup} className="md:col-span-2 w-full flex items-center justify-center gap-3 p-4 border-2 border-hospital-100 rounded-2xl font-bold text-slate-700 hover:bg-hospital-50 hover:border-hospital-200 transition-all">
            <ShieldCheck className="w-5 h-5 text-hospital-600" />
            Google Health ID
          </button>

          <p className="md:col-span-2 text-center mt-6 text-slate-500 font-medium">
            Member already?{" "}
            <Link href="/login" className="text-hospital-600 font-black hover:underline px-1">Login Securely</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
