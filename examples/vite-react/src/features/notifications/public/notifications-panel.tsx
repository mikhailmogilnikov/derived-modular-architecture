import { useSyncExternalStore } from "react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  subscribeNotifications,
} from "../notifications.store";
import { mergeStyles, notificationsStyles } from "../notifications.styles";

export const NotificationsPanel = () => {
  const items = useSyncExternalStore(subscribeNotifications, getNotifications);
  const unread = useSyncExternalStore(subscribeNotifications, getUnreadCount);

  return (
    <section aria-labelledby="notifications-heading">
      <header style={notificationsStyles.header}>
        <div>
          <h2 id="notifications-heading">Notifications</h2>
          <p>Colocated store — wired from app when catalog adds to cart.</p>
        </div>
        {unread > 0 ? <Badge variant="accent">{unread} unread</Badge> : null}
      </header>

      <ul style={notificationsStyles.list}>
        {items.map((item) => (
          <li key={item.id}>
            <Card
              style={mergeStyles(item.read && notificationsStyles.readCard)}
            >
              <p>{item.message}</p>
              {item.read ? (
                <p style={notificationsStyles.status}>Read</p>
              ) : (
                <Button
                  label="Mark read"
                  onClick={() => markNotificationRead(item.id)}
                />
              )}
            </Card>
          </li>
        ))}
      </ul>

      {unread > 0 ? (
        <footer>
          <Button label="Mark all read" onClick={markAllNotificationsRead} />
        </footer>
      ) : null}
    </section>
  );
};
