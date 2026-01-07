import { useEffect } from 'react';

/**
 * Hook to register and manage the service worker for PWA offline support
 * 
 * Design Philosophy: Modern Culinary Minimalism
 * - Transparent: Service worker works silently in the background
 * - Reliable: Ensures offline access to recipes
 * - Efficient: Caches only essential assets
 */
export function useServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then(registration => {
            console.log('Service Worker registered successfully:', registration);
          })
          .catch(error => {
            console.log('Service Worker registration failed:', error);
          });
      });
    }
  }, []);
}
