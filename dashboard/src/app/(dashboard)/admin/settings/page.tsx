import { AdminPageLayout } from "@/components/dashboard/AdminPageLayout";

export default function SettingsPage() {
    return (
        <AdminPageLayout title="Platform Settings" subtitle="Core platform configuration, API keys, server settings, and feature flags.">
            <div className="glass-card rounded-3xl p-8 border border-white/5 bg-white/2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[{ g: "System Controls", items: ["Maintenance Mode", "Feature Flags", "Rate Limits"] }].map(group => (
                        <div key={group.g} className="space-y-4">
                            <h3 className="text-[10px] text-[#334155] font-bold uppercase tracking-widest border-b border-white/5 pb-2">{group.g}</h3>
                            <div className="space-y-2">{group.items.map(item => (<div key={item} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"><span className="text-xs text-[#94a3b8] group-hover:text-white">{item}</span></div>))}</div>
                        </div>
                    ))}
                </div>
            </div>
        </AdminPageLayout>
    );
}
