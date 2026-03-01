"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MENU_CONFIG, ROLE_STYLE, BADGE_STYLES } from "@/lib/menu-config";
import { AdminPageLayout } from "@/components/dashboard/AdminPageLayout";

export default function OverviewPage() {
    const [view, setView] = useState<"menu" | "table">("menu");

    const totalMenus = MENU_CONFIG.length;
    const totalSubs = MENU_CONFIG.reduce((a, m) => a + m.sub.length, 0);
    const saOnly = MENU_CONFIG.filter(m => m.role === "SA").length;
    const shared = MENU_CONFIG.filter(m => m.role === "A").length;
    const saSubCount = MENU_CONFIG.reduce((a, m) => a + m.sub.filter(s => s.role === "SA").length, 0);
    const aSubCount = MENU_CONFIG.reduce((a, m) => a + m.sub.filter(s => s.role === "A").length, 0);

    const stats = [
        { label: "Menu Groups", val: totalMenus, color: "#38bdf8" },
        { label: "Sub-items", val: totalSubs, color: "#a78bfa" },
        { label: "SA-Only Menus", val: saOnly, color: "#f472b6" },
        { label: "Shared Menus", val: shared, color: "#34d399" },
        { label: "SA Sub-items", val: saSubCount, color: "#c084fc" },
        { label: "Admin Sub-items", val: aSubCount, color: "#4ade80" },
    ];

    return (
        <AdminPageLayout
            title="Dashboard Overview"
            subtitle="Comprehensive overview of the Talkin platform menu structure and configuration."
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div className="flex gap-2 items-center">
                    {["menu", "table"].map((v) => (
                        <button
                            key={v}
                            onClick={() => setView(v as any)}
                            className={cn(
                                "px-4 py-2 rounded-lg border text-[12px] font-semibold tracking-wide transition-all duration-200 capitalize",
                                view === v
                                    ? "bg-[#38bdf8]/15 border-[#38bdf8]/35 text-[#38bdf8]"
                                    : "bg-white/4 border-white/7 text-[#475569] hover:bg-white/8"
                            )}
                        >
                            {v === "menu" ? "⊞ Menu View" : "⊟ Table View"}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-10">
                {stats.map((s) => (
                    <div key={s.label} className="relative overflow-hidden bg-white/2 border border-white/5 rounded-xl p-4 transition-transform hover:scale-[1.02]">
                        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${s.color}80, transparent)` }} />
                        <div className="text-2xl font-extrabold text-[#f1f5f9] tracking-tight">{s.val}</div>
                        <div className="text-[10px] text-[#334155] mt-1 uppercase font-medium tracking-wider">{s.label}</div>
                    </div>
                ))}
            </div>

            {view === "menu" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5">
                    {MENU_CONFIG.map((menu) => (
                        <motion.div key={menu.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/2 border border-white/6 rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#38bdf8]/40 group">
                            <div className="p-4 flex items-center gap-3 border-b border-white/5" style={{ background: `linear-gradient(90deg, ${menu.color}12, transparent)` }}>
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[16px] shrink-0 border transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: `${menu.color}18`, borderColor: `${menu.color}30`, color: menu.color }}>{menu.icon}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[13px] font-bold text-[#f1f5f9] tracking-tight">{menu.label}</div>
                                    <div className="mono text-[9px] text-[#334155] truncate">{menu.path}</div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {menu.badge && (
                                        <span className="mono text-[8px] py-0.5 px-1.5 rounded-full font-bold border" style={{ backgroundColor: BADGE_STYLES[menu.badgeType!].bg, color: BADGE_STYLES[menu.badgeType!].color, borderColor: BADGE_STYLES[menu.badgeType!].border }}>{menu.badge}</span>
                                    )}
                                    <span className="text-[10px] font-bold" style={{ color: menu.color }}>{menu.sub.length}</span>
                                </div>
                            </div>
                            <div className="p-2 py-3 space-y-0.5">
                                {menu.sub.map((sub, idx) => (
                                    <div key={idx} className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors hover:bg-white/3 group/sub">
                                        <div className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: idx % 3 === 0 ? menu.color : "#1e293b" }} />
                                        <span className="flex-1 text-[11.5px] text-[#64748b] tracking-tight group-hover/sub:text-[#94a3b8] transition-colors">{sub.label}</span>
                                        {sub.role === "SA" && (
                                            <span className="mono text-[7px] py-[1px] px-1 rounded bg-[#a78bfa]/10 border border-[#a78bfa]/15 text-[#7c3aed]">SA</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-white/1.5 border border-white/6 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="grid grid-cols-[32px_200px_1fr_60px_60px_60px] gap-0 px-5 py-3.5 bg-white/3 border-b border-white/6">
                        {["#", "Menu / Sub-item", "Route Path", "Role", "Type", "Subs"].map((h, i) => (
                            <div key={h} className={cn("mono text-[10px] text-[#334155] font-bold tracking-widest uppercase", i >= 3 ? "text-center" : "text-left")}>{h}</div>
                        ))}
                    </div>
                    <div className="divide-y divide-white/4">
                        {MENU_CONFIG.map((menu) => (
                            <div key={menu.id} className="group">
                                <div className="grid grid-cols-[32px_200px_1fr_60px_60px_60px] gap-0 px-5 py-3 transition-colors hover:bg-white/2 items-center" style={{ background: `linear-gradient(90deg, ${menu.color}06, transparent)` }}>
                                    <span className="text-[14px]" style={{ color: menu.color }}>{menu.icon}</span>
                                    <span className="text-[12.5px] font-bold text-[#e2e8f0] tracking-tight">{menu.label}</span>
                                    <span className="mono text-[10px] text-[#334155]">{menu.path}</span>
                                    <div className="flex justify-center"><span className="mono text-[9px] font-bold px-1.5 py-0.5 rounded border border-[#a78bfa]/25 bg-[#a78bfa]/10 text-[#a78bfa]">{menu.role}</span></div>
                                    <div className="flex justify-center"><span className="mono text-[9px] px-1.5 py-0.5 rounded border border-[#38bdf8]/20 bg-[#38bdf8]/10 text-[#38bdf8]">group</span></div>
                                    <div className="flex justify-center"><span className="text-[11px] font-bold" style={{ color: menu.color }}>{menu.sub.length}</span></div>
                                </div>
                                {menu.sub.map((sub, si) => (
                                    <div key={si} className="grid grid-cols-[32px_200px_1fr_60px_60px_60px] gap-0 px-5 pl-11 py-2 items-center bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                                        <span className="text-[#1e293b] text-[10px]">└</span>
                                        <span className="text-[12px] text-[#64748b] tracking-tight">{sub.label}</span>
                                        <span className="mono text-[9px] text-[#1e293b] truncate pr-4">{sub.path}</span>
                                        <div className="flex justify-center"><span className="mono text-[8px] font-bold px-1 py-0.5 rounded border border-[#a78bfa]/15 bg-[#a78bfa]/5 text-[#7c3aed]">{sub.role}</span></div>
                                        <div className="flex justify-center"><span className="mono text-[8px] px-1 py-0.5 rounded border border-white/5 bg-white/4 text-[#334155]">page</span></div>
                                        <div className="flex justify-center text-[9px] text-[#1e293b]">—</div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </AdminPageLayout>
    );
}
