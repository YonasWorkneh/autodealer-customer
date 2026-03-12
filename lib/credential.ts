"use server";
import { jwtDecode } from "jwt-decode";

import { cookies } from "next/headers";
import { AUTH_BASE_URL } from "./config";

export const getCredentials = async () => {
  const cookieStore = await cookies();
  const access = cookieStore.get("access")?.value;
  const refresh = cookieStore.get("refresh")?.value;
  const isExpired = await isTokenExpired(access);
  if (isExpired) {
    const data = await refreshToken(refresh);
    return { ...data };
  }
  return { access, refresh };
};

const refreshToken = async (refresh: string | undefined) => {
  if (refresh === undefined) return;
  const res = await fetch(`${AUTH_BASE_URL}/auth/token/refresh/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh }),
  });
  const data = await res.json();
  return data;
};

export async function isTokenExpired(token: string | undefined) {
  if (!token) return true;
  try {
    const { exp } = jwtDecode(token);
    if (!exp) return false;
    return Date.now() >= exp * 1000;
  } catch (e) {
    return true;
  }
}
