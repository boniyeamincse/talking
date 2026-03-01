import { AdminPageLayout } from "@/components/dashboard/AdminPageLayout";

export default function ChatPage() {
    return (
        <AdminPageLayout title="Chat & Messaging" subtitle="Monitor conversations, manage group chats, and review media uploads.">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "Direct Messages", val: "12,402", color: "#38bdf8" },
                    { label: "Groups Created", val: "842", color: "#a78bfa" },
                    { label: "Media Uploads", val: "4,103", color: "#34d399" },
                    { label: "Flagged Msgs", val: "12", color: "#f87171" },
                ].map(s => (
                    <div key={s.label} className="glass-card rounded-2xl p-5 border border-white/5 bg-white/2">
                        <div className="text-[10px] text-[#334155] uppercase font-bold tracking-widest mb-1">{s.label}</div>
                        <div className="text-xl font-extrabold text-[#f1f5f9]" style={{ color: s.color }}>{s.val}</div>
                    </div>
                ))}
            </div>
            <div className="glass-card rounded-3xl p-8 border border-white/5 bg-white/2 h-96 flex flex-col items-center justify-center text-center">
                <div className="text-4xl mb-4">💬</div>
                <h2 className="text-2xl font-bold text-white mb-2">Live Conversation Monitor</h2>
                <p className="text-[#64748b] max-w-md">The live monitoring interface is being optimized for high-volume message streams. Direct access will be available shortly.</p>
            </div>
        </AdminPageLayout>
    );
}
