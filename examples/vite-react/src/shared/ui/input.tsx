import styles from "./input.module.css";

type InputProps = {
  id: string;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
};

export const Input = ({
  id,
  label,
  onChange,
  placeholder,
  value,
}: InputProps) => (
  <label className={styles.input} htmlFor={id}>
    <span className={styles.label}>{label}</span>
    <input
      className={styles.field}
      id={id}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      type="search"
      value={value}
    />
  </label>
);
