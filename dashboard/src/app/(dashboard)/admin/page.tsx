'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import StatCard from '@/components/ui/StatCard';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { Activity, Users, Phone, MessageSquare, Gift, AlertTriangle, TrendingUp, DollarSign, Globe, Shield } from 'lucide-react';

interface Stats {
  total_users: number;
  active_users_today: number;
  total_calls: number;
  total_rooms: number;
  total_revenue: number;
  pending_reports: number;
  new_users_today: number;
  active_sessions: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    const response = await api.analytics.overview();
    if (response.success && response.data) {
      setStats(response.data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-32 w-full" count={8} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Dashboard Overview</h1>
          <p className="text-slate-400 mt-1">Welcome to BaniTalk Super Admin Dashboard</p>
        </div>
        <Badge variant="success">Live</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.total_users?.toLocaleString() || '0'}
          change="+12.5%"
          trend="up"
          icon={Users}
          iconColor="bg-blue-600"
        />
        <StatCard
          title="Active Today"
          value={stats?.active_users_today?.toLocaleString() || '0'}
          change="+8.2%"
          trend="up"
          icon={Activity}
          iconColor="bg-green-600"
        />
        <StatCard
          title="Active Sessions"
          value={stats?.active_sessions?.toLocaleString() || '0'}
          change="+5.1%"
          trend="up"
          icon={Globe}
          iconColor="bg-purple-600"
        />
        <StatCard
          title="New Users Today"
          value={stats?.new_users_today?.toLocaleString() || '0'}
          change="+15.3%"
          trend="up"
          icon={TrendingUp}
          iconColor="bg-cyan-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Calls"
          value={stats?.total_calls?.toLocaleString() || '0'}
          change="+18.7%"
          trend="up"
          icon={Phone}
          iconColor="bg-indigo-600"
        />
        <StatCard
          title="Voice Rooms"
          value={stats?.total_rooms?.toLocaleString() || '0'}
          change="+5.7%"
          trend="up"
          icon={MessageSquare}
          iconColor="bg-orange-600"
        />
        <StatCard
          title="Revenue"
          value={`$${(stats?.total_revenue || 0).toLocaleString()}`}
          change="+22.1%"
          trend="up"
          icon={DollarSign}
          iconColor="bg-pink-600"
        />
        <StatCard
          title="Pending Reports"
          value={stats?.pending_reports?.toLocaleString() || '0'}
          change="-3.2%"
          trend="down"
          icon={AlertTriangle}
          iconColor="bg-red-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-100">Recent Activity</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { event: 'New user registered', time: '2 min ago', type: 'success' },
                { event: 'Report submitted', time: '5 min ago', type: 'warning' },
                { event: 'Payment received', time: '8 min ago', type: 'success' },
                { event: 'User suspended', time: '12 min ago', type: 'error' },
                { event: 'New voice room created', time: '15 min ago', type: 'info' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    item.type === 'success' ? 'bg-green-500' :
                    item.type === 'warning' ? 'bg-yellow-500' :
                    item.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                  }`}></div>
                  <span className="text-sm text-slate-300 flex-1">{item.event}</span>
                  <span className="text-xs text-slate-500">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-100">System Health</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'API Server', status: 'Operational', uptime: '99.9%' },
                { name: 'Database', status: 'Operational', uptime: '99.8%' },
                { name: 'WebSocket', status: 'Operational', uptime: '99.7%' },
                { name: 'Queue', status: 'Operational', uptime: '99.9%' },
              ].map((service, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-slate-300">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">{service.uptime}</span>
                    <Badge variant="success">{service.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-slate-100">Quick Actions</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'View Users', icon: Users, href: '/admin/users' },
              { label: 'View Reports', icon: AlertTriangle, href: '/admin/reports' },
              { label: 'Active Sessions', icon: Activity, href: '/admin/sessions' },
              { label: 'Security Events', icon: Shield, href: '/admin/audit/security' },
            ].map((action, i) => {
              const Icon = action.icon;
              return (
                <a
                  key={i}
                  href={action.href}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-750 hover:border-slate-600 transition-colors"
                >
                  <Icon className="w-6 h-6 text-slate-400" />
                  <span className="text-sm text-slate-300">{action.label}</span>
                </a>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
