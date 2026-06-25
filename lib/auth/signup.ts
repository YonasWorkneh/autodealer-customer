"use server";
import { cookies } from "next/headers";
import { API_BASE_URL } from "../config";
import { getBackendErrorMessage } from "../apiError";
interface SignUpParams {
  first_name?: string;
  last_name?: string;
  email: string;
  password1: string;
  password2: string;
  contact: string;
}

export const signup = async (data: SignUpParams) => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/registration/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({})) as Record<string, unknown>;
      throw new Error(getBackendErrorMessage(errData, "Registration failed. Please try again."));
    }
    const user = await res.json();

    const cookiess = await cookies();
    if (user.access) {
      cookiess.set({ name: "access", value: user.access, httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 60 * 15 });
    }
    if (user.refresh) {
      cookiess.set({ name: "refresh", value: user.refresh, httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 60 * 60 * 24 * 7 });
    }
    if (user.pk) {
      cookiess.set({ name: "pk", value: String(user.pk), httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 60 * 60 * 24 * 7 });
    }

    return user;
  } catch (err: any) {
    console.error(err.message);
    throw err;
  }
};
