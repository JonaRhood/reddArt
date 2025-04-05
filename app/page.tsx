"use client"

export const runtime = 'edge';

import Landing from "./components/landing/landing";
import { Suspense } from "react";
import "/public/styles/globals.css";


export default function IndexPage() {
  return (
    <>
      <Suspense fallback={null}>
        <Landing />
      </Suspense>
    </>
  );
}
