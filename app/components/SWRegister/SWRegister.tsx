"use client";

import { useEffect } from "react";

export const SWRegister = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then(serviceWorker => {
          // console.log('Service Worker registered: ', serviceWorker);

          if (!navigator.serviceWorker.controller) {
            console.log('No SW controlling the page yet, reloading...');
            window.location.reload();
            console.log("Redirect SW")
          } else {
            // console.log('Service Worker is already controlling the page');
          }
        })
        .catch(error => {
          console.error('Error registering the Service Worker: ', error);
        });
    }
  }, []);

  return null;
};