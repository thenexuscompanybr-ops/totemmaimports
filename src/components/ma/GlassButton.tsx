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
  variant = 'gold', 
  size = 'totem', 
  children, 
  ...props 
}: GlassButtonProps) {
  
  const variants = {
    primary: "bg-[#001D3D] text-white active:bg-[#001226] shadow-[0_30px_60px_rgba(0,0,0,0.3)] border border-white/10",
    secondary: "bg-white/5 text-white active:bg-white/10 border border-white/10 backdrop-blur-xl",
    outline: "border-2 border-[#C5A059]/30 text-white active:bg-[#C5A059]/10",
    google: "bg-[#4285F4] text-white active:bg-[#357abd] shadow-lg",
    gold: "bg-[#C5A059] text-[#001D3D] active:scale-95 shadow-[0_40px_80px_rgba(197,160,89,0.3)] hover:shadow-[0_40px_100px_rgba(197,160,89,0.5)]"
  }

  const sizes = {
    sm: "px-6 py-3 text-xs font-bold uppercase tracking-wider",
    md: "px-8 py-4 text-base font-bold",
    lg: "px-12 py-6 text-xl font-black tracking-tight",
    xl: "px-16 py-8 text-2xl font-black tracking-tight",
    totem: "h-[100px] px-20 text-4xl font-black tracking-tighter uppercase"
  }

  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center transition-all duration-500 disabled:opacity-50 disabled:pointer-events-none overflow-hidden select-none rounded-[40px] group",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-white/20 translate-y-full group-active:translate-y-0 transition-transform duration-300" />
      <span className="relative z-10 flex items-center gap-6">{children}</span>
    </button>
  )
}
