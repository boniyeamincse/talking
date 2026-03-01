import { AdminPageLayout } from "@/components/dashboard/AdminPageLayout";

export default function AuthPage() {
    return (
        <AdminPageLayout
            title="Auth & Security"
            subtitle="Manage administrative accounts, roles, permissions, and security audits."
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card rounded-3xl p-8 border border-white/5 bg-white/2">
                    <h2 className="text-xl font-bold text-white mb-4">Administrative Access</h2>
                    <p className="text-[#64748b] mb-6"> Configure multi-factor authentication and manage active sessions for all administrative users.</p>
                    <div className="space-y-3">
                        {["Two-Factor Authentication", "Active Sessions", "IP Whitelisting"].map(item => (
                            <div key={item} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                <span className="text-sm text-[#e2e8f0] font-medium">{item}</span>
                                <span className="text-xs text-[#a78bfa] font-bold mono">MANAGE</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="glass-card rounded-3xl p-8 border border-white/5 bg-white/2">
                    <h2 className="text-xl font-bold text-white mb-4">Security Logs</h2>
                    <div className="space-y-4">
                        {["Unauthorized attempt from 192.168.1.1", "Admin 'Boni' changed role for 'Moderator1'", "New IP detected for 'SuperAdmin'"].map((log, i) => (
                            <div key={i} className="text-xs py-3 border-b border-white/5 flex gap-3 text-[#475569]">
                                <span className="text-[#334155] mono">12:4{i} PM</span>
                                <span className="text-[#94a3b8]">{log}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminPageLayout>
    );
}
