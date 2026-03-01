import { AdminPageLayout } from "@/components/dashboard/AdminPageLayout";

export default function OverviewRedirectPage() {
    return (
        <AdminPageLayout title="Overview & KPIs" subtitle="Standard administrative KPIs and high-level platform health indicators.">
            <div className="glass-card rounded-3xl p-20 border border-white/5 bg-white/2 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-3xl bg-[#38bdf8]/10 flex items-center justify-center text-[#38bdf8] text-2xl mb-6">📈</div>
                <h2 className="text-2xl font-bold text-white mb-2">KPI Dashboard Active</h2>
                <p className="text-[#64748b] max-w-sm mb-8">This page serves as the detailed KPI breakdown for the Super Admin team.</p>
                <button className="px-6 py-2.5 rounded-2xl bg-[#38bdf8]/10 text-[#38bdf8] text-xs font-bold border border-[#38bdf8]/20">VIEW LIVE METRICS</button>
            </div>
        </AdminPageLayout>
    );
}
