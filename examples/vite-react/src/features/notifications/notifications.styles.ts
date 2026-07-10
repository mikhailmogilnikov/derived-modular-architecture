import type { CSSProperties } from "react";

export const mergeStyles = (
  ...styles: Array<CSSProperties | false | undefined>
): CSSProperties => Object.assign({}, ...styles.filter(Boolean));

export const notificationsStyles = {
  header: {
    alignItems: "flex-start",
    display: "flex",
    gap: "1rem",
    justifyContent: "space-between",
    marginBottom: "1rem",
  } satisfies CSSProperties,
  list: {
    display: "grid",
    gap: "0.75rem",
    listStyle: "none",
    margin: "0 0 1rem",
    padding: 0,
  } satisfies CSSProperties,
  readCard: {
    opacity: 0.7,
  } satisfies CSSProperties,
  status: {
    fontSize: "0.8rem",
    margin: "0.5rem 0 0",
    opacity: 0.7,
  } satisfies CSSProperties,
} as const;
