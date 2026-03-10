"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'google' | 'gold'
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
    primary: "bg-[#001D3D] text-white active:bg-[#001226] shadow-[0_20px_40px_rgba(0,29,61,0.2)]",
    secondary: "bg-white text-[#001D3D] active:bg-zinc-50 border border-[#001D3D]/10",
    outline: "border-2 border-[#C5A059]/30 text-[#001D3D] active:bg-[#C5A059]/5",
    google: "bg-[#4285F4] text-white active:bg-[#357abd] shadow-lg",
    gold: "bg-[#C5A059] text-white active:bg-[#A6864A] shadow-[0_20px_40px_rgba(197,160,89,0.3)]"
  }

  const sizes = {
    sm: "px-6 py-3 text-xs font-bold uppercase tracking-wider",
    md: "px-8 py-4 text-base font-bold",
    lg: "px-10 py-5 text-lg font-bold tracking-tight",
    xl: "px-14 py-6 text-xl font-bold tracking-tight",
    totem: "h-[90px] px-16 text-3xl font-bold tracking-tight"
  }

  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none overflow-hidden select-none rounded-[32px]",
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
