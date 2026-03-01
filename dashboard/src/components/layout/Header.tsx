"use client";

import { Bell, Search, User } from "lucide-react";
import { motion } from "framer-motion";

export function Header() {
    return (
        <header className="fixed top-4 left-72 right-4 h-20 glass rounded-3xl px-8 flex items-center justify-between z-40">
            <div className="relative w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search analytics, users or logs..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all"
                />
            </div>

            <div className="flex items-center gap-6">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative w-12 h-12 glass-card flex items-center justify-center"
                >
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                </motion.button>

                <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                    <div className="text-right flex flex-col">
                        <span className="text-sm font-semibold text-white">Boni Yeamin</span>
                        <span className="text-xs text-primary font-bold uppercase tracking-tighter">Super Admin</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl border-2 border-primary/30 p-1">
                        <div className="w-full h-full rounded-xl bg-muted flex items-center justify-center">
                            <User className="w-6 h-6 text-muted-foreground" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
