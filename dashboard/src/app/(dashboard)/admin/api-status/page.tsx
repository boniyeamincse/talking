"use client";

import { AdminPageLayout } from "@/components/dashboard/AdminPageLayout";
import { motion } from "framer-motion";

export default function ApiStatusPage() {
    const endpoints = [
        { method: "GET", path: "/api/v1/users", latency: "112ms", success: "99.9%", load: "High" },
        { method: "POST", path: "/api/v1/auth/login", latency: "245ms", success: "98.5%", load: "Medium" },
        { method: "GET", path: "/api/v1/feeds/trending", latency: "450ms", success: "99.4%", load: "Low" },
        { method: "POST", path: "/api/v1/gift/send", latency: "180ms", success: "100%", load: "Medium" },
        { method: "GET", path: "/api/v1/rooms/active", latency: "95ms", success: "99.9%", load: "High" },
    ];

    return (
        <AdminPageLayout
            title="API Status Monitor"
            subtitle="Comprehensive observability across internal and external API clusters."
            badge="ALL ENDPOINTS STABLE"
        >
            <div className="space-y-8">
                {/* API Stats Header */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: "Overall Success", value: "99.82%", color: "#34d399" },
                        { label: "Avg Latency", value: "142ms", color: "#38bdf8" },
                        { label: "Req / Minute", value: "24,812", color: "#a78bfa" },
                        { label: "Error Rate (5xx)", value: "0.04%", color: "#f87171" },
                    ].map((stat, idx) => (
                        <div key={stat.label} className="glass-card rounded-3xl p-6 border border-white/5 bg-white/2 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 blur-3xl rounded-full opacity-5 group-hover:opacity-10 transition-opacity" style={{ backgroundColor: stat.color }} />
                            <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest mb-2">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-white tracking-tight">{stat.value}</h3>
                        </div>
                    ))}
                </div>

                {/* Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Detailed Table */}
                    <div className="lg:col-span-2 glass-card rounded-[2.5rem] border border-white/5 bg-white/2 overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-white/5 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white">Endpoint Performance</h3>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Filter endpoints..."
                                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] text-white focus:outline-none focus:border-[#38bdf8]/50 transition-all"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/[0.02]">
                                        <th className="px-8 py-5 text-[10px] font-bold text-[#475569] uppercase tracking-widest">Endpont</th>
                                        <th className="px-8 py-5 text-[10px] font-bold text-[#475569] uppercase tracking-widest text-center">Latency</th>
                                        <th className="px-8 py-5 text-[10px] font-bold text-[#475569] uppercase tracking-widest text-center">Success</th>
                                        <th className="px-8 py-5 text-[10px] font-bold text-[#475569] uppercase tracking-widest text-right">Load</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {endpoints.map((ep, idx) => (
                                        <tr key={idx} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${ep.method === 'GET' ? 'text-[#38bdf8] border-[#38bdf8]/20 bg-[#38bdf8]/10' : 'text-[#a78bfa] border-[#a78bfa]/20 bg-[#a78bfa]/10'}`}>
                                                        {ep.method}
                                                    </span>
                                                    <span className="text-xs font-mono text-white/80 group-hover:text-white transition-colors">{ep.path}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className="text-xs font-bold text-white/90">{ep.latency}</span>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className="text-xs font-bold text-[#34d399]">{ep.success}</span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <span className={`text-[10px] font-bold uppercase tracking-widest ${ep.load === 'High' ? 'text-[#f87171]' : ep.load === 'Medium' ? 'text-[#facc15]' : 'text-[#34d399]'}`}>
                                                    {ep.load}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-8 bg-white/[0.01] border-t border-white/5 text-center">
                            <button className="text-[10px] font-bold text-[#475569] hover:text-white transition-colors uppercase tracking-[0.2em]">View All Routes (184 Total)</button>
                        </div>
                    </div>

                    {/* Side Visualization */}
                    <div className="space-y-6">
                        <div className="glass-card rounded-[2.5rem] p-8 border border-white/5 bg-white/2">
                            <h3 className="text-lg font-bold text-white mb-8">Node Distribution</h3>
                            <div className="space-y-8">
                                {[
                                    { l: "N. Virginia", v: 72, c: "#34d399" },
                                    { l: "Frankfurt", v: 48, c: "#38bdf8" },
                                    { l: "Singapore", v: 34, c: "#facc15" },
                                    { l: "Mumbai", v: 21, c: "#f472b6" },
                                ].map(node => (
                                    <div key={node.l} className="space-y-3">
                                        <div className="flex justify-between items-center text-[10px] font-bold">
                                            <span className="text-white/60 uppercase">{node.l}</span>
                                            <span className="text-white">{node.v} nodes</span>
                                        </div>
                                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${node.v}%` }}
                                                className="h-full rounded-full"
                                                style={{ backgroundColor: node.c }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-card rounded-[2.5rem] p-8 border border-white/5 bg-white/2">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-[#34d399]/10 border border-[#34d399]/20 flex items-center justify-center text-[#34d399] tracking-tighter font-bold">99</div>
                                <div>
                                    <h4 className="text-xs font-bold text-white uppercase tracking-widest">SLA Score</h4>
                                    <p className="text-[10px] text-[#475569]">Last 24 hours</p>
                                </div>
                            </div>
                            <p className="text-[11px] text-[#475569] leading-relaxed italic">
                                All major systems are performing above established baseline thresholds. No active
                                incident reports in the last 12 hours.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminPageLayout>
    );
}
