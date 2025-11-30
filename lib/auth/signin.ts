"use server";
import { cookies } from "next/headers";

interface SignInParams {
  email: string;
  password: string;
}

// const refresh =

export const signin = async (data: SignInParams) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Something went wrong");
    const user = await res.json();
    if (!user.access)
      throw new Error("Error trying to log you in. Please try again.");
    const cookiess = await cookies();
    cookiess.set({
      name: "access",
      value: user.access,
      httpOnly: true, // 🔑 makes it HttpOnly
      secure: true, // only over HTTPS
      sameSite: "strict", // prevent CSRF
      path: "/", // send on all requests
      maxAge: 60 * 15, // 15 minutes
    });
    cookiess.set({
      name: "refresh",
      value: user.refresh,
      httpOnly: true, // 🔑 makes it HttpOnly
      secure: true, // only over HTTPS
      sameSite: "strict", // prevent CSRF
      path: "/", // send on all requests
      maxAge: 60 * 60 * 24 * 7, // 7d
    });
    cookiess.set({
      name: "pk",
      value: user.pk,
      httpOnly: true, // 🔑 makes it HttpOnly
      secure: true, // only over HTTPS
      sameSite: "strict", // prevent CSRF
      path: "/", // send on all requests
      maxAge: 60 * 60 * 24 * 7, // 7d
    });

    return user;
  } catch (err: any) {
    console.error(err.message);
    throw err;
  }
};

export const getUser = async () => {
  const cookiess = await cookies();
  const refresh = cookiess.get("refresh")?.value;
  try {
    if (!refresh) throw new Error("User is not logged in.");
    const response = await fetch(
      `${process.env.BASE_API_URL}/auth/token/refresh/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      }
    );
    if (!response.ok) throw new Error("Error fetching refresh token");
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
    const res = await fetch(`${process.env.BASE_API_URL}/auth/user/`, {
      headers: {
        Authorization: `Bearer ${access}`,
      },
    });
    if (!res.ok) throw new Error("Something went wrong");
    const user = await res.json();
    if (!user.email) throw new Error(`refresh ${refresh}`);
    return user;
  } catch (err: any) {
    throw err;
  }
};

export const forgotPassword = async (email: string) => {
  try {
    const cookie = await cookies();
    const access = cookie.get("access");
    const refresh = cookie.get("refresh");
    return { access, refresh };
  } catch (err: any) {
    console.error(err.message);
    throw err;
  }
};

export const getUserRole = async () => {
   const cookiess = await cookies();
   const refresh = cookiess.get("refresh")?.value;
   try {
     if (!refresh) throw new Error("User is not logged in.");
     const response = await fetch(
       `${process.env.BASE_API_URL}/auth/token/refresh/`,
       {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ refresh }),
       }
     );
     if (!response.ok) throw new Error("Error fetching refresh token");
     const ref = await response.json();
     const access = ref.access;
     const newRefresh = ref.refresh;
     if (!ref.access) throw new Error(`${JSON.stringify(ref)}`);
     const res = await fetch(`${process.env.BASE_API_URL}/users/profiles/me/`, {
       headers: {
         Authorization: `Bearer ${access}`,
       },
     });
     if (!res.ok) throw new Error("Something went wrong");
     const user = await res.json();
     if (!user.email) throw new Error(`refresh ${refresh}`);
     return user;
   } catch (err: any) {
     throw err;
   }
};
