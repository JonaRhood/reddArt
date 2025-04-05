export const runtime = 'edge';

import type { ReactNode } from "react";
import Head from "next/head";
import { Metadata } from "next";
import { StoreProvider } from "./StoreProvider";
import Sidenav from "./components/sidenav/sidenav";
import "/public/styles/globals.css";
import { SWRegister } from "./components/SWRegister/SWRegister";
import MobileChecker from "./components/mobileChecker/MobileChecker";
import DarkTheme from "./components/DarkTheme/DarkTheme";
import AuthHandlerTrial from "./components/authHandler/AuthHandlerTrial";
import { Suspense } from "react";
import { cookies } from "next/headers";


export default function LayoutContent({
  modal,
  children,
}: {
  modal: React.ReactNode
  children: React.ReactNode
}) {

  const cookieStore = cookies();
  const themeCookie = cookieStore.get('dark-theme');
  const isDarkTheme = themeCookie?.value === 'true';
  const tokenCookie = cookieStore.get("reddit-token");
  const isAuthorized = !!tokenCookie;
  const refreshTokenCookie = cookieStore.get("refresh-token");
  const isRefreshToken = !!refreshTokenCookie;

  const initialReduxState = {
    theme: {
      isDarkTheme,
    },
    general: {
      isAuthorized,
      isRefreshToken
    }
  };

  return (
    <StoreProvider initialState={initialReduxState}>
      <html lang="en">
        <Head>
          <link rel="stylesheet" href="/public/styles/global.css" />
          <link rel="stylesheet" href="/public/styles/artReddits.module.css" />
          <link rel="stylesheet" href="/public/styles/Gallery.module.css" />
          <link rel="stylesheet" href="/public/styles/sidenav.module.css" />
          <link rel="stylesheet" href="/public/styles/layout.module.css" />
        </Head>
        <body className={`
           ${isDarkTheme ? "bg-dark-surface" : "bg-light-surface"}
        `}>
          <Suspense fallback={null}>
            <SWRegister />
          </Suspense>
          <Suspense fallback={null}>
            <AuthHandlerTrial />
          </Suspense>
          <Suspense fallback={null}>
            <MobileChecker />
          </Suspense>
          <section className="flex">
            <div className="fixed z-50">
              <Suspense fallback={null}>
                <Sidenav />
                <DarkTheme />
              </Suspense>
            </div>
            <div id="root">
              <Suspense fallback={null}>
                <main>
                  {children}
                  {modal}
                </main>
              </Suspense>
            </div>
          </section>
        </body>
      </html>
    </StoreProvider>
  );
}


export const metadata: Metadata = {
  title: 'reddArt',
  description: 'Discover a vibrant collection of curated art galleries from various Reddit communities. Explore stunning artworks, connect with talented artists, and immerse yourself in the creative world of Reddit, all in one place!',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'reddArt',
    description: 'Discover a vibrant collection of curated art galleries from various Reddit communities. Explore stunning artworks, connect with talented artists, and immerse yourself in the creative world of Reddit, all in one place!',
    url: 'https://reddit-client-49g.pages.dev/',
    images: [
      {
        url: 'https://reddit-client-49g.pages.dev/mockup3-metadata.jpg',
        alt: 'A vibrant art gallery showcasing various artworks from Reddit',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'reddArt',
    description: 'Discover a vibrant collection of curated art galleries from various Reddit communities. Explore stunning artworks, connect with talented artists, and immerse yourself in the creative world of Reddit, all in one place!',
    images: [
      {
        url: 'https://reddit-client-49g.pages.dev/mockup3-metadata.jpg',
      },
    ],
  },
};

