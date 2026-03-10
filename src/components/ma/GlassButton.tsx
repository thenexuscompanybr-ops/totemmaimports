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
    primary: "bg-black text-white hover:bg-zinc-800 shadow-xl",
    secondary: "bg-zinc-100 text-black hover:bg-zinc-200 shadow-sm",
    outline: "border-2 border-black/10 text-black hover:bg-zinc-50"
  }

  const sizes = {
    sm: "px-5 py-2.5 text-sm font-bold",
    md: "px-8 py-4 text-base font-bold",
    lg: "px-10 py-5 text-lg font-bold tracking-tight",
    xl: "px-12 py-6 text-xl font-bold tracking-tight"
  }

  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none overflow-hidden group",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
    </button>
  )
}