"use server";
import { cookies } from "next/headers";
import { API_BASE_URL, AUTH_BASE_URL } from "../config";
import { getBackendErrorMessage } from "../apiError";

interface SignInParams {
  email: string;
  password: string;
}

// const refresh =

export const signin = async (
  data: SignInParams,
): Promise<{ error: string } | Record<string, any>> => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errData = (await res.json().catch(() => ({}))) as Record<
        string,
        unknown
      >;
      return { error: getBackendErrorMessage(errData, "Invalid email or password.") };
    }
    const user = await res.json();
    if (!user.access) {
      return { error: "Error trying to log you in. Please try again." };
    }
    const cookiess = await cookies();
    cookiess.set({
      name: "access",
      value: user.access,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 15,
    });
    cookiess.set({
      name: "refresh",
      value: user.refresh,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    cookiess.set({
      name: "pk",
      value: user.pk,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return user;
  } catch (err: any) {
    console.error(err.message);
    return { error: "An unexpected error occurred. Please try again." };
  }
};

export const getUser = async () => {
  const cookiess = await cookies();
  const refresh = cookiess.get("refresh")?.value;
  try {
    if (!refresh) throw new Error("User is not logged in.");
    const response = await fetch(`${AUTH_BASE_URL}/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({})) as Record<string, unknown>;
      throw new Error(getBackendErrorMessage(errData, "Error fetching refresh token."));
    }
    const ref = await response.json();
    const access = ref.access;
    const newRefresh = ref.refresh;
    if (!ref.access) throw new Error(`${JSON.stringify(ref)}`);
    cookiess.set({
      name: "access",
      value: access,
      httpOnly: true, // 🔑 makes it HttpOnly
      secure: true, // only over HTTPS
      sameSite: "strict", // prevent CSRF
      path: "/", // send on all requests
      maxAge: 60 * 15, // 15 minutes
    });
    cookiess.set({
      name: "refresh",
      value: newRefresh,
      httpOnly: true, // 🔑 makes it HttpOnly
      secure: true, // only over HTTPS
      sameSite: "strict", // prevent CSRF
      path: "/", // send on all requests
      maxAge: 60 * 60 * 24 * 7, // 7d
    });
    const res = await fetch(`${AUTH_BASE_URL}/auth/user/`, {
      headers: {
        Authorization: `Bearer ${access}`,
      },
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({})) as Record<string, unknown>;
      throw new Error(getBackendErrorMessage(errData, "Failed to load user."));
    }
    const user = await res.json();
    if (!user.email) throw new Error(`refresh ${refresh}`);
    return user;
  } catch (err: any) {
    throw err;
  }
};

export const requestPasswordReset = async (email: string) => {
  const res = await fetch(
    `${API_BASE_URL}/auth/password/reset`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    }
  );

  if (!res.ok) {
    const errData = await res.json().catch(() => ({})) as Record<string, unknown>;
    throw new Error(getBackendErrorMessage(errData, "Something went wrong. Try again."));
  }

  return { success: true };
};

export const getUserRole = async () => {
   const cookiess = await cookies();
   const refresh = cookiess.get("refresh")?.value;
   try {
     if (!refresh) throw new Error("User is not logged in.");
    const response = await fetch(`${AUTH_BASE_URL}/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
     if (!response.ok) {
       const errData = await response.json().catch(() => ({})) as Record<string, unknown>;
       throw new Error(getBackendErrorMessage(errData, "Error fetching refresh token."));
     }
     const ref = await response.json();
     const access = ref.access;
     const newRefresh = ref.refresh;
     if (!ref.access) throw new Error(`${JSON.stringify(ref)}`);
     const res = await fetch(`${AUTH_BASE_URL}/users/profiles/me/`, {
       headers: {
         Authorization: `Bearer ${access}`,
       },
     });
     if (!res.ok) {
       const errData = await res.json().catch(() => ({})) as Record<string, unknown>;
       throw new Error(getBackendErrorMessage(errData, "Failed to load profile."));
     }
     const user = await res.json();
     if (!user.email) throw new Error(`refresh ${refresh}`);
     return user;
   } catch (err: any) {
     throw err;
   }
};
