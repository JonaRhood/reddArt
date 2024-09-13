"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

export const AuthHandler = () => {
  const searchParams = useSearchParams();
  const { NEXT_PUBLIC_REDDIT_REDIRECT_URL } = process.env;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const clientId = process.env.NEXT_PUBLIC_REDDIT_CLIENT_ID;
      const redirectUri = NEXT_PUBLIC_REDDIT_REDIRECT_URL || 'http://localhost:3000/'; // Default value if env var is missing
      const state = uuidv4();
      const scope = 'read';
      const duration = 'permanent';

      const localState = localStorage.getItem("REDDART_AUTH_STATE");
      const localCode = localStorage.getItem("REDDART_CODE");
      const localToken = localStorage.getItem("REDDART_ACCESS_TOKEN");
      const urlState = searchParams.get("state");
      const urlCode = searchParams.get("code");
      const urlError = searchParams.get("error");
      const currentUrl = window.location.href === redirectUri;

      if (currentUrl && localToken) {
        console.log("Token and permission given.");
      } else if (!localState || urlState !== localState || urlError) {
        localStorage.setItem("REDDART_AUTH_STATE", state);
        const authUrl = `https://www.reddit.com/api/v1/authorize?client_id=${clientId}&response_type=code&state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}&duration=${duration}&scope=${scope}`;
        window.location.href = authUrl;
      } else if (urlCode && !localCode) {
        localStorage.setItem("REDDART_CODE", urlCode);
        fetch(`/api/reddit-token?code=${urlCode}`)
          .then(response => response.json())
          .then(data => {
            if (data.token) {
              localStorage.setItem("REDDART_ACCESS_TOKEN", data.token);
              console.log('%cToken received', 'color: green; font-weight: bold;');
              window.location.href = redirectUri;
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
    }
  }, [searchParams]);

  return null; // No renderización necesaria
};
