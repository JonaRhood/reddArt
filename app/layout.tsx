
import type { ReactNode } from "react";
import { StoreProvider } from "./StoreProvider";
import Sidenav from "./components/sidenav/sidenav";


import "./styles/globals.css";
import styles from "./styles/layout.module.css";

interface Props {
  readonly children: ReactNode;
}

export default function RootLayout({ children }: Props) {
  return (
    <StoreProvider>
      <html lang="en">
        <body>
          <section className="flex">
            <div className="flex">
              <Sidenav />
            </div>
            <main className="flex">{children}</main>
          </section>
        </body>
      </html>
    </StoreProvider>
  );
}
