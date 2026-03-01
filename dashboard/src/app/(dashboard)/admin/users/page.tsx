import { AdminPageLayout } from "@/components/dashboard/AdminPageLayout";

export default function UsersPage() {
    return (
        <AdminPageLayout title="User Management" subtitle="Overview of all platform users, their activity, and account status.">
            <div className="glass-card rounded-3xl p-8 border border-white/5 bg-white/2">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-white">Platform Users</h2>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 rounded-xl bg-[#34d399]/10 text-[#34d399] text-xs font-bold border border-[#34d399]/20">VIEW ALL</button>
                        <button className="px-4 py-2 rounded-xl bg-white/5 text-[#94a3b8] text-xs font-bold border border-white/10">SEARCH</button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="pb-4 text-[10px] uppercase tracking-widest text-[#334155] font-bold">User</th>
                                <th className="pb-4 text-[10px] uppercase tracking-widest text-[#334155] font-bold">Status</th>
                                <th className="pb-4 text-[10px] uppercase tracking-widest text-[#334155] font-bold">Joined</th>
                                <th className="pb-4 text-[10px] uppercase tracking-widest text-[#334155] font-bold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {["Yeamin Boni", "John Doe", "Sarah Connor", "Alex Smith"].map((user, i) => (
                                <tr key={user} className="group hover:bg-white/[0.02]">
                                    <td className="py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-[#34d399]/10 border border-[#34d399]/20" />
                                            <span className="text-sm font-semibold text-[#e2e8f0]">{user}</span>
                                        </div>
                                    </td>
                                    <td className="py-4"><span className="px-2 py-0.5 rounded-full bg-[#34d399]/10 text-[#34d399] text-[9px] font-bold border border-[#34d399]/20">ACTIVE</span></td>
                                    <td className="py-4 text-xs text-[#475569] mono">2026-03-01</td>
                                    <td className="py-4 text-right"><button className="text-[#334155] group-hover:text-[#38bdf8] transition-colors">✎</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminPageLayout>
    );
}
