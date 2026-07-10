"use client";

import { createContext, type ReactNode, useContext } from "react";

type Session = {
  email: string;
};

const SessionContext = createContext<Session | null>(null);

type SessionProviderProps = {
  children: ReactNode;
};

export const SessionProvider = ({ children }: SessionProviderProps) => (
  <SessionContext.Provider value={{ email: "demo@example.com" }}>
    {children}
  </SessionContext.Provider>
);

export const useSession = (): Session => {
  const session = useContext(SessionContext);
  if (!session) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return session;
};
