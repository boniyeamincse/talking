import { AdminPageLayout } from "@/components/dashboard/AdminPageLayout";

export default function TranslationPage() {
    return (
        <AdminPageLayout title="Translation System" subtitle="Manage cross-lingual support, monitor API usage, and configure auto-translation." badge="180+ LANGUAGES">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card rounded-3xl p-8 border border-white/5 bg-white/2">
                    <h2 className="text-xl font-bold text-white mb-6">Language Heatmap</h2>
                    <div className="h-64 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center text-[#334155] mono text-xs uppercase tracking-widest">[ World Map Visualization Data Pending ]</div>
                    <div className="grid grid-cols-4 gap-4 mt-6">
                        {["English", "Arabic", "Spanish", "Bengali"].map(lang => (
                            <div key={lang} className="p-3 rounded-xl bg-white/4 border border-white/5 text-center">
                                <div className="text-xs font-bold text-[#e2e8f0]">{lang}</div>
                                <div className="text-[9px] text-[#34d399] mono">84% USAGE</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="glass-card rounded-3xl p-8 border border-white/5 bg-white/2">
                    <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Translation API Usage</h3>
                    <div className="space-y-6 mt-8">
                        {["Google Translate", "DeepL API", "Internal AI-V2"].map(api => (
                            <div key={api} className="space-y-2">
                                <div className="flex justify-between text-[11px] text-[#94a3b8] font-bold"><span>{api}</span><span>72%</span></div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-[#38bdf8] w-[72%]" /></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminPageLayout>
    );
}
