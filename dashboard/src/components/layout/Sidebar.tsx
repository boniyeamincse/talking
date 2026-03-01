"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    BarChart3,
    Users,
    MessageSquare,
    PhoneCall,
    Mic2,
    LayoutDashboard,
    Settings,
    Gift,
    Heart,
    ShieldCheck,
    Bell
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
    { name: "Overview", icon: LayoutDashboard, href: "/", roles: ["admin", "super-admin"] },
    { name: "Users", icon: Users, href: "/users", roles: ["admin", "super-admin"] },
    { name: "Chat", icon: MessageSquare, href: "/chat", roles: ["admin", "super-admin"] },
    { name: "Calls", icon: PhoneCall, href: "/calls", roles: ["admin", "super-admin"] },
    { name: "Voice Rooms", icon: Mic2, href: "/rooms", roles: ["admin", "super-admin"] },
    { name: "Social Feed", icon: Heart, href: "/feed", roles: ["admin", "super-admin"] },
    { name: "Gifts", icon: Gift, href: "/gifts", roles: ["admin", "super-admin"] },
    { name: "Moderation", icon: ShieldCheck, href: "/moderation", roles: ["admin", "super-admin"] },
    { name: "Analytics", icon: BarChart3, href: "/analytics", roles: ["super-admin"] },
];

export function Sidebar() {
    const pathname = usePathname();
    const currentRole = "super-admin"; // Mock role

    const filteredItems = menuItems.filter(item => item.roles.includes(currentRole));

    return (
        <div className="fixed left-4 top-4 bottom-4 w-64 glass rounded-3xl p-6 flex flex-col gap-8 z-50">
            <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                    <MessageSquare className="text-white w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-white leading-none">
                        Bani<span className="text-primary">Talk</span>
                    </h1>
                    <span className="text-[10px] font-bold uppercase text-primary tracking-widest opacity-80 mt-1 block">
                        {currentRole.replace("-", " ")}
                    </span>
                </div>
            </div>

            <nav className="flex-1 flex flex-col gap-2">
                {filteredItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.name} href={item.href}>
                            <div className={cn(
                                "group relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300",
                                isActive ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-white/5 hover:text-white"
                            )}>
                                {isActive && (
                                    <motion.div
                                        layoutId="active-pill"
                                        className="absolute left-0 w-1 h-6 bg-primary rounded-full"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-white")} />
                                <span className="font-medium">{item.name}</span>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto flex flex-col gap-2">
                <Link href="/settings">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl text-muted-foreground hover:bg-white/5 hover:text-white transition-all">
                        <Settings className="w-5 h-5" />
                        <span className="font-medium">Settings</span>
                    </div>
                </Link>
                <div className="p-4 glass-card bg-primary/10 border-primary/20 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-primary" />
                        <span className="text-xs font-semibold text-primary uppercase">Status</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-white font-medium">System Live</span>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
}
