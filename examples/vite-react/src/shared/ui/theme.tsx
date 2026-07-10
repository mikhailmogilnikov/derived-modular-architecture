import { createContext, type ReactNode, useContext } from "react";

export type Theme = "light" | "dark";

const ThemeContext = createContext<Theme>("light");

type ThemeProviderProps = {
  children: ReactNode;
  value: Theme;
};

export const ThemeProvider = ({ children, value }: ThemeProviderProps) => (
  <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
);

export const useTheme = (): Theme => useContext(ThemeContext);
