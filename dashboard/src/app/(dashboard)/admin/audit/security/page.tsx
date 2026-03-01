'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import DataTable from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import StatCard from '@/components/ui/StatCard';
import EmptyState from '@/components/ui/EmptyState';
import { AlertTriangle, Shield, AlertCircle } from 'lucide-react';

interface SecurityEvent {
  id: number;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  ip_address: string;
  user_name?: string;
  created_at: string;
}

export default function SecurityEventsPage() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
    const interval = setInterval(loadEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadEvents = async () => {
    const response = await api.get('/admin/security/events');
    if (response.success && response.data) {
      setEvents(response.data);
    }
    setLoading(false);
  };

  const stats = {
    critical: events.filter(e => e.severity === 'critical').length,
    high: events.filter(e => e.severity === 'high').length,
    total: events.length,
  };

  const columns = [
    {
      key: 'created_at',
      label: 'Time',
      render: (event: SecurityEvent) => (
        <span className="text-slate-300 text-sm">
          {new Date(event.created_at).toLocaleString()}
        </span>
      ),
    },
    { key: 'type', label: 'Event Type' },
    {
      key: 'severity',
      label: 'Severity',
      render: (event: SecurityEvent) => (
        <Badge variant={
          event.severity === 'critical' ? 'error' :
          event.severity === 'high' ? 'warning' : 'info'
        }>
          {event.severity}
        </Badge>
      ),
    },
    { key: 'description', label: 'Description' },
    { key: 'ip_address', label: 'IP Address' },
    { key: 'user_name', label: 'User' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Security Events</h1>
        <p className="text-slate-400 text-sm mt-1">Monitor security threats and suspicious activities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Critical Events"
          value={stats.critical.toString()}
          icon={AlertTriangle}
          iconColor="bg-red-600"
        />
        <StatCard
          title="High Priority"
          value={stats.high.toString()}
          icon={AlertCircle}
          iconColor="bg-orange-600"
        />
        <StatCard
          title="Total Events"
          value={stats.total.toString()}
          icon={Shield}
          iconColor="bg-blue-600"
        />
      </div>

      <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
        <DataTable
          data={events}
          columns={columns}
          loading={loading}
          emptyState={<EmptyState icon={Shield} title="No security events" />}
        />
      </div>
    </div>
  );
}
