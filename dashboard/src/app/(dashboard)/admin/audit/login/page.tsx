'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { FileText, Search, Download } from 'lucide-react';

interface LoginLog {
  id: number;
  user_name: string;
  user_email: string;
  ip_address: string;
  device: string;
  location: string;
  status: 'success' | 'failed';
  created_at: string;
}

export default function LoginAuditLogPage() {
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed'>('all');
  const { showToast } = useToast();

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    const response = await api.get('/admin/audit/login');
    if (response.success && response.data) {
      setLogs(response.data);
    }
    setLoading(false);
  };

  const handleExport = () => {
    const csv = [
      ['Timestamp', 'User', 'Email', 'IP', 'Device', 'Location', 'Status'],
      ...filteredLogs.map(log => [
        log.created_at,
        log.user_name,
        log.user_email,
        log.ip_address,
        log.device,
        log.location,
        log.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `login-audit-${new Date().toISOString()}.csv`;
    a.click();
    showToast('Audit log exported successfully', 'success');
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.ip_address.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: 'created_at',
      label: 'Timestamp',
      render: (log: LoginLog) => (
        <span className="text-slate-300 text-sm">
          {new Date(log.created_at).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'user_name',
      label: 'User',
      render: (log: LoginLog) => (
        <div>
          <div className="text-slate-100">{log.user_name}</div>
          <div className="text-slate-400 text-xs">{log.user_email}</div>
        </div>
      ),
    },
    { key: 'ip_address', label: 'IP Address' },
    { key: 'device', label: 'Device' },
    { key: 'location', label: 'Location' },
    {
      key: 'status',
      label: 'Status',
      render: (log: LoginLog) => (
        <Badge variant={log.status === 'success' ? 'success' : 'error'}>
          {log.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Login Audit Log</h1>
          <p className="text-slate-400 text-sm mt-1">Track all login attempts and activities</p>
        </div>
        <Button onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by user, email, or IP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-md text-slate-100 text-sm"
        >
          <option value="all">All Status</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
        <DataTable
          data={filteredLogs}
          columns={columns}
          loading={loading}
          emptyState={<EmptyState icon={FileText} title="No login logs found" />}
        />
      </div>
    </div>
  );
}
