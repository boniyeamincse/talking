'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import PageTemplate from '@/components/PageTemplate';
import { TrendingUp, Users, Phone, MessageSquare, DollarSign, Globe } from 'lucide-react';

export default function AnalyticsOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    const response = await api.analytics.overview();
    if (response.success && response.data) {
      setData(response.data);
    }
    setLoading(false);
  };

  const metrics = [
    {
      title: 'Total Users',
      value: data?.total_users?.toLocaleString() || '0',
      change: '+12.5%',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Daily Active Users',
      value: data?.dau?.toLocaleString() || '0',
      change: '+8.2%',
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      title: 'Total Calls',
      value: data?.total_calls?.toLocaleString() || '0',
      change: '+15.3%',
      icon: Phone,
      color: 'bg-purple-500',
    },
    {
      title: 'Messages Sent',
      value: data?.total_messages?.toLocaleString() || '0',
      change: '+22.1%',
      icon: MessageSquare,
      color: 'bg-orange-500',
    },
    {
      title: 'Revenue',
      value: `$${(data?.total_revenue || 0).toLocaleString()}`,
      change: '+18.7%',
      icon: DollarSign,
      color: 'bg-pink-500',
    },
    {
      title: 'Countries',
      value: data?.countries_count || '0',
      change: '+2',
      icon: Globe,
      color: 'bg-cyan-500',
    },
  ];

  return (
    <PageTemplate
      title="Analytics Overview"
      description="Platform-wide analytics and insights"
      actions={
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="day">Last 24 Hours</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="year">Last Year</option>
        </select>
      }
    >
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {metric.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                        {metric.value}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        {metric.change} from last period
                      </p>
                    </div>
                    <div className={`${metric.color} p-3 rounded-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                User Growth Trend
              </h2>
              <div className="h-64 flex items-center justify-center text-gray-400">
                Chart placeholder - integrate with recharts or similar
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Top Countries
              </h2>
              <div className="space-y-3">
                {[
                  { country: 'United States', users: 12500, flag: '🇺🇸' },
                  { country: 'United Kingdom', users: 8300, flag: '🇬🇧' },
                  { country: 'Canada', users: 6200, flag: '🇨🇦' },
                  { country: 'Australia', users: 4100, flag: '🇦🇺' },
                  { country: 'Germany', users: 3800, flag: '🇩🇪' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.flag}</span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {item.country}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                      {item.users.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </PageTemplate>
  );
}
