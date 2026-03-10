"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  children: React.ReactNode
}

export function GlassButton({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  children, 
  ...props 
}: GlassButtonProps) {
  
  const variants = {
    primary: "bg-black text-white hover:bg-black/80 shadow-[0_10px_30px_rgba(0,0,0,0.15)]",
    secondary: "bg-white text-black hover:bg-black/5 shadow-sm border border-black/5",
    outline: "border-[1.5px] border-black/10 text-black hover:bg-black/5"
  }

  const sizes = {
    sm: "px-6 py-3 text-xs font-bold uppercase tracking-wider",
    md: "px-8 py-4 text-base font-bold",
    lg: "px-10 py-5 text-lg font-bold tracking-tight",
    xl: "px-14 py-6 text-xl font-bold tracking-tight"
  }

  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none overflow-hidden group select-none rounded-full",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-3">{children}</span>
      <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
    </button>
  )
}
