import { UserProfile } from "@/app/types/Profile";
import { getCredentials } from "./credential";
import { API_BASE_URL } from "./config";
import { getBackendErrorMessage } from "./apiError";

export const getProfile = async () => {
  try {
    const credential = await getCredentials();
    const { access, refresh } = credential;

    const res = await fetch(`${API_BASE_URL}/users/profiles/me`, {
      headers: {
        Authorization: `Bearer ${access}`,
      },
    });
    
    if (!res.ok) {
      const errData = await res.json().catch(() => ({})) as Record<string, unknown>;
      throw new Error(getBackendErrorMessage(errData, "Failed to load profile."));
    }
    const profile: UserProfile = await res.json();
    return profile;
  } catch (err: any) {
    // console.error(err.message);
   
    throw err;
  }
};

export const upgradeProfile = async (obj: any) => {
  const { data, to } = obj;
  const endpointMap: Record<string, string> = {
    dealer: "upgrade_to_dealer",
    broker: "upgrade_to_broker",
  };

  const endpoint = endpointMap[to];
  try {
    const credential = await getCredentials();
    const { access } = credential;

    const res = await fetch(`${API_BASE_URL}/buyers/upgrades/${endpoint}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({})) as Record<string, unknown>;
      throw new Error(getBackendErrorMessage(errData, "Upgrade failed. Please try again."));
    }
    // console.log(res);
    const upgraded = await res.json();
    // console.log("upgraded", upgraded);
    return upgraded;
  } catch (err: any) {
    // console.error(err.message);
    throw err;
  }
};

export const updateProfile = async (data: any) => {
  const credential = await getCredentials();
  const { profile, id } = data;
  try {
    const res = await fetch(`${API_BASE_URL}/users/profiles/${id}`, {
      headers: {
        Authorization: `Bearer ${credential.access}`,
      },
      method: "PATCH",
      body: profile,
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({})) as Record<string, unknown>;
      throw new Error(getBackendErrorMessage(errData, "Error updating profile."));
    }
    const updatedProfile = await res.json();
    return updatedProfile;
  } catch (err) {
    // console.error(err.message)
    throw err;
  }
};

export const getProfileById = async (id: number) => {
  try {
    const credential = await getCredentials();
    const { access } = credential;

    const res = await fetch(`${API_BASE_URL}/users/profiles/${id}`, {
      headers: {
        Authorization: `Bearer ${access}`,
      },
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({})) as Record<string, unknown>;
      throw new Error(getBackendErrorMessage(errData, "Failed to load profile."));
    }
    const profile: UserProfile = await res.json();
    return profile;
  } catch (err: any) {
    throw err;
  }
};
