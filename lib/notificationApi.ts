import { NotificationResponse } from "@/app/types/notification";
import { getCredentials } from "./credential";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getNotifications = async () => {
  try {
    const credential = await getCredentials();
    const { access } = credential;

    const res = await fetch(`${API_URL}/notifications/`, {
      headers: {
        Authorization: `Bearer ${access}`,
      },
    });
    console.log("notification response", res);
    if (!res.ok) throw new Error("Something went wrong");
    const notifications: NotificationResponse = await res.json();
    return notifications;
  } catch (err: any) {
    console.log("notification error", err);
    throw err;
  }
};

export const markAsRead = async (id: number) => {
  try {
    const credential = await getCredentials();
    const { access } = credential;

    const res = await fetch(`${API_URL}/notifications/${id}/read/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access}`,
      },
    });
    if (!res.ok) throw new Error("Something went wrong");
    return await res.json();
  } catch (err: any) {
    throw err;
  }
};
