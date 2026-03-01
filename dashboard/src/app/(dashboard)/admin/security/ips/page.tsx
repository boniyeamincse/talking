'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { Shield, Plus } from 'lucide-react';

interface BannedIP {
  id: number;
  ip_address: string;
  reason: string;
  type: 'temporary' | 'permanent';
  banned_at: string;
  expires_at?: string;
}

export default function BannedIPsPage() {
  const [ips, setIps] = useState<BannedIP[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadIPs();
  }, []);

  const loadIPs = async () => {
    setLoading(true);
    const response = await api.get('/admin/security/banned-ips');
    if (response.success && response.data) {
      setIps(response.data);
    }
    setLoading(false);
  };

  const handleUnban = async (id: number, ip: string) => {
    if (!confirm(`Unban ${ip}?`)) return;
    const response = await api.post(`/admin/security/banned-ips/${id}/unban`, {});
    if (response.success) {
      showToast('IP unbanned successfully', 'success');
      loadIPs();
    } else {
      showToast(response.error || 'Failed to unban IP', 'error');
    }
  };

  const columns = [
    { key: 'ip_address', label: 'IP Address' },
    { key: 'reason', label: 'Reason' },
    {
      key: 'type',
      label: 'Type',
      render: (ip: BannedIP) => (
        <Badge variant={ip.type === 'permanent' ? 'error' : 'warning'}>
          {ip.type}
        </Badge>
      ),
    },
    {
      key: 'banned_at',
      label: 'Banned At',
      render: (ip: BannedIP) => (
        <span className="text-slate-300 text-sm">
          {new Date(ip.banned_at).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'expires_at',
      label: 'Expires',
      render: (ip: BannedIP) => (
        <span className="text-slate-400 text-sm">
          {ip.expires_at ? new Date(ip.expires_at).toLocaleString() : 'Never'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (ip: BannedIP) => (
        <Button size="sm" variant="ghost" onClick={() => handleUnban(ip.id, ip.ip_address)}>
          Unban
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Banned IP Addresses</h1>
          <p className="text-slate-400 text-sm mt-1">Manage IP bans and restrictions</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add IP Ban
        </Button>
      </div>

      <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
        <DataTable
          data={ips}
          columns={columns}
          loading={loading}
          emptyState={<EmptyState icon={Shield} title="No banned IPs" />}
        />
      </div>

      <AddIPBanModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          loadIPs();
          setModalOpen(false);
        }}
      />
    </div>
  );
}

function AddIPBanModal({ isOpen, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    ip_address: '',
    reason: '',
    type: 'permanent',
    days: '',
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const response = await api.post('/admin/security/banned-ips', formData);
    setLoading(false);

    if (response.success) {
      showToast('IP banned successfully', 'success');
      onSuccess();
      setFormData({ ip_address: '', reason: '', type: 'permanent', days: '' });
    } else {
      showToast(response.error || 'Failed to ban IP', 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add IP Ban" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="IP Address"
          placeholder="192.168.1.1"
          value={formData.ip_address}
          onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
          required
        />
        <Input
          label="Reason"
          placeholder="Suspicious activity"
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          required
        />
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Ban Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-md text-slate-100"
          >
            <option value="permanent">Permanent</option>
            <option value="temporary">Temporary</option>
          </select>
        </div>
        {formData.type === 'temporary' && (
          <Input
            label="Duration (days)"
            type="number"
            placeholder="7"
            value={formData.days}
            onChange={(e) => setFormData({ ...formData, days: e.target.value })}
            required
          />
        )}
        <div className="flex gap-2 justify-end pt-4">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Ban IP
          </Button>
        </div>
      </form>
    </Modal>
  );
}
