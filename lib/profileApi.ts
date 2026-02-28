import { UserProfile } from "@/app/types/Profile";
import { getCredentials } from "./credential";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getProfile = async () => {
  try {
    const credential = await getCredentials();
    const { access, refresh } = credential;

    const res = await fetch(`${API_URL}/users/profiles/me`, {
      headers: {
        Authorization: `Bearer ${access}`,
      },
    });
    console.log("profile fetchres", res);
    if (!res.ok) throw new Error("Something went wrong");
    const profile: UserProfile = await res.json();
    return profile;
  } catch (err: any) {
    // console.error(err.message);
    console.log("profile fetch error", err);
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

    const res = await fetch(`${API_URL}/buyers/upgrades/${endpoint}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Something went wrong");
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
    const res = await fetch(`${API_URL}/users/profiles/${id}`, {
      headers: {
        Authorization: `Bearer ${credential.access}`,
      },
      method: "PATCH",
      body: profile,
    });
    if (!res.ok) throw new Error(`Error updating profile`);
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

    const res = await fetch(`${API_URL}/users/profiles/${id}`, {
      headers: {
        Authorization: `Bearer ${access}`,
      },
    });
    if (!res.ok) throw new Error("Something went wrong");
    const profile: UserProfile = await res.json();
    return profile;
  } catch (err: any) {
    throw err;
  }
};
