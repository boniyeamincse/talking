"use client";

import { AdminPageLayout } from "@/components/dashboard/AdminPageLayout";
import { motion } from "framer-motion";

export default function QuickActionsPage() {
    const actions = [
        { title: "Cache Management", icon: "⚡", actions: ["Clear Global Cache", "Flush Route Cache", "Warm Image Cache"], color: "#38bdf8" },
        { title: "Site Controls", icon: "⚙️", actions: ["Toggle Maintenance", "Backup Database", "Restart Workers"], color: "#facc15" },
        { title: "Security Protocols", icon: "🛡️", actions: ["Lock Admin Logins", "Flush 2FA Tokens", "IP Ban Reset"], color: "#f87171" },
        { title: "Economy Tools", icon: "💰", actions: ["Recalculate Ledger", "Sync Stripe Subs", "Audit Gift Revenue"], color: "#34d399" },
        { title: "Communication", icon: "📢", actions: ["Global Announcement", "Flush FCM Queue", "Email System Test"], color: "#a78bfa" },
        { title: "Developer Tools", icon: "🛠️", actions: ["Download API Logs", "View Horizon Dash", "Toggle Debug Mode"], color: "#94a3b8" },
    ];

    return (
        <AdminPageLayout
            title="Quick Actions"
            subtitle="Administrative command center for rapid system interventions."
            badge="READY FOR COMMANDS"
        >
            <div className="space-y-10">
                {/* Warning Alert */}
                <div className="p-6 rounded-3xl bg-red-500/5 border border-red-500/20 flex gap-6 items-center">
                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 text-xl font-bold">!</div>
                    <div>
                        <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">Administrative Note</h4>
                        <p className="text-[10px] text-red-400/60 leading-relaxed font-medium">
                            Actions performed here are logged in the persistent audit log. Some destructive actions may
                            require secondary confirmation or lead to brief service interruptions.
                        </p>
                    </div>
                </div>

                {/* Action Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {actions.map((group, idx) => (
                        <motion.div
                            key={group.title}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-card rounded-[2.5rem] p-10 border border-white/5 bg-white/2 flex flex-col items-center text-center relative overflow-hidden group hover:border-white/10 transition-all shadow-xl"
                        >
                            {/* Visual Flair */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 blur-[60px] rounded-full opacity-5 group-hover:opacity-10 transition-opacity" style={{ backgroundColor: group.color }} />

                            <div
                                className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl mb-8 border transition-transform group-hover:scale-110 duration-500"
                                style={{ backgroundColor: `${group.color}10`, borderColor: `${group.color}20`, color: group.color }}
                            >
                                {group.icon}
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2">{group.title}</h3>
                            <p className="text-[10px] font-bold text-[#475569] uppercase tracking-[0.2em] mb-10">Direct Intervention</p>

                            <div className="w-full space-y-3">
                                {group.actions.map(action => (
                                    <button
                                        key={action}
                                        className="w-full py-4 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-bold text-[#e2e8f0] hover:bg-white/10 hover:border-white/20 transition-all uppercase tracking-widest"
                                    >
                                        {action}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Console Box */}
                <div className="glass-card rounded-[2.5rem] p-10 border border-white/5 bg-white/2 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Live Activity Stream</h3>
                                <p className="text-xs text-[#475569]">Monitoring recent administrative commands across all regions.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]" />
                                    <span className="text-[10px] font-bold text-[#475569] uppercase">Secure connection</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 rounded-3xl bg-black/40 border border-white/5 font-mono text-[11px] leading-relaxed text-[#64748b] h-[150px] overflow-auto scrollbar-hide">
                            <div className="flex gap-4">
                                <span className="text-[#34d399]">01:00:24</span>
                                <span className="text-[#38bdf8] font-bold">[SYS]</span>
                                <span>Monitoring service initialized. All regional hubs connected.</span>
                            </div>
                            <div className="flex gap-4 mt-2">
                                <span className="text-[#34d399]">01:00:28</span>
                                <span className="text-[#facc15] font-bold">[AUTH]</span>
                                <span>Admin @boni logged in from authenticated IP 10.24.50.129.</span>
                            </div>
                            <div className="flex gap-4 mt-2">
                                <span className="text-[#34d399]">01:00:45</span>
                                <span className="text-[#ff7eb6] font-bold">[ACTION]</span>
                                <span>System scan for 'Platform Health' initiated. Results cached.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminPageLayout>
    );
}
