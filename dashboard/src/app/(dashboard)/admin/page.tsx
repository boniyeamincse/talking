'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { AnalyticsOverview } from '@/lib/types';
import { Activity, Users, Phone, MessageSquare, Gift, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
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
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.total_users || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12.5%',
    },
    {
      title: 'Active Today',
      value: stats?.active_users_today || 0,
      icon: Activity,
      color: 'bg-green-500',
      change: '+8.2%',
    },
    {
      title: 'Total Calls',
      value: stats?.total_calls || 0,
      icon: Phone,
      color: 'bg-purple-500',
      change: '+15.3%',
    },
    {
      title: 'Voice Rooms',
      value: stats?.total_rooms || 0,
      icon: MessageSquare,
      color: 'bg-orange-500',
      change: '+5.7%',
    },
    {
      title: 'Revenue',
      value: `$${(stats?.total_revenue || 0).toLocaleString()}`,
      icon: Gift,
      color: 'bg-pink-500',
      change: '+22.1%',
    },
    {
      title: 'Pending Reports',
      value: stats?.pending_reports || 0,
      icon: AlertTriangle,
      color: 'bg-red-500',
      change: '-3.2%',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Welcome to BaniTalk Super Admin Dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {card.value}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    {card.change} from last week
                  </p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  User activity event {i}
                </span>
                <span className="text-gray-400 dark:text-gray-500 ml-auto">
                  {i} min ago
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            System Health
          </h2>
          <div className="space-y-4">
            {[
              { name: 'API Server', status: 'Operational', color: 'bg-green-500' },
              { name: 'Database', status: 'Operational', color: 'bg-green-500' },
              { name: 'WebSocket', status: 'Operational', color: 'bg-green-500' },
              { name: 'Queue', status: 'Operational', color: 'bg-green-500' },
            ].map((service, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {service.name}
                </span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 ${service.color} rounded-full`}></div>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {service.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
