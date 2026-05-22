import { NotificationResponse } from "@/app/types/notification";
import { getCredentials } from "./credential";
import { API_BASE_URL } from "./config";
import { getBackendErrorMessage } from "./apiError";

export const getUnreadNotificationCount = async (): Promise<number> => {
  const credential = await getCredentials();
  const res = await fetch(`${API_BASE_URL}/notifications/unread_count/`, {
    headers: { Authorization: `Bearer ${credential.access}` },
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({})) as Record<string, unknown>;
    throw new Error(getBackendErrorMessage(errData, "Failed to fetch unread count."));
  }
  const data: { unread: number } = await res.json();
  return data.unread;
};

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
  const credential = await getCredentials();
  const res = await fetch(`${API_BASE_URL}/notifications/mark_read/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${credential.access}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({})) as Record<string, unknown>;
    throw new Error(getBackendErrorMessage(errData, "Failed to mark notification as read."));
  }
  return res.json();
};

export const markAllAsRead = async () => {
  const credential = await getCredentials();
  const res = await fetch(`${API_BASE_URL}/notifications/mark_read/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${credential.access}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({})) as Record<string, unknown>;
    throw new Error(getBackendErrorMessage(errData, "Failed to mark all notifications as read."));
  }
  return res.json();
};
