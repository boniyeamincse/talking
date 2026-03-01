'use client';

import { Sidebar } from "@/components/dashboard/Sidebar";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <RoleGuard allowedRoles={['admin', 'super_admin']}>
            <div className="flex relative min-h-screen">
                <div className="bg-grid" />
                <Sidebar />
                <main className="flex-1 ml-16 md:ml-68 transition-all duration-300 relative z-10">
                    {children}
                </main>
            </div>
        </RoleGuard>
    );
}
