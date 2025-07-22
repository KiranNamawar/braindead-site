import { useState, useEffect } from "react";

/**
 * Hook to detect if the user prefers reduced motion
 * @returns boolean indicating if reduced motion is preferred
 */
export function useReducedMotion(): boolean {
  // Default to false if SSR or if the API is not available
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if window is defined (not SSR) and if matchMedia is available
    if (typeof window === "undefined" || !window.matchMedia) return;
    
    try {
      // Check if the API is available
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      
      // Set initial value
      setPrefersReducedMotion(mediaQuery.matches);
      
      // Define listener function
      const handleChange = (event: MediaQueryListEvent) => {
        setPrefersReducedMotion(event.matches);
      };
      
      // Add listener for changes
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", handleChange);
      } else if (mediaQuery.addListener) {
        // Fallback for older browsers
        mediaQuery.addListener(handleChange);
      }
      
      // Clean up
      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener("change", handleChange);
        } else if (mediaQuery.removeListener) {
          // Fallback for older browsers
          mediaQuery.removeListener(handleChange);
        }
      };
    } catch (error) {
      // If there's any error, just return the default value
      console.warn("Error detecting reduced motion preference:", error);
      return;
    }
  }, []);
  
  return prefersReducedMotion;
}