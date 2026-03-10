"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'google'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'totem'
  children: React.ReactNode
}

export function GlassButton({ 
  className, 
  variant = 'primary', 
  size = 'totem', 
  children, 
  ...props 
}: GlassButtonProps) {
  
  const variants = {
    primary: "bg-black text-white active:bg-zinc-800 shadow-[0_20px_40px_rgba(0,0,0,0.15)]",
    secondary: "bg-white text-black active:bg-zinc-50 border border-black/5",
    outline: "border-2 border-black/10 text-black active:bg-black/5",
    google: "bg-[#4285F4] text-white active:bg-[#357abd] shadow-lg"
  }

  const sizes = {
    sm: "px-6 py-3 text-xs font-bold uppercase tracking-wider",
    md: "px-8 py-4 text-base font-bold",
    lg: "px-10 py-5 text-lg font-bold tracking-tight",
    xl: "px-14 py-6 text-xl font-bold tracking-tight",
    totem: "h-[80px] px-16 text-2xl font-bold tracking-tight"
  }

  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none overflow-hidden select-none rounded-[24px]",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-4">{children}</span>
    </button>
  )
}
