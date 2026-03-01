'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Report {
  id: number;
  reportable_type: string;
  reason: string;
  details?: string;
  status: string;
  created_at: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('pending');
  const { showToast } = useToast();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    const response = await api.reports.list();
    if (response.success && response.data) {
      setReports(response.data.data || response.data);
    }
    setLoading(false);
  };

  const handleResolve = async (id: number) => {
    const action = prompt('Enter action taken:');
    if (!action) return;

    const response = await api.reports.resolve(id, action);
    if (response.success) {
      showToast('Report resolved successfully', 'success');
      loadReports();
    } else {
      showToast('Failed to resolve report', 'error');
    }
  };

  const handleDismiss = async (id: number) => {
    const reason = prompt('Enter dismissal reason:');
    const response = await api.reports.dismiss(id, reason || undefined);
    if (response.success) {
      showToast('Report dismissed successfully', 'success');
      loadReports();
    }
  };

  const filteredReports = reports.filter((r) => r.status === filter);

  const columns = [
    {
      key: 'status',
      label: 'Status',
      render: (report: Report) => (
        <div className="flex items-center gap-2">
          {report.status === 'pending' && <Clock className="w-4 h-4 text-yellow-500" />}
          {report.status === 'resolved' && <CheckCircle className="w-4 h-4 text-green-500" />}
          {report.status === 'dismissed' && <XCircle className="w-4 h-4 text-gray-500" />}
          <span className="text-sm capitalize text-slate-300">{report.status}</span>
        </div>
      ),
    },
    {
      key: 'reportable_type',
      label: 'Type',
      render: (report: Report) => (
        <Badge variant="info">{report.reportable_type}</Badge>
      ),
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (report: Report) => (
        <div>
          <div className="text-sm text-slate-100">{report.reason}</div>
          {report.details && (
            <div className="text-xs text-slate-400 mt-1">{report.details}</div>
          )}
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'Reported',
      render: (report: Report) => (
        <span className="text-sm text-slate-400">
          {new Date(report.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (report: Report) => (
        report.status === 'pending' ? (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => handleResolve(report.id)}>
              Resolve
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleDismiss(report.id)}>
              Dismiss
            </Button>
          </div>
        ) : null
      ),
    },
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Content Moderation</h1>
        <p className="text-slate-400 text-sm mt-1">Review and manage user reports</p>
      </div>

      <div className="flex gap-2">
        {['pending', 'resolved', 'dismissed'].map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'primary' : 'ghost'}
            onClick={() => setFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
        <DataTable
          data={filteredReports}
          columns={columns}
          loading={loading}
          emptyState={<EmptyState icon={AlertTriangle} title={`No ${filter} reports`} />}
        />
      </div>
    </div>
  );
}
