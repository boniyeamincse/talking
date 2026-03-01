"use client";

import { motion } from "framer-motion";
import { UserTable } from "@/components/users/UserTable";

export default function UsersPage() {
    return (
        <div className="flex flex-col gap-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-1"
            >
                <h2 className="text-3xl font-bold text-white tracking-tight">User Management</h2>
                <p className="text-muted-foreground">Manage platform access, roles, and community safety.</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <UserTable />
            </motion.div>
        </div>
    );
}
