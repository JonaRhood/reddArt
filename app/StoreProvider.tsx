"use client";

import type { AppStore } from "@/app/lib/store";
import { makeStore } from "@/app/lib/store";
import { setupListeners } from "@reduxjs/toolkit/query";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { v4 as uuidv4 } from 'uuid'
import { useParams, usePathname, useSearchParams } from "next/navigation";

interface Props {
  readonly children: ReactNode;
}

export const StoreProvider = ({ children }: Props) => {
  const storeRef = useRef<AppStore | null>(null);

  const searchParams = useSearchParams();

  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
  }

  useEffect(() => {
    if (storeRef.current != null) {
      // configure listeners using the provided defaults
      // optional, but required for `refetchOnFocus`/`refetchOnReconnect` behaviors
      const unsubscribe = setupListeners(storeRef.current.dispatch);
      return unsubscribe;
    }
  }, []);

  // Auth Reddit redirect effect
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_REDDIT_CLIENT_ID;
    const redirectUri = 'http://localhost:3000/'; // Example redirect URI
    const state = uuidv4(); // Generate a random state for security
    const scope = 'read'; // Example scope
    const duration = 'permanent'; // Example duration

    const authState = localStorage.getItem("REDDART_AUTH_STATE");
    const urlState = searchParams.get("state");
    const urlCode = searchParams.get("code");
    const urlError = searchParams.get("error");

    console.log(authState, urlState);

    if (!authState || urlState !== authState || urlError) {
      localStorage.setItem("REDDART_AUTH_STATE", state); // Add state to LocalStorage
      const authUrl = `https://www.reddit.com/api/v1/authorize?client_id=${clientId}&response_type=code&state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}&duration=${duration}&scope=${scope}`;
      window.location.href = authUrl;
    } else {
      console.error('REDDIT_CLIENT_ID is not defined');
    };
  }, [])

  return <Provider store={storeRef.current}>{children}</Provider>;
};
