"use client";

import { motion } from "framer-motion";
import { ModerationQueue } from "@/components/moderation/ModerationQueue";
import { ModerationLogs } from "@/components/moderation/ModerationLogs";

export default function ModerationPage() {
    return (
        <div className="flex flex-col gap-12">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-1"
            >
                <h2 className="text-3xl font-bold text-white tracking-tight">Moderation Console</h2>
                <p className="text-muted-foreground">Review reported content and track administrative actions.</p>
            </motion.div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="xl:col-span-2"
                >
                    <ModerationQueue />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <ModerationLogs />
                </motion.div>
            </div>
        </div>
    );
}
