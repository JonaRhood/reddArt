"use client";

import { useEffect } from 'react';
import { redirect, useSearchParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';


export const AuthHandler = () => {
  const searchParams = useSearchParams();

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
        // localStorage.setItem("REDDART_TOKEN_TIME", Date.now().toString());  // This line changes the time beforehand. Not needed?
        fetch(`api/reddit-refresh-token`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localRefreshToken}`,
          }
        })
          .then(response => response.json())
          .then(data => {
            if (data.token) {
              localStorage.setItem("REDDART_ACCESS_TOKEN", data.token);
              localStorage.setItem("REDDART_TOKEN_TIME", Date.now().toString());

              console.log('%cToken Refreshed', 'color: green; font-weight: bold;');
            } else {
              console.error('Failed to Refresh the Access Token', data.error);
            }
          })
          .catch(error => {
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
          .then(data => {
            if (data.token && data.refresh_token) {
              localStorage.setItem("REDDART_ACCESS_TOKEN", data.token);
              localStorage.setItem("REDDART_REFRESH_TOKEN", data.refresh_token);
              localStorage.setItem("REDDART_TOKEN_TIME", Date.now().toString());
              
              console.log('%cToken received', 'color: green; font-weight: bold;');
            } else {
              console.error('Failed to get access token:', data.error);
            }
          })
          .catch(error => {
            console.error('Error fetching token:', error);
          });
      //Token defined and working
      } else if (localToken) {
        console.log('%cAll set', 'color: green; font-weight: bold;');
      } else {
        console.error('No code or state provided');
      }
    }
  }, [searchParams]);

  return null; // No renderización necesaria
};
