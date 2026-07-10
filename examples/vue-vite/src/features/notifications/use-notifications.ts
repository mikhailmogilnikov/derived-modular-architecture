import { onScopeDispose, shallowRef } from "vue";
import {
	getNotifications,
	getUnreadCount,
	markAllNotificationsRead,
	markNotificationRead,
	subscribeNotifications,
} from "./notifications.store";

export const useNotifications = () => {
	const items = shallowRef(getNotifications());
	const unread = shallowRef(getUnreadCount());

	const refresh = (): void => {
		items.value = getNotifications();
		unread.value = getUnreadCount();
	};

	const unsubscribe = subscribeNotifications(refresh);
	onScopeDispose(unsubscribe);

	return {
		items,
		markAllRead: markAllNotificationsRead,
		markRead: markNotificationRead,
		unread,
	};
};
