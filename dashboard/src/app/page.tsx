"use client";

import { motion } from "framer-motion";
import {
  Users,
  TrendingUp,
  MessageSquare,
  Mic2,
  ArrowUpRight,
  ArrowDownRight,
  Gift,
  PhoneCall
} from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  {
    name: "Total Users",
    value: "12,482",
    change: "+12.5%",
    trend: "up",
    icon: Users,
    color: "bg-blue-500/10 text-blue-500"
  },
  {
    name: "Live Rooms",
    value: "42",
    change: "+5",
    trend: "up",
    icon: Mic2,
    color: "bg-purple-500/10 text-purple-500"
  },
  {
    name: "Messages Today",
    value: "84.2K",
    change: "-2.1%",
    trend: "down",
    icon: MessageSquare,
    color: "bg-emerald-500/10 text-emerald-500"
  },
  {
    name: "Total Revenue",
    value: "$4,120",
    change: "+18.2%",
    trend: "up",
    icon: Gift,
    color: "bg-amber-500/10 text-amber-500"
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function OverviewPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Overview</h2>
        <p className="text-muted-foreground mt-1">Platform-wide activity and health metrics.</p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.name}
            variants={item}
            className="glass-card p-6 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <div className={cn("p-3 rounded-2xl", stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                stat.trend === "up" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
              )}>
                {stat.change}
                {stat.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              </div>
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">{stat.name}</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-8 min-h-[400px] flex flex-col justify-center items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-white">Activity Analytics</h3>
          <p className="text-muted-foreground max-w-sm">
            Detailed charts for sessions, engagement, and retention will be integrated in Phase 3.
          </p>
        </div>

        <div className="glass-card p-8 flex flex-col gap-6">
          <h3 className="text-xl font-bold text-white">Recent Activity</h3>
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-all">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  {i % 2 === 0 ? <PhoneCall className="w-5 h-5 text-primary" /> : <Users className="w-5 h-5 text-emerald-500" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {i % 2 === 0 ? "New Voice Room Started" : "New User Registered"}
                  </p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-auto w-full py-3 rounded-2xl border border-white/10 text-sm font-semibold hover:bg-white/5 transition-all">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
}
