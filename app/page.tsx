import type { Metadata } from "next";
import Landing from "./components/landing/landing";
import { Suspense } from "react";
import "./styles/globals.css";


export default function IndexPage() {
  return (
    <>
      <Suspense fallback={null}>
        <Landing />
      </Suspense>
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
