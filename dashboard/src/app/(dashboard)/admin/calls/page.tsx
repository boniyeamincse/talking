import { AdminPageLayout } from "@/components/dashboard/AdminPageLayout";

export default function CallsPage() {
    return (
        <AdminPageLayout title="Calls & Video" subtitle="Real-time call monitoring, RTC signal logs, and quality analytics.">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card rounded-3xl p-8 border border-white/5 bg-white/2 border-t-[#facc15]/30">
                        <h2 className="text-xl font-bold text-white mb-6">WebRTC Signal Health</h2>
                        <div className="h-48 rounded-2xl bg-white/5 border border-white/5 flex items-end p-4 gap-1">
                            {[40, 60, 45, 90, 100, 80, 50, 70, 95, 85, 60, 75, 90, 100].map((h, i) => (
                                <div key={i} className="flex-1 bg-[#facc15]/20 rounded-t-sm" style={{ height: `${h}%` }} />
                            ))}
                        </div>
                        <div className="flex justify-between mt-4 text-[10px] text-[#334155] mono font-bold"><span>LATENCY: 42ms</span><span>PACKET LOSS: 0.02%</span><span>UPTIME: 99.99%</span></div>
                    </div>
                </div>
                <div className="glass-card rounded-3xl p-8 border border-white/5 bg-white/2">
                    <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest">Server Nodes</h3>
                    <div className="space-y-4">
                        {["North America", "Europe (Frankfurt)", "Asia (Singapore)"].map(region => (
                            <div key={region} className="flex items-center justify-between p-4 rounded-2xl bg-white/4 border border-white/5">
                                <div className="flex flex-col"><span className="text-xs text-[#e2e8f0] font-bold">{region}</span><span className="text-[9px] text-[#334155] mono uppercase">Online</span></div>
                                <div className="w-2 h-2 rounded-full bg-[#34d399]" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminPageLayout>
    );
}
