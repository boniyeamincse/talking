"use client";

import { AdminPageLayout } from "@/components/dashboard/AdminPageLayout";
import { motion } from "framer-motion";

export default function OverviewPage() {
    const stats = [
        { label: "Total Revenue", value: "$428,291", trend: "+12.5%", color: "#34d399" },
        { label: "Active Users", value: "84,192", trend: "+4.2%", color: "#38bdf8" },
        { label: "Avg Session", value: "18m 42s", trend: "-2.1%", color: "#facc15" },
        { label: "Support Tickets", value: "24", trend: "-18%", color: "#f87171" },
    ];

    const recentActivity = [
        { user: "Alex M.", action: "purchased 'Mega Dragon' gift", time: "2 min ago", icon: "💎" },
        { user: "Sarah L.", action: "started a Diamond Room", time: "5 min ago", icon: "🎙️" },
        { user: "Admin K.", action: "banned user @spammer99", time: "12 min ago", icon: "🛡️" },
        { user: "System", action: "API Gateway scaling triggered", time: "15 min ago", icon: "⚙️" },
    ];

    return (
        <AdminPageLayout
            title="Overview & KPIs"
            subtitle="High-level platform health indicators and core performance metrics."
        >
            <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-card rounded-[2rem] p-6 border border-white/5 bg-white/2 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full opacity-10 transition-opacity group-hover:opacity-20" style={{ backgroundColor: stat.color }} />
                            <div className="relative z-10">
                                <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest mb-2">{stat.label}</p>
                                <div className="flex items-end justify-between">
                                    <h3 className="text-3xl font-bold text-white tracking-tight">{stat.value}</h3>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg border" style={{ borderColor: `${stat.color}30`, color: stat.color, backgroundColor: `${stat.color}10` }}>
                                        {stat.trend}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Chart Placeholder */}
                    <div className="lg:col-span-2 glass-card rounded-[2.5rem] p-8 border border-white/5 bg-white/2 min-h-[400px] flex flex-col">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">Growth Analytics</h3>
                                <p className="text-xs text-[#475569]">User acquisition vs Revenue (last 30 days)</p>
                            </div>
                            <div className="flex gap-2">
                                {['Day', 'Week', 'Month'].map(t => (
                                    <button key={t} className={`px-4 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${t === 'Month' ? 'bg-white/10 border-white/10 text-white' : 'border-transparent text-[#475569] hover:text-white'}`}>
                                        {t.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 flex items-center justify-center relative">
                            <div className="absolute inset-0 bg-grid opacity-20" />
                            <div className="flex flex-col items-center gap-4 relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20">
                                    📊
                                </div>
                                <p className="text-[10px] uppercase tracking-widest font-bold text-[#475569]">Chart Engine Initializing...</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Recent Activity */}
                    <div className="glass-card rounded-[2.5rem] p-8 border border-white/5 bg-white/2 flex flex-col">
                        <h3 className="text-lg font-bold text-white mb-6">Live Stream</h3>
                        <div className="space-y-6 flex-1">
                            {recentActivity.map((item, idx) => (
                                <div key={idx} className="flex gap-4 group">
                                    <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-lg shrink-0 group-hover:bg-white/10 transition-colors">
                                        {item.icon}
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <p className="text-xs text-white/90 leading-snug">
                                            <span className="font-bold">{item.user}</span> {item.action}
                                        </p>
                                        <span className="text-[10px] text-[#475569] font-medium mt-1">{item.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full py-4 mt-8 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-bold text-[#475569] hover:bg-white/10 hover:text-white transition-all">
                            VIEW FULL AUDIT LOG
                        </button>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="glass-card rounded-3xl p-6 border border-white/5 bg-white/2">
                        <h4 className="text-xs font-bold text-[#475569] uppercase tracking-widest mb-4">Platform Version</h4>
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1 rounded-lg bg-[#38bdf8]/10 border border-[#38bdf8]/20 text-[#38bdf8] text-[10px] font-mono font-bold">v4.6.2-STABLE</div>
                            <span className="text-[10px] text-[#34d399] flex items-center gap-1 font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse" />
                                Latest
                            </span>
                        </div>
                    </div>

                    <div className="glass-card rounded-3xl p-6 border border-white/5 bg-white/2">
                        <h4 className="text-xs font-bold text-[#475569] uppercase tracking-widest mb-4">API Response</h4>
                        <div className="flex items-center justify-between">
                            <div className="text-2xl font-bold text-white">124ms</div>
                            <div className="text-[10px] font-bold text-[#34d399]">EXCELLENT</div>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
                            <div className="h-full bg-[#34d399] w-[85%]" />
                        </div>
                    </div>

                    <div className="glass-card rounded-3xl p-6 border border-white/5 bg-white/2">
                        <h4 className="text-xs font-bold text-[#475569] uppercase tracking-widest mb-4">Storage Usage</h4>
                        <div className="flex items-center justify-between">
                            <div className="text-2xl font-bold text-white">2.4 TB</div>
                            <div className="text-[10px] font-bold text-[#facc15]">64% FULL</div>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
                            <div className="h-full bg-[#facc15] w-[64%]" />
                        </div>
                    </div>
                </div>
            </div>
        </AdminPageLayout>
    );
}
