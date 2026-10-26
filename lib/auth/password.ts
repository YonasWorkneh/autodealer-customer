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

export interface ConfirmPasswordResetParams {
  new_password1: string;
  new_password2: string;
  uid: string;
  token: string;
}

export const confirmPasswordReset = async (data: ConfirmPasswordResetParams) => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/password/reset/confirm/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        new_password1: data.new_password1,
        new_password2: data.new_password2,
        uid: data.uid,
        token: data.token,
      }),
    });

    if (!res.ok) {
      const errData = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      throw new Error(
        getBackendErrorMessage(
          errData,
          "Failed to reset password. The reset link may be invalid or expired."
        )
      );
    }

    return await res.json().catch(() => ({ success: true }));
  } catch (err: any) {
    throw err;
  }
};
