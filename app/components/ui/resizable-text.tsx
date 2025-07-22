import React, { useState, useEffect } from "react";

interface ResizableTextProps {
  children: React.ReactNode;
  className?: string;
  minSize?: number;
  maxSize?: number;
}

/**
 * A component that allows text to be resized while maintaining layout
 */
export function ResizableText({
  children,
  className = "",
  minSize = 14,
  maxSize = 24,
}: ResizableTextProps) {
  const [fontSize, setFontSize] = useState(16); // Default font size
  
  // Check if user has set a preferred font size in browser settings
  useEffect(() => {
    // Get the computed font size of the body element
    if (typeof window !== "undefined") {
      const bodyFontSize = parseFloat(
        window.getComputedStyle(document.body).fontSize
      );
      
      // Adjust font size based on body font size, keeping within min/max bounds
      const newSize = Math.min(Math.max(bodyFontSize, minSize), maxSize);
      setFontSize(newSize);
    }
  }, [minSize, maxSize]);
  
  return (
    <div 
      className={className} 
      style={{ fontSize: `${fontSize}px` }}
    >
      {children}
    </div>
  );
}