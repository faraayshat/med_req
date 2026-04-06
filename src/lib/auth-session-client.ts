import { User } from "firebase/auth";

export async function createServerSession(user: User) {
  const idToken = await user.getIdToken();
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    throw new Error("Failed to establish secure session");
  }
}

export async function clearServerSession() {
  await fetch("/api/auth/session", {
    method: "DELETE",
  });
}