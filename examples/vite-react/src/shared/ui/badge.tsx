import type { ReactNode } from "react";
import { classNames } from "@/shared/lib/class-names";
import styles from "./badge.module.css";

type BadgeProps = {
  children: ReactNode;
  variant?: "default" | "accent";
};

export const Badge = ({ children, variant = "default" }: BadgeProps) => (
  <span
    className={classNames(styles.badge, variant === "accent" && styles.accent)}
  >
    {children}
  </span>
);
