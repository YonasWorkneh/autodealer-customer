"use server";
import { API_BASE_URL } from "../config";
interface SignUpParams {
  first_name: string;
  last_name: string;
  email: string;
  password1: string;
  password2: string;
}

export const signup = async (data: SignUpParams) => {
  console.log("api base url", API_BASE_URL);
  try {
    const res = await fetch(`${API_BASE_URL}/auth/registration/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    console.log("signup res", res);
    if (!res.ok) throw new Error("Something went wrong");
    const user = await res.json();

    return user;
  } catch (err: any) {
    console.error(err.message);
    throw err;
  }
};
