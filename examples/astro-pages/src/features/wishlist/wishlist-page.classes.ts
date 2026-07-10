import styles from "./public/wishlist-page.module.css";

export const wishlistPageClasses = {
	root: styles.wishlist,
	list: styles.list,
	item: styles.item,
	itemId: styles.itemId,
	itemStatus: styles.itemStatus,
	note: styles.note,
} as const;
