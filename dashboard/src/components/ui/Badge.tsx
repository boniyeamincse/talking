"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'primary' | 'success' | 'warning' | 'danger' | 'secondary';
    className?: string;
}

export function Badge({ children, variant = 'primary', className }: BadgeProps) {
    const variants = {
        primary: "bg-primary/20 text-primary border-primary/20",
        success: "bg-emerald-500/20 text-emerald-500 border-emerald-500/20",
        warning: "bg-amber-500/20 text-amber-500 border-amber-500/20",
        danger: "bg-rose-500/20 text-rose-500 border-rose-500/20",
        secondary: "bg-white/5 text-muted-foreground border-white/10"
    };

    return (
        <span className={cn(
            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
            variants[variant],
            className
        )}>
            {children}
        </span>
    );
}
