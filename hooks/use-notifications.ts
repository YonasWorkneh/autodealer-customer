"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications, getUnreadNotificationCount, markAsRead, markAllAsRead } from "@/lib/notificationApi";

export function useUnreadNotificationCount() {
  return useQuery<number>({
    queryKey: ["notifications-unread-count"],
    queryFn: getUnreadNotificationCount,
    staleTime: 30 * 1000,
    refetchInterval: 30000,
  });
}

export function useNotifications() {
  const {
    data: notifications,
    isLoading: isNotificationsLoading,
    refetch: refetchNotifications,
    isRefetching: isNotificationsRefetching,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  return {
    notifications,
    isNotificationsLoading,
    refetchNotifications,
    isNotificationsRefetching,
  };
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });
}
