import type { Metadata } from "next";
import Landing from "./components/landing/landing";
import { AuthHandler } from "./components/authHandler/AuthHandler";
import "./styles/globals.css";
import { Suspense } from "react";

export default function IndexPage() {
  return (
    <>
      <Suspense>
        <AuthHandler />
      </Suspense>
      <Landing />
    </>
  );
}

export const metadata: Metadata = {
  title: 'reddArt',
  description: 'Your site description here',
  icons: {
    icon: '/favicon.svg',
  },
};
