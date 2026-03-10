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
    primary: "bg-black text-white hover:bg-[#2c2c2e] shadow-lg",
    secondary: "bg-[#F5F5F7] text-black hover:bg-[#e8e8ed] shadow-sm",
    outline: "border-[2px] border-black/10 text-black hover:bg-zinc-50"
  }

  const sizes = {
    sm: "px-6 py-3 text-sm font-bold",
    md: "px-10 py-5 text-lg font-bold",
    lg: "px-12 py-6 text-xl font-bold tracking-tight",
    xl: "px-16 py-8 text-2xl font-bold tracking-tight"
  }

  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center transition-all duration-300 active:scale-90 disabled:opacity-50 disabled:pointer-events-none overflow-hidden group select-none font-bold",
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