"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
    MoreVertical,
    ShieldAlert,
    UserMinus,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    Search,
    Filter
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const users = [
    { id: 1, name: "Boni Yeamin", email: "boni@example.com", role: "Super Admin", status: "Active", joined: "Feb 20, 2026", country: "Bangladesh" },
    { id: 2, name: "Sarah Chen", email: "sarah@example.com", role: "Admin", status: "Active", joined: "Feb 22, 2026", country: "China" },
    { id: 3, name: "Alex Rivera", email: "alex@example.com", role: "User", status: "Warned", joined: "Feb 24, 2026", country: "Mexico" },
    { id: 4, name: "Elena Petrova", email: "elena@example.com", role: "User", status: "Active", joined: "Feb 25, 2026", country: "Russia" },
    { id: 5, name: "John Doe", email: "john@example.com", role: "User", status: "Banned", joined: "Feb 26, 2026", country: "USA" },
    { id: 6, name: "Yuki Tanaka", email: "yuki@example.com", role: "User", status: "Active", joined: "Feb 27, 2026", country: "Japan" },
];

export function UserTable() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Filter users by name, email or country..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-white/10 text-sm font-semibold hover:bg-white/5 transition-all">
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>
                    <button className="bg-primary text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-primary/30 hover:opacity-90 transition-all">
                        Add New User
                    </button>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/2">
                            <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground tracking-wider">User</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground tracking-wider">Role</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground tracking-wider">Country</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground tracking-wider underline-offset-4 decoration-primary/50 cursor-pointer hover:text-white transition-colors">Joined at</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, idx) => (
                            <tr
                                key={user.id}
                                className={cn(
                                    "group transition-all duration-200 hover:bg-white/2 border-b border-white/5 last:border-0",
                                    user.status === 'Banned' ? "opacity-60" : ""
                                )}
                            >
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center font-bold text-primary group-hover:scale-110 transition-transform">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div className="flex flex-col">
                                            <Link href={`/users/${user.id}`} className="hover:text-primary transition-colors">
                                                <span className="text-sm font-semibold text-white">{user.name}</span>
                                            </Link>
                                            <span className="text-xs text-muted-foreground">{user.email}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <Badge variant={user.role === 'Super Admin' ? 'primary' : user.role === 'Admin' ? 'secondary' : 'secondary'}>
                                        {user.role}
                                    </Badge>
                                </td>
                                <td className="px-6 py-5">
                                    <Badge variant={user.status === 'Active' ? 'success' : user.status === 'Warned' ? 'warning' : 'danger'}>
                                        {user.status}
                                    </Badge>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="text-sm text-muted-foreground">{user.country}</span>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="text-sm text-muted-foreground">{user.joined}</span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center justify-end gap-2">
                                        <button className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-primary transition-all">
                                            <ExternalLink className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-amber-500 transition-all">
                                            <ShieldAlert className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-rose-500 transition-all">
                                            <UserMinus className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-all">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                    Showing <span className="text-white font-semibold">1-6</span> of 12,482 users
                </p>
                <div className="flex items-center gap-2">
                    <button className="w-10 h-10 glass-card flex items-center justify-center text-muted-foreground hover:text-white transition-all disabled:opacity-30" disabled>
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    {[1, 2, 3, "...", 120].map((page, i) => (
                        <button
                            key={i}
                            className={cn(
                                "w-10 h-10 rounded-xl text-xs font-bold transition-all",
                                page === 1 ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-white/5 hover:text-white"
                            )}
                        >
                            {page}
                        </button>
                    ))}
                    <button className="w-10 h-10 glass-card flex items-center justify-center text-muted-foreground hover:text-white transition-all">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
