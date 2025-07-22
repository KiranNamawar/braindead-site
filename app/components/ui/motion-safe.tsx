import React from "react";
import { useReducedMotion } from "~/hooks/use-reduced-motion";

interface MotionSafeProps {
  children: React.ReactNode;
  className?: string;
  animatedClassName?: string;
  style?: React.CSSProperties;
  animatedStyle?: React.CSSProperties;
}

/**
 * A component that conditionally applies animations based on the user's motion preference
 */
export function MotionSafe({
  children,
  className = "",
  animatedClassName = "",
  style = {},
  animatedStyle = {},
}: MotionSafeProps) {
  const prefersReducedMotion = useReducedMotion();
  
  // Apply animated classes and styles only if the user doesn't prefer reduced motion
  const finalClassName = prefersReducedMotion ? className : `${className} ${animatedClassName}`;
  const finalStyle = prefersReducedMotion ? style : { ...style, ...animatedStyle };
  
  return (
    <div className={finalClassName} style={finalStyle}>
      {children}
    </div>
  );
}