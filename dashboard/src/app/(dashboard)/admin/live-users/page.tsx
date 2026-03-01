"use client";

import { AdminPageLayout } from "@/components/dashboard/AdminPageLayout";
import { motion } from "framer-motion";

export default function LiveUsersPage() {
    const users = [
        { id: "10283", name: "Boni Yeamin", country: "Bangladesh", flag: "🇧🇩", device: "Desktop", browser: "Chrome", action: "Browsing Profile", time: "Just now" },
        { id: "10284", name: "Alex Chen", country: "United States", flag: "🇺🇸", device: "iPhone 15", browser: "Safari", action: "In Call", time: "2m ago" },
        { id: "10285", name: "Elena Volkov", country: "Russia", flag: "🇷🇺", device: "Pixel 8", browser: "Chrome", action: "Sending Gift", time: "5m ago" },
        { id: "10286", name: "Hiroshi Tanaka", country: "Japan", flag: "🇯🇵", device: "Desktop", browser: "Firefox", action: "Voice Room", time: "8m ago" },
        { id: "10287", name: "Maria Garcia", country: "Spain", flag: "🇪🇸", device: "iPad Air", browser: "Safari", action: "Browsing Feed", time: "12m ago" },
    ];

    return (
        <AdminPageLayout
            title="Live Online Users"
            subtitle="Real-time monitoring of all active sessions across the platform."
            badge="LIVE MONITOR ACTIVE"
        >
            <div className="space-y-8">
                {/* Live Counters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: "Active Sessions", value: "1,248", color: "#34d399" },
                        { label: "Mobile Users", value: "892", color: "#38bdf8" },
                        { label: "Desktop Users", value: "356", color: "#a78bfa" },
                    ].map((stat, idx) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-card rounded-3xl p-8 border border-white/5 bg-white/2 text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)` }} />
                            <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest mb-2">{stat.label}</p>
                            <h3 className="text-4xl font-bold text-white tracking-tighter">{stat.value}</h3>
                        </motion.div>
                    ))}
                </div>

                {/* Main Interface */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Map Placeholder */}
                    <div className="lg:col-span-3 glass-card rounded-[2.5rem] p-8 border border-white/5 bg-white/2 min-h-[500px] relative overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <h3 className="text-lg font-bold text-white">Global Presence</h3>
                            <div className="flex items-center gap-3">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-[#080B12] bg-white/10" />
                                    ))}
                                </div>
                                <span className="text-[10px] font-bold text-[#475569]">+1244 others</span>
                            </div>
                        </div>

                        <div className="flex-1 flex items-center justify-center relative">
                            <div className="absolute inset-0 bg-grid opacity-10" />
                            <div className="w-full h-full max-w-2xl bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center group cursor-pointer hover:bg-white/[0.07] transition-all">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-[#38bdf8]/10 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8] text-2xl animate-pulse">
                                        🌍
                                    </div>
                                    <p className="text-[10px] font-bold text-[#475569] tracking-[0.2em] uppercase">Loading WebGL Heatmap...</p>
                                </div>
                            </div>
                        </div>

                        {/* Stats Footer */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 relative z-10">
                            {['Asia: 42%', 'Europe: 28%', 'N. America: 18%', 'Others: 12%'].map(region => (
                                <div key={region} className="px-4 py-3 rounded-2xl bg-white/2 border border-white/5 text-[10px] font-bold text-white/50 text-center uppercase tracking-wider">
                                    {region}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* User Sidebar */}
                    <div className="glass-card rounded-[2.5rem] p-8 border border-white/5 bg-white/2 flex flex-col">
                        <h3 className="text-lg font-bold text-white mb-8">Latest Sessions</h3>
                        <div className="space-y-6 flex-1 overflow-auto scrollbar-hide">
                            {users.map((user, idx) => (
                                <motion.div
                                    key={user.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="p-4 rounded-3xl bg-white/2 border border-white/5 hover:bg-white/5 transition-all group"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{user.flag}</span>
                                            <span className="text-[10px] font-bold text-white/80">{user.name}</span>
                                        </div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse" />
                                    </div>
                                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">
                                        <span>{user.device}</span>
                                        <span>{user.time}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <button className="w-full py-4 mt-8 rounded-2xl bg-[#34d399]/10 border border-[#34d399]/20 text-[10px] font-bold text-[#34d399] hover:bg-[#34d399] hover:text-[#080B12] transition-all">
                            MANAGE SESSIONS
                        </button>
                    </div>
                </div>
            </div>
        </AdminPageLayout>
    );
}
