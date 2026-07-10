"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "@/services/session/public/session-provider";

type ProvidersProps = {
  children: ReactNode;
};

// Composition root: wire cross-cutting providers (session, ports, event subscriptions).
export const Providers = ({ children }: ProvidersProps) => (
  <SessionProvider>{children}</SessionProvider>
);
