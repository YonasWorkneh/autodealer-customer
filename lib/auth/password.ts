import { getCredentials } from "../credential";
import { API_BASE_URL } from "../config";
import { getBackendErrorMessage } from "../apiError";

export interface ChangePasswordParams {
  new_password?: string;
  confirm_password?: string;
}

export const changePassword = async (data: ChangePasswordParams) => {
  const credential = await getCredentials();
  const { access } = credential;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/password/change/`, {
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
      const errData = await res.json().catch(() => ({})) as Record<string, unknown>;
      throw new Error(getBackendErrorMessage(errData, "Failed to change password. Please check your credentials."));
    }

    return await res.json();
  } catch (err: any) {
    throw err;
  }
};
