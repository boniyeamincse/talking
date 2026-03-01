import { AdminPageLayout } from "@/components/dashboard/AdminPageLayout";

export default function AuditPage() {
    return (
        <AdminPageLayout title="Audit Logs" subtitle="Complete history of administrative actions, system events, and security logs.">
            <div className="glass-card rounded-3xl p-8 border border-white/5 bg-white/2">
                <div className="space-y-2">
                    {[{ a: "Updated Rate Limit", u: "Admin_Boni", t: "2 mins ago" }].map((log, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/2 border border-white/5 hover:bg-white/4 transition-colors">
                            <div className="flex flex-col"><span className="text-sm font-bold text-[#e2e8f0]">{log.a}</span><span className="text-[10px] text-[#334155] mono uppercase">BY {log.u}</span></div>
                            <span className="text-[10px] text-[#334155] mono uppercase font-bold">{log.t}</span>
                        </div>
                    ))}
                </div>
            </div>
        </AdminPageLayout>
    );
}
