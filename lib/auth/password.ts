import { getCredentials } from "../credential";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ChangePasswordParams {
  new_password?: string;
  confirm_password?: string;
}

export const changePassword = async (data: ChangePasswordParams) => {
  const credential = await getCredentials();
  const { access } = credential;

  try {
    const res = await fetch(`${API_URL}/auth/password/change/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
      },
      body: JSON.stringify({
        new_password1: data.new_password,
        new_password2: data.confirm_password,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const message =
        errData?.old_password?.[0] ||
        errData?.new_password?.[0] ||
        errData?.non_field_errors?.[0] ||
        errData?.detail ||
        "Failed to change password. Please check your credentials.";
      throw new Error(message);
    }

    return await res.json();
  } catch (err: any) {
    throw err;
  }
};
