import { toast } from "sonner";

/**
 * Configuration for toast notifications that respects reduced motion preferences
 */
export function configureToast() {
  // Check if the user prefers reduced motion
  let prefersReducedMotion = false;
  
  try {
    // Check if window and matchMedia are available
    if (typeof window !== "undefined" && window.matchMedia) {
      prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
  } catch (error) {
    // If there's an error, just use the default value
    console.warn("Error detecting reduced motion preference:", error);
  }
  
  // Configure toast options
  const toastOptions = {
    duration: prefersReducedMotion ? 3000 : 4000,
    closeButton: true,
    // Disable animations for users who prefer reduced motion
    className: prefersReducedMotion ? "no-animation" : "",
  };
  
  return { toast, toastOptions };
}

/**
 * Show a success toast with reduced motion preferences
 */
export function showSuccessToast(message: string) {
  const { toast, toastOptions } = configureToast();
  toast.success(message, toastOptions);
}

/**
 * Show an error toast with reduced motion preferences
 */
export function showErrorToast(message: string) {
  const { toast, toastOptions } = configureToast();
  toast.error(message, toastOptions);
}