import { AdminPageLayout } from "@/components/dashboard/AdminPageLayout";

export default function AnalyticsPage() {
    return (
        <AdminPageLayout title="Platform Analytics" subtitle="Deep-dive into platform growth, retention, revenue, and performance metrics.">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[{ label: "Growth (MAU)", val: "+12.4%", color: "#34d399" }, { label: "Retention", val: "68%", color: "#a78bfa" }].map(s => (
                    <div key={s.label} className="glass-card rounded-2xl p-5 border border-white/5 bg-white/2">
                        <div className="text-[10px] text-[#334155] uppercase font-bold tracking-widest mb-1">{s.label}</div>
                        <div className="text-xl font-extrabold text-[#f1f5f9]" style={{ color: s.color }}>{s.val}</div>
                    </div>
                ))}
            </div>
            <div className="glass-card rounded-3xl p-8 border border-white/5 bg-white/2 h-80 flex items-center justify-center text-[#334155] mono text-xs uppercase tracking-widest">
                Detailed Data Visualizations Pending
            </div>
        </AdminPageLayout>
    );
}
