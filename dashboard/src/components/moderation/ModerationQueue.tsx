"use client";

import { motion } from "framer-motion";
import {
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Eye,
    Flag,
    MessageSquare,
    ShieldAlert,
    Image as ImageIcon,
    User
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const reports = [
    {
        id: 1,
        type: "Post",
        reporter: "Sarah Smith",
        reason: "Toxic Content",
        target: "John Doe",
        content: "This is a sample reported post content that might be offensive...",
        status: "Pending",
        date: "12:45 PM"
    },
    {
        id: 2,
        type: "Comment",
        reporter: "Alex Wong",
        reason: "Spam",
        target: "Maria Garcia",
        content: "Buy cheap followers at this-link.com! Best prices!",
        status: "In Review",
        date: "11:20 AM"
    },
    {
        id: 3,
        type: "Room",
        reporter: "Admin Bot",
        reason: "Prohibited Language",
        target: "English Practice Room #42",
        content: "Audio triggers detected high levels of profanity in stream.",
        status: "Urgent",
        date: "10:05 AM"
    },
];

export function ModerationQueue() {
    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 flex flex-col gap-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Total Pending</span>
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-white">124</h3>
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Flag className="w-5 h-5" />
                        </div>
                    </div>
                </div>
                <div className="glass-card p-6 flex flex-col gap-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Urgent Alerts</span>
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-rose-500">12</h3>
                        <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                    </div>
                </div>
                <div className="glass-card p-6 flex flex-col gap-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Resolved Today</span>
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-emerald-500">86</h3>
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/2">
                    <h3 className="text-lg font-bold text-white">Active Reports</h3>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary">All Types</Badge>
                        <Badge variant="secondary">Highest Priority</Badge>
                    </div>
                </div>

                <div className="flex flex-col">
                    {reports.map((report) => (
                        <div key={report.id} className="p-6 border-b border-white/5 last:border-0 hover:bg-white/2 transition-all">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex gap-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                                        report.type === "Post" ? "bg-blue-500/10 text-blue-500" :
                                            report.type === "Comment" ? "bg-purple-500/10 text-purple-500" : "bg-amber-500/10 text-amber-500"
                                    )}>
                                        {report.type === "Post" ? <ImageIcon className="w-6 h-6" /> :
                                            report.type === "Comment" ? <MessageSquare className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-white">{report.reason}</span>
                                            <Badge variant={report.status === 'Urgent' ? 'danger' : report.status === 'In Review' ? 'warning' : 'primary'}>
                                                {report.status}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Reported by <span className="text-white font-medium">{report.reporter}</span>
                                            • Against <span className="text-white font-medium">{report.target}</span>
                                            • {report.date}
                                        </p>
                                        <div className="mt-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <p className="text-sm text-gray-300 italic">"{report.content}"</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <button className="flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-all">
                                        <Eye className="w-4 h-4" />
                                        Review
                                    </button>
                                    <button className="flex items-center justify-center gap-2 border border-emerald-500/30 text-emerald-500 px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-500/10 transition-all">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Dismiss
                                    </button>
                                    <button className="flex items-center justify-center gap-2 border border-rose-500/30 text-rose-500 px-4 py-2 rounded-xl text-xs font-bold hover:bg-rose-500/10 transition-all">
                                        <XCircle className="w-4 h-4" />
                                        Take Action
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
