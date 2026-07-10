type ButtonProps = {
  label: string;
  onClick?: () => void;
};

export const Button = ({ label, onClick }: ButtonProps) => (
  <button onClick={onClick} type="button">
    {label}
  </button>
);
