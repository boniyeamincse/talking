import { AdminPageLayout } from "@/components/dashboard/AdminPageLayout";

export default function VoiceRoomsPage() {
    return (
        <AdminPageLayout title="Voice Rooms" subtitle="Monitor live voice sessions, manage hosts, and review room activity." badge="LIVE · 12 ROOMS">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card rounded-3xl p-8 border border-white/5 bg-white/2">
                    <h2 className="text-xl font-bold text-white mb-6">Active Rooms</h2>
                    <div className="space-y-4">
                        {["Global English Exchange", "Beginner Arabic Practice", "Karaoke Night - Pop Hits"].map((room, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/4 border border-white/5 hover:bg-white/6 transition-colors group">
                                <div className="w-10 h-10 rounded-xl bg-[#fb923c]/10 flex items-center justify-center text-[#fb923c] font-bold">🎙</div>
                                <div className="flex-1">
                                    <div className="text-sm font-bold text-[#e2e8f0]">{room}</div>
                                    <div className="text-[10px] text-[#334155] mono uppercase">{12 + i * 5} Listeners · {2 + i} Speakers</div>
                                </div>
                                <button className="px-3 py-1.5 rounded-lg bg-[#fb923c]/10 text-[#fb923c] text-[10px] font-bold border border-[#fb923c]/20">MONITOR</button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="glass-card rounded-3xl p-8 border border-white/5 bg-white/2">
                    <h2 className="text-xl font-bold text-white mb-6">Host Performance</h2>
                    <div className="space-y-4">
                        {["User_882", "Sarah_Admin", "Mike_Host"].map((host, i) => (
                            <div key={i} className="flex items-center justify-between p-3 border-b border-white/5 last:border-0">
                                <div className="flex gap-3 items-center"><span className="mono text-[10px] text-[#334155]">#{i + 1}</span><span className="text-sm text-[#94a3b8]">{host}</span></div>
                                <span className="text-xs text-[#34d399] font-bold">4.9 ★</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminPageLayout>
    );
}
