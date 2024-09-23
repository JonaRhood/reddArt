import type { ReactNode } from "react";
import { StoreProvider } from "./StoreProvider";
import Sidenav from "./components/sidenav/sidenav";
import "./styles/globals.css";
import { IBM_Plex_Sans } from 'next/font/google';

import { AuthHandler } from "./components/authHandler/AuthHandler";
import { Suspense } from "react";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

interface Props {
  readonly children: ReactNode;
}

export default function RootLayout({ children }: Props) {
  return (
    <StoreProvider>
      <html lang="en">
        <body className={`
            ${ibmPlexSans.className}
            bg-light-background text-light-text
        `}>
          <Suspense fallback={<div>Loading...</div>}>
            <AuthHandler />
          </Suspense>
          <section className="flex">
            <div className="fixed w-56 sm:w-80 bg-light-surface h-screen overflow-hidden z-50">
              <Suspense fallback={null}>
                <Sidenav /> 
              </Suspense>
            </div>
            <div className={``}>
              <main className="">{children}</main>
            </div>
          </section>
        </body>
      </html>
    </StoreProvider>
  );
}

export const metadata = {
  title: 'reddArt',
  description: 'Your site description here',
  icons: {
    icon: '/favicon.svg',
  },
};
