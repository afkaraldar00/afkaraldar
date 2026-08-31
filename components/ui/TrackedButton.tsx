"use client";

import React from "react";
import { track, TrackParams } from "@/lib/analytics/track";

interface TrackedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  eventName?: string;
  button_location: TrackParams["button_location"];
  trackingParams?: Omit<TrackParams, "button_location">;
  variant?: "primary" | "secondary" | "outline" | "gold" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export default function TrackedButton({
  eventName = "cta_click",
  button_location,
  trackingParams = {},
  variant = "primary",
  size = "md",
  children,
  onClick,
  className = "",
  ...props
}: TrackedButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    track(eventName, {
      button_location,
      ...trackingParams,
    });

    if (onClick) {
      onClick(e);
    }
  };

  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.96] hover:-translate-y-0.5 hover:scale-[1.015] hover-gold-shine cursor-pointer select-none";

  const variantStyles = {
    primary: "bg-[#191611] text-[#FBF8F3] hover:bg-[#29231C] hover:shadow-xl hover:shadow-[#191611]/20 focus:ring-[#191611] shadow-md border border-[#191611]",
    gold: "bg-gradient-to-r from-[#AD7D39] via-[#C3944D] to-[#AD7D39] bg-[length:200%_auto] hover:bg-right text-white hover:shadow-xl hover:shadow-[#AD7D39]/30 focus:ring-[#AD7D39] shadow-md border border-[#AD7D39]",
    secondary: "bg-[#F6F0E7] text-[#292725] hover:bg-[#E9DBC6] hover:shadow-md focus:ring-[#AD7D39] border border-[rgba(60,45,30,0.12)]",
    outline: "bg-transparent text-[#AD7D39] border border-[#AD7D39] hover:bg-[#AD7D39] hover:text-white hover:shadow-lg hover:shadow-[#AD7D39]/20 focus:ring-[#AD7D39]",
    ghost: "bg-transparent text-[#292725] hover:bg-[#F6F0E7] focus:ring-[#AD7D39]",
  };

  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs rounded-md",
    md: "px-5 py-2.5 text-sm rounded-lg",
    lg: "px-7 py-3.5 text-base font-semibold rounded-xl",
  };

  return (
    <button
      onClick={handleClick}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
