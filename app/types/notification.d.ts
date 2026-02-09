export type Notification = {
  id: number;
  recipient: number;
  message: string;
  data: string;
  is_read: boolean;
  created_at: string;
};

export type NotificationResponse = Notification[];
