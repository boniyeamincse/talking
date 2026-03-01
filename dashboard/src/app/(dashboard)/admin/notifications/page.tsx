import { AdminPageLayout } from "@/components/dashboard/AdminPageLayout";

export default function NotificationsPage() {
    return (
        <AdminPageLayout title="Notifications" subtitle="Broadcast announcements, monitor push delivery, and manage templates.">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card rounded-3xl p-8 border border-white/5 bg-white/2">
                    <h2 className="text-xl font-bold text-white mb-6">Send Announcement</h2>
                    <form className="space-y-4">
                        <div className="space-y-2"><label className="text-xs text-[#334155] font-bold uppercase tracking-wider">Title</label><input className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 text-[#e2e8f0] outline-none focus:border-[#fb923c]/40" placeholder="Heads up!" /></div>
                        <div className="space-y-2"><label className="text-xs text-[#334155] font-bold uppercase tracking-wider">Message</label><textarea className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 text-[#e2e8f0] outline-none focus:border-[#fb923c]/40 h-32" placeholder="System maintenance in 10 minutes..." /></div>
                        <button className="w-full py-4 rounded-2xl bg-[#fb923c] text-white font-bold text-sm shadow-[0_0_24px_rgba(251,146,60,0.2)]">BROADCAST NOW</button>
                    </form>
                </div>
                <div className="space-y-6">
                    <div className="glass-card rounded-3xl p-8 border border-white/5 bg-white/2">
                        <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest">Push Log (FCM)</h3>
                        <div className="space-y-4">
                            {["Announcement sent to 12.4k users", "Security alert to 3 admins"].map((log, i) => (
                                <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0"><span className="text-xs text-[#94a3b8]">{log}</span><span className="text-[9px] text-[#34d399] mono uppercase">Sent</span></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminPageLayout>
    );
}
