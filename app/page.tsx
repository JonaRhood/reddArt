import type { Metadata } from "next";
import Landing from "./components/landing/landing";
import "./styles/globals.css";

export default function IndexPage() {
  return <Landing />;
}

export const metadata: Metadata = {
  title: "Redux Toolkit",
};
