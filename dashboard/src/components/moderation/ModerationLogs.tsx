"use client";

import { motion } from "framer-motion";
import {
    History,
    UserMinus,
    ShieldAlert,
    RefreshCcw,
    Search
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const logs = [
    { id: 1, admin: "Boni Yeamin", action: "Banned User", target: "John Doe", reason: "Repeated spamming", date: "Feb 28, 2026 10:30 PM" },
    { id: 2, admin: "Sarah Chen", action: "Warned User", target: "Alex Rivera", reason: "Inappropriate language", date: "Feb 28, 2026 09:15 PM" },
    { id: 3, admin: "Boni Yeamin", action: "Changed Role", target: "Elena Petrova", reason: "Promotion to Admin", date: "Feb 27, 2026 04:20 PM" },
    { id: 4, admin: "System", action: "Auto-Flagged", target: "SpamBot_99", reason: "Heuristic pattern match", date: "Feb 27, 2026 02:00 PM" },
];

export function ModerationLogs() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" />
                    Recent Actions
                </h3>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-primary/50 transition-all"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-3">
                {logs.map((log) => (
                    <div key={log.id} className="glass-card p-4 flex items-center justify-between gap-4 border-l-4 border-l-primary/30">
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                log.action.includes("Ban") ? "bg-rose-500/10 text-rose-500" :
                                    log.action.includes("Warn") ? "bg-amber-500/10 text-amber-500" : "bg-primary/10 text-primary"
                            )}>
                                {log.action.includes("Ban") ? <UserMinus className="w-5 h-5" /> :
                                    log.action.includes("Warn") ? <ShieldAlert className="w-5 h-5" /> : <RefreshCcw className="w-5 h-5" />}
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-white">{log.admin}</span>
                                    <span className="text-xs text-muted-foreground">{log.action}</span>
                                    <span className="text-sm font-bold text-white tracking-tight">@{log.target}</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Reason: {log.reason}</p>
                            </div>
                        </div>
                        <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                            {log.date}
                        </span>
                    </div>
                ))}
            </div>

            <button className="w-full py-3 rounded-2xl border border-white/10 text-xs font-bold hover:bg-white/5 transition-all text-muted-foreground uppercase tracking-widest">
                Load More Logs
            </button>
        </div>
    );
}
