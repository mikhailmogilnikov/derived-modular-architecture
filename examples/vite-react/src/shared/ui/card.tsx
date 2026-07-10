import type { CSSProperties, ReactNode } from "react";
import { classNames } from "@/shared/lib/class-names";
import styles from "./card.module.css";

type CardProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export const Card = ({ children, className, style }: CardProps) => (
  <article className={classNames(styles.card, className)} style={style}>
    {children}
  </article>
);
