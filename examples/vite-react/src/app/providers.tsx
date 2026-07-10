import { type ReactNode, useState } from "react";
import { ThemeProvider } from "@/shared/ui/theme";

type AppProvidersProps = {
  children: ReactNode;
};

export const AppProviders = ({ children }: AppProvidersProps) => {
  const [theme] = useState<"light" | "dark">("light");

  return <ThemeProvider value={theme}>{children}</ThemeProvider>;
};
