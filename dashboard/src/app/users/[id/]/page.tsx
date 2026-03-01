"use client";

import { motion } from "framer-motion";
import {
    ArrowLeft,
    Mail,
    MapPin,
    Calendar,
    Shield,
    Award,
    Clock,
    MessageSquare,
    Phone,
    Gift,
    Heart
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

// Mock user data for a specific user
const userData = {
    id: "1",
    name: "Boni Yeamin",
    email: "boni@example.com",
    role: "Super Admin",
    status: "Active",
    joined: "February 20, 2026",
    country: "Bangladesh",
    bio: "Full-stack developer and AI enthusiast building the future of cultural exchange.",
    stats: {
        followers: "1,240",
        following: "450",
        giftsRecv: "82",
        roomsHosted: "15"
    },
    activities: [
        { type: "Chat", description: "Sent a message in 'Main Global Room'", time: "2 hours ago" },
        { type: "Call", description: "Completed a 15-minute voice call with Sarah Chen", time: "5 hours ago" },
        { type: "Gift", description: "Received a 'Golden Dragon' gift from Alex Wong", time: "Yesterday" },
    ]
};

export default function UserDetailPage() {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center gap-4">
                <Link href="/users">
                    <button className="p-3 glass-card hover:bg-white/5 text-muted-foreground transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">{userData.name}</h2>
                    <p className="text-muted-foreground">User Profile & Resource Management</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Col: Profile Info */}
                <div className="lg:col-span-1 flex flex-col gap-8">
                    <div className="glass-card p-8 flex flex-col items-center text-center gap-6">
                        <div className="w-32 h-32 rounded-3xl bg-primary/20 border-4 border-primary/30 p-1">
                            <div className="w-full h-full rounded-2xl bg-muted flex items-center justify-center text-3xl font-bold text-primary">
                                {userData.name.charAt(0)}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">{userData.name}</h3>
                            <p className="text-sm text-muted-foreground">{userData.email}</p>
                        </div>
                        <div className="flex gap-2">
                            <Badge variant="primary">{userData.role}</Badge>
                            <Badge variant="success">{userData.status}</Badge>
                        </div>
                        <div className="w-full h-px bg-white/5" />
                        <div className="grid grid-cols-2 w-full gap-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-lg font-bold text-white">{userData.stats.followers}</span>
                                <span className="text-xs text-muted-foreground uppercase">Followers</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-lg font-bold text-white">{userData.stats.giftsRecv}</span>
                                <span className="text-xs text-muted-foreground uppercase">Gifts</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6 flex flex-col gap-4">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Contact & Location</h4>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Mail className="w-4 h-4 text-primary" />
                                {userData.email}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <MapPin className="w-4 h-4 text-primary" />
                                {userData.country}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4 text-primary" />
                                Joined {userData.joined}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Col: Tabs and Content */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                    <div className="glass-card p-8 flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <h4 className="text-lg font-bold text-white tracking-tight">Recent Activity</h4>
                            <Badge variant="secondary">All Time</Badge>
                        </div>
                        <div className="flex flex-col gap-6">
                            {userData.activities.map((act, i) => (
                                <div key={i} className="flex gap-4 relative">
                                    {i !== userData.activities.length - 1 && (
                                        <div className="absolute left-6 top-10 bottom-0 w-px bg-white/5" />
                                    )}
                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                                        {act.type === "Chat" ? <MessageSquare className="w-5 h-5 text-emerald-500" /> :
                                            act.type === "Call" ? <Phone className="w-5 h-5 text-blue-500" /> : <Gift className="w-5 h-5 text-amber-500" />}
                                    </div>
                                    <div className="flex flex-col py-1">
                                        <p className="text-sm text-white font-medium">{act.description}</p>
                                        <span className="text-xs text-muted-foreground">{act.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="glass-card p-8 flex flex-col gap-6 border-emerald-500/20">
                            <div className="flex items-center gap-3">
                                <Award className="w-6 h-6 text-emerald-500" />
                                <h4 className="text-lg font-bold text-white">Trust Score</h4>
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-5xl font-black text-emerald-500">98</span>
                                <span className="text-muted-foreground pb-2">/ 100</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                High trust score indicates positive community interactions and no history of severe reports.
                            </p>
                        </div>

                        <div className="glass-card p-8 flex flex-col gap-6">
                            <h4 className="text-lg font-bold text-white flex items-center gap-2">
                                <Shield className="w-5 h-5 text-primary" />
                                Quick Actions
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                <button className="p-3 rounded-xl border border-white/10 text-xs font-bold hover:bg-white/5 transition-all">
                                    Edit Profile
                                </button>
                                <button className="p-3 rounded-xl border border-white/10 text-xs font-bold hover:bg-white/5 transition-all text-amber-500">
                                    Send Warning
                                </button>
                                <button className="p-3 rounded-xl border border-white/10 text-xs font-bold hover:bg-white/5 transition-all text-rose-500">
                                    Ban Account
                                </button>
                                <button className="bg-primary text-white p-3 rounded-xl text-xs font-bold hover:opacity-90 transition-all">
                                    Message
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
