import { User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { clearServerSession, createServerSession } from "@/lib/auth-session-client";

export async function syncSessionForUser(user: User): Promise<void> {
  await createServerSession(user);
}

export async function clearAuthSession(): Promise<void> {
  await clearServerSession();
}

export async function signOutUser(): Promise<void> {
  await auth.signOut();
  await clearServerSession();
}
