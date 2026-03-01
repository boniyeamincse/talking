"use client";

import { use } from "react";
import { MENU_CONFIG } from "@/lib/menu-config";
import { AdminPageLayout } from "@/components/dashboard/AdminPageLayout";
import { notFound } from "next/navigation";

export default function DynamicAdminPage({ params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = use(params);
    const currentPath = `/admin/${slug.join("/")}`;

    // Helper to match paths with params like /admin/users/:id
    const matchPath = (configPath: string, actualPath: string) => {
        const configSegments = configPath.split("/").filter(Boolean);
        const actualSegments = actualPath.split("/").filter(Boolean);

        if (configSegments.length !== actualSegments.length) return false;

        return configSegments.every((seg, i) => {
            if (seg.startsWith(":")) return true; // It's a param
            return seg === actualSegments[i];
        });
    };

    // 1. Check for top-level menu match
    const topMenu = MENU_CONFIG.find(m => matchPath(m.path, currentPath));

    // 2. Check for sub-item match
    let activeSub = null;
    let parentMenu = null;

    for (const menu of MENU_CONFIG) {
        const sub = menu.sub.find(s => matchPath(s.path, currentPath));
        if (sub) {
            activeSub = sub;
            parentMenu = menu;
            break;
        }
    }

    // If topMenu matches but there's also a sub-item with same path, prioritize sub-item context for details
    const displayTitle = activeSub ? activeSub.label : (topMenu ? topMenu.label : "Module");
    const displayIcon = parentMenu ? parentMenu.icon : (topMenu ? topMenu.icon : "⊡");
    const displayColor = parentMenu ? parentMenu.color : (topMenu ? topMenu.color : "#38bdf8");
    const isSA = activeSub ? activeSub.role === "SA" : (topMenu ? topMenu.role === "SA" : false);

    if (!topMenu && !activeSub) {
        // Check if we are at least in a known top-level prefix
        const prefixMatch = MENU_CONFIG.find(m => currentPath.startsWith(m.path));
        if (!prefixMatch) return notFound();

        // If prefix matches but exact path doesn't, we still show a themed "Not Found" or "Placeholder"
        return (
            <AdminPageLayout
                title="Page Not Found"
                subtitle={`The path ${currentPath} is not defined in the configuration.`}
            >
                <div className="glass-card rounded-3xl p-20 border border-white/5 bg-white/2 flex flex-col items-center justify-center text-center">
                    <div className="text-4xl mb-4">🔍</div>
                    <h2 className="text-xl font-bold text-white mb-2">Endpoint Missing</h2>
                    <p className="text-[#64748b]">Please check the menu configuration or contact system admin.</p>
                </div>
            </AdminPageLayout>
        );
    }

    return (
        <AdminPageLayout
            title={displayTitle}
            subtitle={`Management interface for the ${displayTitle} module.`}
            badge={isSA ? "SUPER ADMIN ACCESS" : undefined}
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card rounded-3xl p-10 border border-white/5 bg-white/2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 blur-[100px] rounded-full opacity-20" style={{ backgroundColor: displayColor }} />

                    <div className="relative z-10">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-6 border animate-pulse"
                            style={{ backgroundColor: `${displayColor}15`, borderColor: `${displayColor}30`, color: displayColor }}
                        >
                            {displayIcon}
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-4">{displayTitle} Module</h2>
                        <p className="text-[#64748b] leading-relaxed max-w-xl mb-8">
                            This module is currently in active development. All data structures and API integrations
                            have been mapped in the configuration. The live interface will be available in the
                            next development cycle.
                        </p>

                        <div className="flex flex-wrap gap-3">
                            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-[#e2e8f0]">PREVIEW MODE</div>
                            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-[#e2e8f0]">API MAPPED</div>
                            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-[#e2e8f0]">STUBBED</div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-card rounded-3xl p-8 border border-white/5 bg-white/2">
                        <h3 className="text-xs font-bold text-white mb-6 uppercase tracking-widest opacity-50">Quick Stats</h3>
                        <div className="space-y-4">
                            {[
                                { l: "Status", v: "Operational", c: "#34d399" },
                                { l: "Access", v: isSA ? "Restricted" : "Shared", c: isSA ? "#f87171" : "#38bdf8" },
                                { l: "Path", v: currentPath, c: "#94a3b8" }
                            ].map(s => (
                                <div key={s.l} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                                    <span className="text-[11px] text-[#475569] font-bold">{s.l}</span>
                                    <span className="mono text-[10px] font-bold" style={{ color: s.c }}>{s.v}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card rounded-3xl p-8 border border-white/5 bg-white/2">
                        <h3 className="text-xs font-bold text-white mb-6 uppercase tracking-widest opacity-50">Config Object</h3>
                        <pre className="text-[9px] text-[#334155] mono overflow-auto h-40 scrollbar-hide">
                            {JSON.stringify(activeSub || topMenu, null, 2)}
                        </pre>
                    </div>
                </div>
            </div>
        </AdminPageLayout>
    );
}
