"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'gold' | 'outline'
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
    primary: "bg-primary text-white hover:bg-primary/90 shadow-[0_0_20px_rgba(46,151,245,0.3)]",
    secondary: "glass-dark text-white hover:bg-white/10",
    gold: "gold-gradient text-background font-bold shadow-[0_0_20px_rgba(201,162,74,0.3)]",
    outline: "border border-white/20 text-white hover:bg-white/5"
  }

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg font-semibold",
    xl: "px-10 py-5 text-xl font-bold tracking-tight"
  }

  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center rounded-full transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none overflow-hidden group",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
    </button>
  )
}
