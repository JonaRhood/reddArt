import type { Metadata } from "next";
import Landing from "./components/landing/landing";
import { AuthHandler } from "./components/authHandler/AuthHandler";
import "./styles/globals.css";

export default function IndexPage() {
  return (
    <>
      <AuthHandler />
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
