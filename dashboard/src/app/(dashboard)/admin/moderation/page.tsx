import { AdminPageLayout } from "@/components/dashboard/AdminPageLayout";

export default function ModerationPage() {
    return (
        <AdminPageLayout title="Content Moderation" subtitle="Review reported content, manage bans, and configure automated filtering." badge="QUEUE · 38 PENDING">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card rounded-3xl p-8 border border-white/5 bg-white/2">
                    <h2 className="text-xl font-bold text-white mb-6">Report Queue</h2>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-5 rounded-3xl bg-white/2 border border-white/5 flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <span className="px-2 py-0.5 rounded bg-red-400/10 text-red-400 text-[10px] font-bold border border-red-400/20">HARASSMENT</span>
                                    <span className="text-[10px] text-[#334155] mono">2 mins ago</span>
                                </div>
                                <p className="text-sm text-[#94a3b8] italic">"User posted offensive content in the general voice room..."</p>
                                <div className="flex gap-2 mt-2">
                                    <button className="flex-1 py-2 rounded-xl bg-red-400/10 text-red-400 text-[11px] font-bold border border-red-400/20">BAN USER</button>
                                    <button className="flex-1 py-2 rounded-xl bg-white/5 text-[#94a3b8] text-[11px] font-bold border border-white/10">DISMISS</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="glass-card rounded-3xl p-8 border border-white/5 bg-white/2">
                        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">AI Status</h3>
                        <div className="flex items-center gap-3 mb-6"><div className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse" /><span className="text-xs text-[#34d399] font-bold">ACTIVE SCANNING</span></div>
                        <p className="text-[11px] text-[#475569] leading-relaxed">Automated filtering is blocking approximately 1,200 spam messages per hour.</p>
                    </div>
                </div>
            </div>
        </AdminPageLayout>
    );
}
