import { NotificationResponse } from "@/app/types/notification";
import { getCredentials } from "./credential";
import { API_BASE_URL } from "./config";
import { getBackendErrorMessage } from "./apiError";

export const getNotifications = async () => {
  try {
    const credential = await getCredentials();
    const { access } = credential;

    const res = await fetch(`${API_BASE_URL}/notifications/`, {
      headers: {
        Authorization: `Bearer ${access}`,
      },
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({})) as Record<string, unknown>;
      throw new Error(getBackendErrorMessage(errData, "Failed to load notifications."));
    }
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

    const res = await fetch(`${API_BASE_URL}/notifications/${id}/read/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access}`,
      },
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({})) as Record<string, unknown>;
      throw new Error(getBackendErrorMessage(errData, "Failed to mark notification as read."));
    }
    return await res.json();
  } catch (err: any) {
    throw err;
  }
};
