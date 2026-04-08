"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onIdTokenChanged, User } from "firebase/auth";
import { auth, createUserProfile } from "@/lib/firebase";
import { clearAuthSession, syncSessionForUser } from "@/lib/auth-client";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        // Ensure user document exists in Firestore
        await createUserProfile(user);

        try {
          await syncSessionForUser(user);
        } catch (error) {
          console.error("Failed to synchronize secure session", error);
        }

        setUser(user);
      } else {
        setUser(null);
        await clearAuthSession();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
        {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
