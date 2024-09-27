"use client"

import type { ReactNode } from "react";
import { StoreProvider } from "./StoreProvider";
import Sidenav from "./components/sidenav/sidenav";
import "./styles/globals.css";
import { IBM_Plex_Sans } from 'next/font/google';
import { useEffect } from "react";

import { AuthHandler } from "./components/authHandler/AuthHandler";
import { Suspense } from "react";


const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

interface Props {
  readonly children: ReactNode;
}

export default function RootLayout({ children }: Props) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then(serviceWorker => {
          console.log('Service Worker registered: ', serviceWorker);

          // Verifica si el SW está controlando la página
          if (!navigator.serviceWorker.controller) {
            console.log('No SW controlling the page yet, reloading...');
            window.location.reload(); // Recarga la página si no está controlada por un SW
          } else {
            console.log('Service Worker is already controlling the page');
          }

        })
        .catch(error => {
          console.error('Error registering the Service Worker: ', error);
        });
    }
  }, []);

  return (
    <StoreProvider>
      <html lang="en">
        <body className={`
            ${ibmPlexSans.className}
            bg-light-background text-light-text
        `}>
          <Suspense fallback={null}>
            <AuthHandler />
          </Suspense>
          <section className="flex">
            <div className="fixed w-56 sm:w-80 bg-light-surface h-screen z-50">
              <Suspense fallback={null}>
                <Sidenav />
              </Suspense>
            </div>
            <div id="root">
              <Suspense fallback={null}>
                <main>{children}</main>
              </Suspense>
            </div>
          </section>
        </body>
      </html>
    </StoreProvider>
  );
}

// export const metadata = {
//   title: 'reddArt',
//   description: 'Your site description here',
//   icons: {
//     icon: '/favicon.svg',
//   },
// };
