import type { ReactNode } from "react";
import "./globals.scss";
import { Providers } from "./providers";

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <header>
            <h1>DMA Mini Shop</h1>
            <p>Next.js App Router — composition root under src/app/</p>
          </header>
          <main>{children}</main>
          <footer>
            <small>Example only — no checkout backend</small>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
