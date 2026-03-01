import { AdminPageLayout } from "@/components/dashboard/AdminPageLayout";

export default function GiftsPage() {
    return (
        <AdminPageLayout title="Gifts & Economy" subtitle="Manage virtual gifts, monitor coin transactions, and track revenue.">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "Today Revenue", val: "$4,204.50", color: "#f472b6" },
                    { label: "Coins Sold", val: "1.2M", color: "#facc15" },
                    { label: "Gifts Sent", val: "24,003", color: "#a78bfa" },
                    { label: "Pending Payout", val: "$1,840.12", color: "#38bdf8" },
                ].map(s => (
                    <div key={s.label} className="glass-card rounded-2xl p-5 border border-white/5 bg-white/2">
                        <div className="text-[10px] text-[#334155] uppercase font-bold tracking-widest mb-1">{s.label}</div>
                        <div className="text-xl font-extrabold text-[#f1f5f9]" style={{ color: s.color }}>{s.val}</div>
                    </div>
                ))}
            </div>
            <div className="glass-card rounded-3xl p-8 border border-white/5 bg-white/2 h-80 flex flex-col items-center justify-center text-center">
                <div className="text-5xl mb-4">💎</div>
                <h2 className="text-2xl font-bold text-white mb-2">Economy Control Center</h2>
                <p className="text-[#64748b] max-w-sm mb-8">Access granular reports on transaction ledgers, refund requests, and economic balance ratios here.</p>
                <button className="px-6 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-colors">LAUNCH LEDGER</button>
            </div>
        </AdminPageLayout>
    );
}
