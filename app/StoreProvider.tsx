"use client";

import { AppStore } from '@/app/lib/store';
import { useEffect, useRef } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { Provider } from 'react-redux';
import { makeStore } from '@/app/lib/store';
import { setupListeners } from '@reduxjs/toolkit/query';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  readonly children: React.ReactNode;
}

export const StoreProvider = ({ children }: Props) => {
  const storeRef = useRef<AppStore | null>(null);
  const searchParams = useSearchParams();

  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  useEffect(() => {
    if (storeRef.current) {
      const unsubscribe = setupListeners(storeRef.current.dispatch);
      return unsubscribe;
    }
  }, []);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_REDDIT_CLIENT_ID;
    const clientSecret = process.env.NEXT_PUBLIC_REDDIT_CLIENT_SECRET;
    const redirectUri = 'http://localhost:3000/';
    const state = uuidv4();
    const scope = 'read';
    const duration = 'permanent';

    const localState = localStorage.getItem("REDDART_AUTH_STATE");
    const localCode = localStorage.getItem("REDDART_CODE");
    const localToken = localStorage.getItem("REDDART_ACCESS_TOKEN");
    const urlState = searchParams.get("state");
    const urlCode = searchParams.get("code");
    const urlError = searchParams.get("error");
    const currentUrl = window.location.href === "http://localhost:3000/"


    // If there's no authState saved on localStorage or urlState is not like localStorage or urlError
    if (currentUrl && localToken) {
      console.log("Token and permission given.");
    } else if (!localState || urlState !== localState || urlError) {
      localStorage.setItem("REDDART_AUTH_STATE", state);
      const authUrl = `https://www.reddit.com/api/v1/authorize?client_id=${clientId}&response_type=code&state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}&duration=${duration}&scope=${scope}`;
      window.location.href = authUrl;
      // Token request
    } else if (urlCode && !localCode) {
      localStorage.setItem("REDDART_CODE", urlCode);
      fetch(`/api/reddit-token?code=${urlCode}`)
        .then(response => response.json())
        .then(data => {
          if (data.token) {
            localStorage.setItem("REDDART_ACCESS_TOKEN", data.token);
            console.log('%cToken received', 'color: green; font-weight: bold;');
          } else {
            console.error('Failed to get access token:', data.error);
          }
        })
        .catch(error => {
          console.error('Error fetching token:', error);
        });
    } else if (localToken) {
      console.log('%cAll set', 'color: green; font-weight: bold;');
    } else {
      console.error('No code or state provided');
    }
  }, []); // Added searchParams to dependency array to avoid stale closures

  return <Provider store={storeRef.current}>{children}</Provider>;
};
