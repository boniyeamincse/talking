'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import PageTemplate from '@/components/PageTemplate';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { TrendingUp, TrendingDown, Users, Calendar } from 'lucide-react';

interface RetentionData {
  period: string;
  cohort_size: number;
  day_1: number;
  day_7: number;
  day_14: number;
  day_30: number;
  day_60: number;
  day_90: number;
}

export default function RetentionAnalyticsPage() {
  const [data, setData] = useState<RetentionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [summary, setSummary] = useState({
    avg_day_1: 0,
    avg_day_7: 0,
    avg_day_30: 0,
    trend: 'up',
  });

  useEffect(() => {
    loadRetentionData();
  }, [period]);

  const loadRetentionData = async () => {
    const response = await api.advancedAnalytics.retention(period);
    if (response.success) {
      setData(response.data.cohorts);
      setSummary(response.data.summary);
    }
    setLoading(false);
  };

  const getRetentionColor = (rate: number) => {
    if (rate >= 70) return 'text-green-400';
    if (rate >= 50) return 'text-yellow-400';
    if (rate >= 30) return 'text-orange-400';
    return 'text-red-400';
  };

  const getRetentionBg = (rate: number) => {
    if (rate >= 70) return 'bg-green-500/20';
    if (rate >= 50) return 'bg-yellow-500/20';
    if (rate >= 30) return 'bg-orange-500/20';
    return 'bg-red-500/20';
  };

  if (loading) {
    return (
      <PageTemplate title="User Retention" description="Analyze user retention rates">
        <LoadingSpinner size="lg" />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="User Retention & Churn Analysis"
      description="Track how well you retain users over time"
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Day 1 Retention</p>
              <p className="text-3xl font-bold text-white mt-1">{summary.avg_day_1}%</p>
              <div className="flex items-center gap-1 mt-2">
                {summary.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <span className={summary.trend === 'up' ? 'text-green-400' : 'text-red-400'}>
                  {summary.trend === 'up' ? '+' : '-'}2.5%
                </span>
              </div>
            </div>
            <Users className="w-12 h-12 text-blue-400" />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Day 7 Retention</p>
              <p className="text-3xl font-bold text-white mt-1">{summary.avg_day_7}%</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-green-400">+1.8%</span>
              </div>
            </div>
            <Calendar className="w-12 h-12 text-green-400" />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Day 30 Retention</p>
              <p className="text-3xl font-bold text-white mt-1">{summary.avg_day_30}%</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingDown className="w-4 h-4 text-red-400" />
                <span className="text-red-400">-0.5%</span>
              </div>
            </div>
            <Users className="w-12 h-12 text-purple-400" />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Churn Rate</p>
              <p className="text-3xl font-bold text-white mt-1">{100 - summary.avg_day_30}%</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-green-400">Improving</span>
              </div>
            </div>
            <TrendingDown className="w-12 h-12 text-red-400" />
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 mb-6">
        <div className="flex gap-2">
          {['week', 'month', 'quarter', 'year'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                period === p
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Retention Cohort Table */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden mb-8">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-xl font-bold text-white">Cohort Retention Analysis</h3>
          <p className="text-gray-400 text-sm mt-1">
            Percentage of users who return after their first visit
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-gray-400 font-medium">Cohort</th>
                <th className="text-center p-4 text-gray-400 font-medium">Size</th>
                <th className="text-center p-4 text-gray-400 font-medium">Day 1</th>
                <th className="text-center p-4 text-gray-400 font-medium">Day 7</th>
                <th className="text-center p-4 text-gray-400 font-medium">Day 14</th>
                <th className="text-center p-4 text-gray-400 font-medium">Day 30</th>
                <th className="text-center p-4 text-gray-400 font-medium">Day 60</th>
                <th className="text-center p-4 text-gray-400 font-medium">Day 90</th>
              </tr>
            </thead>
            <tbody>
              {data.map((cohort, index) => (
                <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 text-white font-medium">{cohort.period}</td>
                  <td className="p-4 text-center text-gray-300">{cohort.cohort_size.toLocaleString()}</td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded ${getRetentionBg(cohort.day_1)} ${getRetentionColor(cohort.day_1)}`}>
                      {cohort.day_1}%
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded ${getRetentionBg(cohort.day_7)} ${getRetentionColor(cohort.day_7)}`}>
                      {cohort.day_7}%
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded ${getRetentionBg(cohort.day_14)} ${getRetentionColor(cohort.day_14)}`}>
                      {cohort.day_14}%
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded ${getRetentionBg(cohort.day_30)} ${getRetentionColor(cohort.day_30)}`}>
                      {cohort.day_30}%
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded ${getRetentionBg(cohort.day_60)} ${getRetentionColor(cohort.day_60)}`}>
                      {cohort.day_60}%
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded ${getRetentionBg(cohort.day_90)} ${getRetentionColor(cohort.day_90)}`}>
                      {cohort.day_90}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
          <h4 className="text-lg font-bold text-white mb-3">✅ What's Working</h4>
          <ul className="text-gray-300 space-y-2">
            <li>• Day 1 retention is above industry average (65%)</li>
            <li>• Week 1 retention shows strong engagement</li>
            <li>• Recent cohorts performing better than older ones</li>
          </ul>
        </div>

        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
          <h4 className="text-lg font-bold text-white mb-3">⚠️ Areas for Improvement</h4>
          <ul className="text-gray-300 space-y-2">
            <li>• Day 30 retention needs improvement (target: 40%)</li>
            <li>• Significant drop-off between Day 7 and Day 14</li>
            <li>• Consider implementing re-engagement campaigns</li>
          </ul>
        </div>
      </div>
    </PageTemplate>
  );
}
