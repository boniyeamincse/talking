'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import PageTemplate from '@/components/PageTemplate';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Shield, Smartphone, Key, CheckCircle, XCircle } from 'lucide-react';

interface TwoFactorStats {
  total_admins: number;
  enabled_2fa: number;
  disabled_2fa: number;
  enforcement_enabled: boolean;
}

interface AdminWith2FA {
  id: number;
  name: string;
  email: string;
  role: string;
  two_factor_enabled: boolean;
  two_factor_method: string | null;
  last_2fa_at: string | null;
}

export default function TwoFactorAuthPage() {
  const [stats, setStats] = useState<TwoFactorStats | null>(null);
  const [admins, setAdmins] = useState<AdminWith2FA[]>([]);
  const [loading, setLoading] = useState(true);
  const [enforcement, setEnforcement] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [statsRes, adminsRes] = await Promise.all([
      api.get('/admin/security/2fa/stats'),
      api.get('/admin/security/2fa/admins'),
    ]);

    if (statsRes.success) {
      setStats(statsRes.data);
      setEnforcement(statsRes.data.enforcement_enabled);
    }
    if (adminsRes.success) {
      setAdmins(adminsRes.data);
    }
    setLoading(false);
  };

  const toggleEnforcement = async () => {
    const response = await api.post('/admin/security/2fa/enforcement', {
      enabled: !enforcement,
    });

    if (response.success) {
      setEnforcement(!enforcement);
    }
  };

  const handleReset2FA = async (adminId: number) => {
    if (!confirm('Are you sure you want to reset 2FA for this admin?')) return;

    const response = await api.post(`/admin/security/2fa/${adminId}/reset`, {});
    if (response.success) {
      loadData();
    }
  };

  if (loading) {
    return (
      <PageTemplate title="Two-Factor Authentication" description="Manage 2FA settings">
        <LoadingSpinner size="lg" />
      </PageTemplate>
    );
  }

  const enabledPercentage = stats
    ? Math.round((stats.enabled_2fa / stats.total_admins) * 100)
    : 0;

  return (
    <PageTemplate
      title="Two-Factor Authentication"
      description="Manage and enforce 2FA for admin accounts"
    >
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Admins</p>
              <p className="text-3xl font-bold text-white mt-1">{stats?.total_admins}</p>
            </div>
            <Shield className="w-12 h-12 text-blue-400" />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">2FA Enabled</p>
              <p className="text-3xl font-bold text-green-400 mt-1">{stats?.enabled_2fa}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">2FA Disabled</p>
              <p className="text-3xl font-bold text-red-400 mt-1">{stats?.disabled_2fa}</p>
            </div>
            <XCircle className="w-12 h-12 text-red-400" />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Adoption Rate</p>
              <p className="text-3xl font-bold text-white mt-1">{enabledPercentage}%</p>
            </div>
            <Smartphone className="w-12 h-12 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Enforcement Setting */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Enforce 2FA for All Admins</h3>
            <p className="text-gray-400">
              When enabled, all admin accounts must have 2FA enabled to access the dashboard
            </p>
          </div>
          <button
            onClick={toggleEnforcement}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              enforcement ? 'bg-green-500' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                enforcement ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Admin List */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-xl font-bold text-white">Admin 2FA Status</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-gray-400 font-medium">Admin</th>
                <th className="text-left p-4 text-gray-400 font-medium">Role</th>
                <th className="text-left p-4 text-gray-400 font-medium">2FA Status</th>
                <th className="text-left p-4 text-gray-400 font-medium">Method</th>
                <th className="text-left p-4 text-gray-400 font-medium">Last Used</th>
                <th className="text-right p-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div>
                      <p className="text-white font-medium">{admin.name}</p>
                      <p className="text-gray-400 text-sm">{admin.email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-sm ${
                      admin.role === 'super_admin'
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </span>
                  </td>
                  <td className="p-4">
                    {admin.two_factor_enabled ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-green-400">Enabled</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-red-400" />
                        <span className="text-red-400">Disabled</span>
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    {admin.two_factor_method ? (
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">{admin.two_factor_method}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="p-4 text-gray-400 text-sm">
                    {admin.last_2fa_at
                      ? new Date(admin.last_2fa_at).toLocaleString()
                      : 'Never'}
                  </td>
                  <td className="p-4 text-right">
                    {admin.two_factor_enabled && (
                      <button
                        onClick={() => handleReset2FA(admin.id)}
                        className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors text-sm"
                      >
                        Reset 2FA
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <Key className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h4 className="text-lg font-bold text-white mb-2">How to Enable 2FA</h4>
            <ol className="text-gray-300 space-y-2 list-decimal list-inside">
              <li>Go to your profile settings</li>
              <li>Click on "Security" tab</li>
              <li>Click "Enable Two-Factor Authentication"</li>
              <li>Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)</li>
              <li>Enter the 6-digit code to verify</li>
              <li>Save your backup codes in a secure location</li>
            </ol>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}
