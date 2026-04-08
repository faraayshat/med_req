import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { SESSION_COOKIE_MAX_AGE_SECONDS, SESSION_COOKIE_NAME } from "@/lib/session-constants";
import { isTrustedSameOrigin, secureApiHeaders, secureJson } from "@/lib/request-security";

type SessionBody = {
  idToken?: string;
};

export async function POST(request: NextRequest) {
  if (!isTrustedSameOrigin(request)) {
    return secureJson({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as SessionBody;
    const idToken = body.idToken;

    if (!idToken || typeof idToken !== "string") {
      return secureJson({ error: "Missing idToken" }, { status: 400 });
    }

    // Verify token first, then mint a server-managed Firebase session cookie.
    await adminAuth.verifyIdToken(idToken);
    const expiresIn = SESSION_COOKIE_MAX_AGE_SECONDS * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const response = secureJson({ success: true });
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionCookie,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
    });

    return response;
  } catch {
    return secureJson({ error: "Unable to create session" }, { status: 401 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isTrustedSameOrigin(request)) {
    return secureJson({ error: "Forbidden" }, { status: 403 });
  }

  const response = NextResponse.json({ success: true }, { headers: secureApiHeaders() });
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}