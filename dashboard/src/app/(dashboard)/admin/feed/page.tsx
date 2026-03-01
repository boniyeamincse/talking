import { AdminPageLayout } from "@/components/dashboard/AdminPageLayout";

export default function SocialFeedPage() {
    return (
        <AdminPageLayout title="Social Feed" subtitle="Overview of platform posts, trending topics, and feed engagement analytics.">
            <div className="glass-card rounded-3xl p-8 border border-white/5 bg-white/2 mb-6">
                <h2 className="text-xl font-bold text-white mb-6">Trending Topics</h2>
                <div className="flex flex-wrap gap-2">
                    {["#EnglishLearning", "#BaniTalk", "#VoiceChat", "#CultureExchange", "#GlobalPeace", "#NewYear2026"].map(tag => (
                        <span key={tag} className="px-4 py-2 rounded-2xl bg-[#4ade80]/5 border border-[#4ade80]/20 text-[#4ade80] text-xs font-semibold">{tag}</span>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {["Most Liked Today", "Most Shared Today", "Most Reported Posts"].map(label => (
                    <div key={label} className="glass-card rounded-3xl p-6 border border-white/5 bg-white/2 h-40 flex flex-col justify-between">
                        <span className="text-[10px] text-[#334155] font-bold uppercase tracking-widest">{label}</span>
                        <div className="text-3xl font-extrabold text-[#f1f5f9] tracking-tighter">842 <span className="text-xs text-[#334155] font-normal tracking-normal uppercase">Events</span></div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-[#4ade80] w-3/4" /></div>
                    </div>
                ))}
            </div>
        </AdminPageLayout>
    );
}
