import { AdminPageLayout } from "@/components/dashboard/AdminPageLayout";

export default function MatchingPage() {
    return (
        <AdminPageLayout title="Partner Matching" subtitle="Optimize the matching algorithm, review success rates, and manage scoring weights.">
            <div className="glass-card rounded-3xl p-10 border border-white/5 bg-white/2 flex flex-col items-center justify-center text-center overflow-hidden relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#c084fc]/5 blur-[120px] rounded-full" />
                <div className="w-20 h-20 rounded-full border border-[#c084fc]/30 flex items-center justify-center mb-6 relative z-10"><div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c084fc] to-[#a78bfa] animate-pulse" /></div>
                <h2 className="text-2xl font-bold text-white mb-3 relative z-10">Matching Algorithm v2.4</h2>
                <p className="text-[#64748b] max-w-lg mb-8 relative z-10">The partner matching system uses deep learning to connect users based on interests, cultural overlap, and language goals.</p>
                <div className="flex gap-4 relative z-10">
                    <button className="px-6 py-2.5 rounded-2xl bg-[#c084fc] text-white text-xs font-bold shadow-[0_0_24px_rgba(192,132,252,0.3)]">CONFIGURE SCORING</button>
                    <button className="px-6 py-2.5 rounded-2xl border border-white/10 text-white text-xs font-bold hover:bg-white/5">ALGORITHM LOGS</button>
                </div>
            </div>
        </AdminPageLayout>
    );
}
