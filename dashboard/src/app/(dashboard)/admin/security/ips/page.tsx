'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import PageTemplate from '@/components/PageTemplate';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { Shield, Ban, Trash2, Plus } from 'lucide-react';

interface BannedIP {
  id: number;
  ip_address: string;
  reason: string;
  banned_by: string;
  banned_at: string;
  expires_at: string | null;
  attempts: number;
}

export default function BannedIPsPage() {
  const [ips, setIps] = useState<BannedIP[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newIP, setNewIP] = useState({ ip: '', reason: '', duration: '24' });

  useEffect(() => {
    loadBannedIPs();
  }, []);

  const loadBannedIPs = async () => {
    const response = await api.get('/admin/security/banned-ips');
    if (response.success) {
      setIps(response.data);
    }
    setLoading(false);
  };

  const handleBanIP = async () => {
    const response = await api.post('/admin/security/banned-ips', {
      ip_address: newIP.ip,
      reason: newIP.reason,
      duration_hours: parseInt(newIP.duration),
    });

    if (response.success) {
      setShowAddModal(false);
      setNewIP({ ip: '', reason: '', duration: '24' });
      loadBannedIPs();
    }
  };

  const handleUnban = async (id: number) => {
    if (!confirm('Are you sure you want to unban this IP?')) return;
    
    const response = await api.post(`/admin/security/banned-ips/${id}/unban`, {});
    if (response.success) {
      loadBannedIPs();
    }
  };

  if (loading) {
    return (
      <PageTemplate title="Banned IP Addresses" description="Manage blocked IP addresses">
        <LoadingSpinner size="lg" />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Banned IP Addresses"
      description="Manage and monitor blocked IP addresses for security"
      actions={
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
        >
          <Ban className="w-4 h-4" />
          Ban IP Address
        </button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Banned</p>
              <p className="text-3xl font-bold text-white mt-1">{ips.length}</p>
            </div>
            <Shield className="w-12 h-12 text-red-400" />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Permanent Bans</p>
              <p className="text-3xl font-bold text-white mt-1">
                {ips.filter(ip => !ip.expires_at).length}
              </p>
            </div>
            <Ban className="w-12 h-12 text-orange-400" />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Temporary Bans</p>
              <p className="text-3xl font-bold text-white mt-1">
                {ips.filter(ip => ip.expires_at).length}
              </p>
            </div>
            <Shield className="w-12 h-12 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Banned IPs Table */}
      {ips.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No banned IPs"
          description="No IP addresses are currently banned"
        />
      ) : (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-gray-400 font-medium">IP Address</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Reason</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Attempts</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Banned By</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Banned At</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Expires</th>
                  <th className="text-right p-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ips.map((ip) => (
                  <tr key={ip.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <code className="text-blue-400 font-mono text-sm">{ip.ip_address}</code>
                    </td>
                    <td className="p-4 text-gray-300">{ip.reason}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-sm">
                        {ip.attempts} attempts
                      </span>
                    </td>
                    <td className="p-4 text-gray-300">{ip.banned_by}</td>
                    <td className="p-4 text-gray-400 text-sm">
                      {new Date(ip.banned_at).toLocaleString()}
                    </td>
                    <td className="p-4">
                      {ip.expires_at ? (
                        <span className="text-yellow-400 text-sm">
                          {new Date(ip.expires_at).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-red-400 text-sm">Permanent</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleUnban(ip.id)}
                        className="px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors text-sm"
                      >
                        Unban
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add IP Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-6">Ban IP Address</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">IP Address</label>
                <input
                  type="text"
                  value={newIP.ip}
                  onChange={(e) => setNewIP({ ...newIP, ip: e.target.value })}
                  placeholder="192.168.1.1"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Reason</label>
                <textarea
                  value={newIP.reason}
                  onChange={(e) => setNewIP({ ...newIP, reason: e.target.value })}
                  placeholder="Reason for banning this IP..."
                  rows={3}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Duration (hours)</label>
                <select
                  value={newIP.duration}
                  onChange={(e) => setNewIP({ ...newIP, duration: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500"
                >
                  <option value="1">1 hour</option>
                  <option value="6">6 hours</option>
                  <option value="24">24 hours</option>
                  <option value="168">7 days</option>
                  <option value="720">30 days</option>
                  <option value="0">Permanent</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBanIP}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Ban IP
              </button>
            </div>
          </div>
        </div>
      )}
    </PageTemplate>
  );
}
