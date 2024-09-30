"use client";

import { useEffect } from 'react';
import { redirect, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

interface RedditResponse {
  token: string;
  refresh_token: string;
  error?: string;
}

export const AuthHandler = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const clientId = process.env.NEXT_PUBLIC_REDDIT_CLIENT_ID;
      const redirectUri = process.env.NEXT_PUBLIC_REDDIT_REDIRECT_URL;  // http://localhost:3000/    https://reddit-client-rho.vercel.app/;
      const state = uuidv4();
      const scope = 'read, history';
      const duration = 'permanent';

      const localState = localStorage.getItem("REDDART_AUTH_STATE");
      const localCode = localStorage.getItem("REDDART_CODE");
      const localToken = localStorage.getItem("REDDART_ACCESS_TOKEN");
      const localRefreshToken = localStorage.getItem("REDDART_REFRESH_TOKEN");
      const localTokenTime = localStorage.getItem("REDDART_TOKEN_TIME");
      const urlState = searchParams.get("state");
      const urlCode = searchParams.get("code");
      const urlError = searchParams.get("error");
      const currentUrl = window.location.href === redirectUri;

      const oneHour = 60 * 60 * 1000;

      // Logic Starts if there's a client ID and Redirect URI defined in .env.local
      if (!clientId || !redirectUri) {
        console.error("Client id or Redirect Uri not defined");
        // Token Refreshment after 1 hour
      } else if (localToken && localTokenTime && Date.now() - parseInt(localTokenTime, 10) > oneHour) {
        localStorage.setItem("REDDART_TOKEN_TIME", Date.now().toString());
        fetch(`api/reddit-refresh-token`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localRefreshToken}`,
          }
        })
          .then(response => response.json())
          .then((data) => {
            const parsedData = data as RedditResponse;
            if (parsedData.token) {
              localStorage.setItem("REDDART_ACCESS_TOKEN", parsedData.token);
              localStorage.setItem("REDDART_TOKEN_TIME", Date.now().toString());

              console.log('%cToken Refreshed', 'color: green; font-weight: bold;');
            } else {
              console.error('Failed to Refresh the Access Token', parsedData.error);
            }
          })
          .catch((error: any) => {
            console.error('Error Refreshing the token:', error);
          });
        // First Log in to the app or authorization declined by user
      } else if (!localState || urlError) {
        localStorage.setItem("REDDART_AUTH_STATE", state);
        const authUrl = `https://www.reddit.com/api/v1/authorize?client_id=${clientId}&response_type=code&state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}&duration=${duration}&scope=${scope}`;
        window.location.href = authUrl;
        // Reddit Token Retrieval
      } else if (urlCode && !localCode) {
        localStorage.setItem("REDDART_CODE", urlCode);
        fetch(`/api/reddit-token`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${urlCode}`,
          }
        })
          .then(response => response.json())
          .then((data) => {
            const parsedData = data as RedditResponse;
            if (parsedData.token && parsedData.refresh_token) {
              localStorage.setItem("REDDART_ACCESS_TOKEN", parsedData.token);
              localStorage.setItem("REDDART_REFRESH_TOKEN", parsedData.refresh_token);
              localStorage.setItem("REDDART_TOKEN_TIME", Date.now().toString());

              console.log('%cToken received', 'color: green; font-weight: bold;');

              window.location.href = 'http://localhost:3000/' //Added line to fix the problem with getting stock in the beggining?

            } 
            // When State is alone, delete and refresh website.
            else if (localState && !localCode && !localToken) {
              console.log("Local State alone, refreshing page...");
              setTimeout(() => {
                localStorage.removeItem("REDDART_AUTH_STATE");
                localStorage.removeItem("REDDART_CODE");
                window.location.reload();
              }, 1000)
            } else {
              console.error('Failed to get access token:', parsedData.error);
            }
          })
          .catch((error: any) => {
            console.error('Error fetching token:', error);
          });
        //Token defined and working
      } else if (localToken) {
        console.log('%cAll set', 'color: green; font-weight: bold;');
      } else {
        console.error('No code or state provided, reloading...');
        setTimeout(() => {
          localStorage.removeItem("REDDART_AUTH_STATE");
          localStorage.removeItem("REDDART_CODE");
          window.location.reload();
        }, 1000)
      }
    }
  }, [searchParams]);

  return null; // No renderización necesaria
};
