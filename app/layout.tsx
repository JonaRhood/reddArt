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
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js', { scope: '/' }).then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
    
          // Verificar si el SW está controlando la página
          if (navigator.serviceWorker.controller) {
            console.log('Service Worker is controlling the page');
          } else {
            console.log('Service Worker is not controlling the page yet');
          }
    
          // Escuchar cuando el Service Worker toma control
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('Service Worker has taken control of the page');
          });
    
        }).catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
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
