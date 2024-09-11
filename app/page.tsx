import type { Metadata } from "next";
import Landing from "./components/landing/landing";

export default function IndexPage() {
  return <Landing />;
}

export const metadata: Metadata = {
  title: "Redux Toolkit",
};
