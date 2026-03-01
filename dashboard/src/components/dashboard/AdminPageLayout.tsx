"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface AdminPageLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
    badge?: string;
}

export function AdminPageLayout({ children, title, subtitle, badge }: AdminPageLayoutProps) {
    return (
        <div className="p-8 md:p-10 relative z-10 fade-in">
            {/* Header Area */}
            <div className="mb-10">
                <div className="flex items-center gap-2.5 mb-2">
                    <div className="pulse-dot" />
                    <span className="mono text-[10px] text-[#334155] tracking-[0.08em] uppercase">
                        {badge || "SUPER ADMIN · TALKIN PLATFORM"}
                    </span>
                </div>
                <h1 className="text-[32px] font-extrabold text-[#f1f5f9] tracking-tight leading-tight">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-[#64748b] text-[14px] mt-1 tracking-tight">
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Content Area */}
            <div className="slide-in">
                {children}
            </div>
        </div>
    );
}
