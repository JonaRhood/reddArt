"use client"

import { useEffect } from "react";
import type { Metadata } from "next";
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
