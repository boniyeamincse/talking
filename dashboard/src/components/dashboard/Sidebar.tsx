"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { MENU_CONFIG, ROLE_STYLE, BADGE_STYLES, Role } from "@/lib/menu-config";
import { useAuth } from "@/lib/auth-context";

export function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
    const [searchQuery, setSearchQuery] = useState("");

    const currentRole: Role = user?.role === 'super_admin' ? 'SA' : 'A';

    const toggleMenu = (id: string) => {
        setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const filteredMenu = useMemo(() => {
        if (!searchQuery) return MENU_CONFIG;
        const q = searchQuery.toLowerCase();
        return MENU_CONFIG.filter((m) =>
            m.label.toLowerCase().includes(q) ||
            m.sub.some(s => s.label.toLowerCase().includes(q))
        );
    }, [searchQuery]);

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 bottom-0 z-50 flex flex-col glass transition-all duration-300 ease-in-out",
                collapsed ? "w-16" : "w-68"
            )}
        >
            <div className="topbar-glow" />

            {/* Logo Section */}
            <div className={cn(
                "flex items-center gap-3 border-b border-white/5",
                collapsed ? "p-4 justify-center" : "p-6 py-[22px]"
            )}>
                <div className="w-9.5 h-9.5 rounded-xl bg-gradient-to-br from-[#38bdf8] via-[#a78bfa] to-[#f472b6] flex items-center justify-center font-extrabold text-lg text-white shadow-[0_0_24px_rgba(56,189,248,0.35)] shrink-0">
                    T
                </div>
                {!collapsed && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fade-in">
                        <div className="font-bold text-[15px] text-[#f1f5f9] tracking-tight leading-tight">Talkin</div>
                        <div className="mono text-[9px] text-[#334155] tracking-[0.1em] uppercase">super admin</div>
                    </motion.div>
                )}
            </div>

            {/* Search Section */}
            {!collapsed && (
                <div className="p-3 px-3.5 pb-1.5 fade-in">
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-2 px-3">
                        <span className="text-[#334155] text-xs">⌕</span>
                        <input
                            className="bg-transparent border-none outline-none text-[#cbd5e1] text-[12px] w-full placeholder:text-[#334155]"
                            placeholder="Search menus..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="text-[#334155] text-[11px] hover:text-white transition-colors">✕</button>
                        )}
                    </div>
                </div>
            )}

            {/* Role Legend */}
            {!collapsed && (
                <div className="p-3 px-3.5 pt-1.5 flex gap-1.5">
                    <div className="flex-1 py-1 rounded-md text-center border border-[#a78bfa]/25 bg-[#a78bfa]/10 text-[#a78bfa] text-[9px] font-bold mono uppercase">
                        SA · SUPER
                    </div>
                    <div className="flex-1 py-1 rounded-md text-center border border-[#34d399]/20 bg-[#34d399]/10 text-[#34d399] text-[9px] font-bold mono uppercase">
                        A · ADMIN
                    </div>
                </div>
            )}

            {/* Menu Count */}
            {!collapsed && (
                <div className="mono px-4.5 pt-1 pb-2 text-[9px] tracking-[0.12em] text-[#1e293b] uppercase">
                    {filteredMenu.length} / {MENU_CONFIG.length} menus
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto custom-scrollbar pt-1 pb-4">
                {filteredMenu.map((menu) => {
                    const isOpen = openMenus[menu.id];
                    const isActive = pathname.startsWith(menu.path);
                    const badge = menu.badge ? BADGE_STYLES[menu.badgeType!] : null;

                    return (
                        <div key={menu.id} className="mb-0.5">
                            <button
                                onClick={() => !collapsed && toggleMenu(menu.id)}
                                className={cn(
                                    "w-[calc(100%-12px)] mx-1.5 rounded-lg flex items-center gap-2.5 transition-all duration-200 group relative",
                                    collapsed ? "p-2.5 justify-center" : "p-2 px-3",
                                    isActive ? "bg-gradient-to-r from-[#38bdf8]/10 to-[#a78bfa]/5 border-l-2" : "bg-transparent border-l-2 border-transparent"
                                )}
                                style={{ borderLeftColor: isActive ? menu.color : 'transparent' }}
                            >
                                {isActive && !collapsed && (
                                    <div
                                        className="absolute left-[-2px] top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-sm"
                                        style={{ background: menu.color, boxShadow: `0 0 8px ${menu.color}80` }}
                                    />
                                )}

                                <span
                                    className="text-[15px] w-[18px] text-center transition-transform duration-200 group-hover:scale-110"
                                    style={{ color: isActive ? menu.color : '#334155' }}
                                >
                                    {menu.icon}
                                </span>

                                {!collapsed && (
                                    <>
                                        <span className={cn(
                                            "flex-1 text-left text-[13px] tracking-tight transition-colors duration-200",
                                            isActive ? "font-semibold text-[#f1f5f9]" : "font-normal text-[#94a3b8]"
                                        )}>
                                            {menu.label}
                                        </span>

                                        <div className="flex items-center gap-1">
                                            <span className="mono text-[8px] py-0.5 px-1.5 rounded bg-white/5 border border-white/10 text-[#334155]">
                                                {menu.sub.length}
                                            </span>
                                            <span
                                                className={cn("text-[9px] text-[#334155] transition-transform duration-300", isOpen && "rotate-180")}
                                            >
                                                ▾
                                            </span>
                                        </div>
                                    </>
                                )}
                            </button>

                            {/* Submenu */}
                            <AnimatePresence>
                                {isOpen && !collapsed && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden bg-white/[0.01]"
                                    >
                                        {menu.sub.map((sub, idx) => {
                                            const isSubActive = pathname === sub.path;
                                            return (
                                                <Link key={idx} href={sub.path}>
                                                    <div className={cn(
                                                        "flex items-center gap-2.5 py-1.5 px-3 pl-10 mx-1.5 rounded-md transition-all duration-200 group/sub",
                                                        isSubActive ? "bg-[#38bdf8]/8" : "hover:bg-white/5"
                                                    )}>
                                                        <div className="relative flex items-center justify-center w-2">
                                                            <div
                                                                className={cn(
                                                                    "rounded-full transition-all duration-200",
                                                                    isSubActive ? "w-1.5 h-1.5 shadow-[0_0_6px]" : "w-1 h-1 bg-[#1e293b]"
                                                                )}
                                                                style={{
                                                                    backgroundColor: isSubActive ? menu.color : undefined,
                                                                    boxShadow: isSubActive ? `0 0 6px ${menu.color}` : undefined
                                                                }}
                                                            />
                                                        </div>
                                                        <span className={cn(
                                                            "text-[12px] tracking-tight transition-colors",
                                                            isSubActive ? "text-[#e2e8f0] font-medium" : "text-[#475569] group-hover/sub:text-[#94a3b8]"
                                                        )}>
                                                            {sub.label}
                                                        </span>
                                                        {sub.role === "SA" && (
                                                            <span className="mono text-[7px] py-[1px] px-1 rounded bg-[#a78bfa]/10 border border-[#a78bfa]/15 text-[#7c3aed] ml-auto">
                                                                SA
                                                            </span>
                                                        )}
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </nav>

            {/* Collapse Button */}
            <div className="p-2.5 border-t border-white/5 space-y-2">
                {!collapsed && user && (
                    <div className="px-2 py-1.5 text-[11px] text-[#94a3b8] truncate">
                        {user.name}
                    </div>
                )}
                <button
                    onClick={() => logout()}
                    className="w-full flex items-center justify-center gap-2 py-2 px-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all duration-200 mb-2"
                >
                    <span className="text-xs">⎋</span>
                    {!collapsed && <span className="mono text-[10px] uppercase tracking-wider">Logout</span>}
                </button>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-2.5 rounded-lg bg-white/[0.03] border border-white/[0.07] text-[#334155] hover:bg-white/[0.08] transition-all duration-200 group"
                >
                    <span className={cn("text-xs transition-transform duration-300", collapsed && "rotate-180")}>
                        ◁
                    </span>
                    {!collapsed && <span className="mono text-[10px] uppercase tracking-wider">Collapse</span>}
                </button>
            </div>
        </aside>
    );
}
