"use client";

import { AdminPageLayout } from "@/components/dashboard/AdminPageLayout";
import { motion } from "framer-motion";

export default function PlatformHealthPage() {
    const services = [
        { name: "Primary Database", status: "Operational", uptime: "99.98%", latency: "12ms", color: "#34d399" },
        { name: "Redis Cache Cluster", status: "Operational", uptime: "100%", latency: "0.8ms", color: "#34d399" },
        { name: "S3 Audio Storage", status: "Operational", uptime: "99.99%", latency: "45ms", color: "#34d399" },
        { name: "TURN/STUN Service", status: "Degraded", uptime: "98.4%", latency: "210ms", color: "#facc15" },
        { name: "FCM Push Service", status: "Operational", uptime: "99.99%", latency: "85ms", color: "#34d399" },
        { name: "Algolia Search Engine", status: "Operational", uptime: "100%", latency: "14ms", color: "#34d399" },
    ];

    return (
        <AdminPageLayout
            title="Platform Health"
            subtitle="Full-stack telemetry and infrastructure status monitoring."
            badge="SYSTEMS OPERATIONAL"
        >
            <div className="space-y-8">
                {/* Resource usage row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: "CPU LOAD", value: "24%", color: "#34d399" },
                        { label: "MEMORY USAGE", value: "6.2GB / 16GB", color: "#38bdf8" },
                        { label: "DISK I/O", value: "11.4 MB/s", color: "#a78bfa" },
                        { label: "NETWORK", value: "840 Mbps", color: "#f472b6" },
                    ].map((stat, idx) => (
                        <div key={stat.label} className="glass-card rounded-3xl p-6 border border-white/5 bg-white/2 relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest mb-2">{stat.label}</p>
                                <h3 className="text-xl font-bold text-white">{stat.value}</h3>
                                <div className="w-full h-1 bg-white/5 rounded-full mt-4 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: stat.value.includes('%') ? stat.value : '40%' }}
                                        className="h-full"
                                        style={{ backgroundColor: stat.color }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Services List */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {services.map((service, idx) => (
                        <motion.div
                            key={service.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="glass-card rounded-[2rem] p-6 border border-white/5 bg-white/2 flex items-center justify-between group hover:bg-white/[0.04] transition-all"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl" style={{ backgroundColor: `${service.color}10`, color: service.color, border: `1px solid ${service.color}20` }}>
                                    {service.status === 'Operational' ? '✓' : '!'}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white/90 group-hover:text-white transition-colors">{service.name}</h4>
                                    <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest">{service.status}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-8 pr-4">
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-[#475569] uppercase tracking-tight mb-1">Uptime</p>
                                    <p className="text-xs font-bold text-white/80">{service.uptime}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-[#475569] uppercase tracking-tight mb-1">Latency</p>
                                    <p className="text-xs font-bold text-white/80">{service.latency}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Detailed Logs Box */}
                <div className="glass-card rounded-[2.5rem] p-10 border border-white/5 bg-white/2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#38bdf8]/5 blur-[120px] rounded-full" />
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Cloud Infrastructure</h3>
                                <p className="text-xs text-[#475569]">Last scan performed 42 seconds ago across 3 regions.</p>
                            </div>
                            <button className="px-6 py-2.5 rounded-2xl bg-[#38bdf8]/10 text-[#38bdf8] text-[10px] font-bold border border-[#38bdf8]/20 hover:bg-[#38bdf8]/20 transition-all">
                                RUN DEEP DIAGNOSTIC
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {[
                                { label: "US-EAST (Virginia)", status: "Active", load: 0.12 },
                                { label: "EU-WEST (Dublin)", status: "Active", load: 0.45 },
                                { label: "AS-SOUTH (Mumbai)", status: "Active", load: 0.28 },
                            ].map(region => (
                                <div key={region.label} className="p-6 rounded-3xl bg-white/2 border border-white/5">
                                    <div className="flex justify-between items-center mb-6">
                                        <span className="text-[10px] font-bold text-white/60 uppercase">{region.label}</span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]" />
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <span className="text-xs font-bold text-[#475569]">System Load</span>
                                        <span className="text-lg font-bold text-white">{(region.load * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-white/5 rounded-full mt-4 overflow-hidden">
                                        <div className="h-full bg-[#38bdf8]" style={{ width: `${region.load * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminPageLayout>
    );
}
