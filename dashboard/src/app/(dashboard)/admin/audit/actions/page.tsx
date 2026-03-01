'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import PageTemplate from '@/components/PageTemplate';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { FileText, User, Shield, Settings, AlertTriangle } from 'lucide-react';

interface AuditLog {
  id: number;
  admin_id: number;
  admin_name: string;
  action: string;
  entity_type: string;
  entity_id: number;
  changes: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export default function AdminActionLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAuditLogs();
  }, [filter]);

  const loadAuditLogs = async () => {
    const response = await api.get(`/admin/audit/actions?filter=${filter}`);
    if (response.success) {
      setLogs(response.data);
    }
    setLoading(false);
  };

  const getActionIcon = (action: string) => {
    if (action.includes('create')) return <Shield className="w-5 h-5 text-green-400" />;
    if (action.includes('update')) return <Settings className="w-5 h-5 text-blue-400" />;
    if (action.includes('delete') || action.includes('ban')) return <AlertTriangle className="w-5 h-5 text-red-400" />;
    return <FileText className="w-5 h-5 text-gray-400" />;
  };

  const getActionColor = (action: string) => {
    if (action.includes('create')) return 'bg-green-500/20 text-green-400';
    if (action.includes('update')) return 'bg-blue-500/20 text-blue-400';
    if (action.includes('delete') || action.includes('ban')) return 'bg-red-500/20 text-red-400';
    return 'bg-gray-500/20 text-gray-400';
  };

  const filteredLogs = logs.filter(log =>
    log.admin_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entity_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <PageTemplate title="Admin Action Log" description="Track all administrative actions">
        <LoadingSpinner size="lg" />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Admin Action Log"
      description="Comprehensive audit trail of all administrative actions"
    >
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Actions</p>
              <p className="text-3xl font-bold text-white mt-1">{logs.length}</p>
            </div>
            <FileText className="w-12 h-12 text-blue-400" />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">User Actions</p>
              <p className="text-3xl font-bold text-white mt-1">
                {logs.filter(l => l.entity_type === 'user').length}
              </p>
            </div>
            <User className="w-12 h-12 text-green-400" />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Security Actions</p>
              <p className="text-3xl font-bold text-white mt-1">
                {logs.filter(l => l.action.includes('ban') || l.action.includes('suspend')).length}
              </p>
            </div>
            <Shield className="w-12 h-12 text-red-400" />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Settings Changes</p>
              <p className="text-3xl font-bold text-white mt-1">
                {logs.filter(l => l.entity_type === 'settings').length}
              </p>
            </div>
            <Settings className="w-12 h-12 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by admin, action, or entity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'user', 'settings', 'security', 'content'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === f
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      {filteredLogs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No audit logs found"
          description="No administrative actions match your filters"
        />
      ) : (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-gray-400 font-medium">Timestamp</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Admin</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Action</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Entity</th>
                  <th className="text-left p-4 text-gray-400 font-medium">IP Address</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 text-gray-400 text-sm">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-white">{log.admin_name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <span className={`px-2 py-1 rounded text-sm ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-300">
                        {log.entity_type} #{log.entity_id}
                      </span>
                    </td>
                    <td className="p-4">
                      <code className="text-blue-400 font-mono text-sm">{log.ip_address}</code>
                    </td>
                    <td className="p-4">
                      <button className="text-blue-400 hover:text-blue-300 text-sm">
                        View Changes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageTemplate>
  );
}
