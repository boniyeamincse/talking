import { AdminPageLayout } from "@/components/dashboard/AdminPageLayout";

export default function SpeechLearningPage() {
    return (
        <AdminPageLayout title="Speech Learning (SL)" subtitle="Manage grammar lessons, vocabulary, pronunciation scoring, and R&D modules." badge="RD · EXPERIMENTAL">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card rounded-3xl p-8 border border-white/5 bg-white/2 border-t-[#facc15]/40">
                    <h2 className="text-xl font-bold text-white mb-6">User SL Progress</h2>
                    <div className="space-y-4">
                        {["Beginner Grammar", "Business Vocabulary"].map((module, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-white/4 border border-white/5 flex items-center justify-between">
                                <span className="text-sm font-bold text-[#e2e8f0]">{module}</span>
                                <div className="w-32 h-2 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-[#facc15] w-3/4" /></div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="glass-card rounded-3xl p-8 border border-white/5 bg-white/2">
                    <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest">SL Modules</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {["Grammar", "Vocabulary", "Twisters"].map(m => (
                            <div key={m} className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center transition-colors hover:bg-white/10 cursor-pointer"><span className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">{m}</span></div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminPageLayout>
    );
}
