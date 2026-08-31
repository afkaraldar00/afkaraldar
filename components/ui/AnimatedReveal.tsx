"use client";

import React, { useEffect, useRef, useState } from "react";

interface AnimatedRevealProps {
  children: React.ReactNode;
  animation?: "fade-up" | "fade-down" | "scale-in" | "slide-right" | "slide-left";
  delay?: number;
  duration?: number;
  className?: string;
  threshold?: number;
  once?: boolean;
}

export default function AnimatedReveal({
  children,
  animation = "fade-up",
  delay = 0,
  duration = 700,
  className = "",
  threshold = 0.15,
  once = true,
}: AnimatedRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Fallback if IntersectionObserver is unsupported
    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(entry.target);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, once]);

  const getInitialStyle = () => {
    if (isVisible) {
      return {
        opacity: 1,
        transform: "none",
        transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      };
    }

    let transform = "translateY(24px)";
    if (animation === "fade-down") transform = "translateY(-24px)";
    if (animation === "scale-in") transform = "scale(0.94)";
    if (animation === "slide-right") transform = "translateX(-30px)";
    if (animation === "slide-left") transform = "translateX(30px)";

    return {
      opacity: 0,
      transform,
      transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      willChange: "opacity, transform",
    };
  };

  return (
    <div ref={ref} style={getInitialStyle()} className={className}>
      {children}
    </div>
  );
}
