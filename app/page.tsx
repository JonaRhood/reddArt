"use client"

import { useEffect } from "react";
import type { Metadata } from "next";
import Landing from "./components/landing/landing";
import { Suspense } from "react";
import "./styles/globals.css";


export default function IndexPage() {

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
    
          // Verificar si el SW está controlando la página
          if (navigator.serviceWorker.controller) {
            console.log('Service Worker is controlling the page');
            navigator.serviceWorker.controller.postMessage({ action: 'cancelPendingRequests' });
          } else {
            console.log('Service Worker is not controlling the page yet');
          }
    
          // Escuchar cuando el Service Worker toma control
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('Service Worker has taken control of the page');
          });
    
        }).catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
      });
    }    
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <Landing />
      </Suspense>
    </>
  );
}
