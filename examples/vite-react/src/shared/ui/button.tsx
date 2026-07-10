import styles from "./button.module.css";

type ButtonProps = {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
};

export const Button = ({
  label,
  onClick,
  disabled = false,
  type = "button",
}: ButtonProps) => (
  <button
    aria-label={label}
    className={styles.button}
    disabled={disabled}
    onClick={onClick}
    type={type}
  >
    {label}
  </button>
);
