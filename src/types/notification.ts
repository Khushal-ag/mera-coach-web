export type AppNotification = {
  id: number;
  type: string;
  groupCode: string;
  title: string;
  body: string;
  /** Screen the alert points at: leads, client, premium, packages, posts, reviews. */
  route: string;
  /** Client code, lead id … for that screen. */
  refCode: string;
  isRead: boolean;
  /** ISO date-time (UTC). */
  createdAt: string;
};

export type NotificationPage = {
  items: AppNotification[];
  unreadCount: number;
  hasMore: boolean;
};

export type NotificationPreference = {
  groupCode: string;
  label: string;
  isEnabled: boolean;
};
