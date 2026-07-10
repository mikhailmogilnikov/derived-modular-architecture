export type Notification = {
  id: string;
  message: string;
  read: boolean;
};

const seedNotifications: Notification[] = [
  {
    id: "welcome",
    message: "Welcome to the DMA mini shop.",
    read: false,
  },
  {
    id: "shipping",
    message: "Express shipping is available at checkout.",
    read: true,
  },
];

let notifications: Notification[] = [...seedNotifications];
const listeners = new Set<() => void>();

const notify = () => {
  for (const listener of listeners) {
    listener();
  }
};

export const subscribeNotifications = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getNotifications = (): readonly Notification[] => notifications;

export const getUnreadCount = (): number =>
  notifications.filter((item) => !item.read).length;

export const addNotification = (message: string): void => {
  notifications = [
    {
      id: `note-${Date.now()}`,
      message,
      read: false,
    },
    ...notifications,
  ];
  notify();
};

export const markNotificationRead = (id: string): void => {
  notifications = notifications.map((item) =>
    item.id === id ? { ...item, read: true } : item
  );
  notify();
};

export const markAllNotificationsRead = (): void => {
  notifications = notifications.map((item) => ({ ...item, read: true }));
  notify();
};
