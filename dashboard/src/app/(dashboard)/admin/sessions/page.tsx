'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import StatCard from '@/components/ui/StatCard';
import EmptyState from '@/components/ui/EmptyState';
import { Activity, Users, Monitor, LogOut, RefreshCw } from 'lucide-react';

interface Session {
  id: string;
  user_id: number;
  user_name: string;
  user_email: string;
  user_role: string;
  ip_address: string;
  device: string;
  location: string;
  started_at: string;
  last_activity: string;
}

export default function ActiveSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadSessions(true);
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadSessions = async (silent = false) => {
    if (!silent) setLoading(true);
    const response = await api.get('/admin/sessions/active');
    if (response.success && response.data) {
      setSessions(response.data);
    }
    if (!silent) setLoading(false);
  };

  const handleForceLogout = async (sessionId: string, userName: string) => {
    if (!confirm(`Force logout ${userName}?`)) return;
    const response = await api.post(`/admin/sessions/${sessionId}/logout`, {});
    if (response.success) {
      showToast('Session terminated successfully', 'success');
      loadSessions();
    } else {
      showToast(response.error || 'Failed to terminate session', 'error');
    }
  };

  const stats = {
    total: sessions.length,
    admins: sessions.filter(s => ['admin', 'super_admin'].includes(s.user_role)).length,
    users: sessions.filter(s => s.user_role === 'user').length,
  };

  const columns = [
    {
      key: 'user_name',
      label: 'User',
      render: (session: Session) => (
        <div>
          <div className="text-slate-100 font-medium">{session.user_name}</div>
          <div className="text-slate-400 text-xs">{session.user_email}</div>
        </div>
      ),
    },
    {
      key: 'user_role',
      label: 'Role',
      render: (session: Session) => (
        <Badge variant={
          session.user_role === 'super_admin' ? 'info' :
          session.user_role === 'admin' ? 'success' : 'default'
        }>
          {session.user_role === 'super_admin' ? 'Super Admin' :
           session.user_role === 'admin' ? 'Admin' : 'User'}
        </Badge>
      ),
    },
    { key: 'device', label: 'Device' },
    { key: 'ip_address', label: 'IP Address' },
    { key: 'location', label: 'Location' },
    {
      key: 'started_at',
      label: 'Started',
      render: (session: Session) => (
        <span className="text-slate-300 text-sm">
          {new Date(session.started_at).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'last_activity',
      label: 'Last Activity',
      render: (session: Session) => (
        <span className="text-slate-400 text-sm">
          {new Date(session.last_activity).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (session: Session) => (
        <Button
          size="sm"
          variant="danger"
          onClick={() => handleForceLogout(session.id, session.user_name)}
        >
          <LogOut className="w-4 h-4 mr-1" />
          Force Logout
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Active Sessions</h1>
          <p className="text-slate-400 text-sm mt-1">Monitor and manage active user sessions</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'text-green-400' : 'text-slate-400'}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button variant="secondary" onClick={() => loadSessions()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Now
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Sessions"
          value={stats.total.toString()}
          icon={Activity}
          iconColor="bg-blue-600"
        />
        <StatCard
          title="Admin Sessions"
          value={stats.admins.toString()}
          icon={Users}
          iconColor="bg-purple-600"
        />
        <StatCard
          title="User Sessions"
          value={stats.users.toString()}
          icon={Monitor}
          iconColor="bg-green-600"
        />
      </div>

      <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
        <DataTable
          data={sessions}
          columns={columns}
          loading={loading}
          emptyState={<EmptyState icon={Activity} title="No active sessions" />}
        />
      </div>

      {autoRefresh && (
        <div className="text-center text-slate-500 text-xs">
          Auto-refreshing every 30 seconds
        </div>
      )}
    </div>
  );
}
