'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { User } from '@/lib/types';
import { ArrowLeft, Mail, Calendar, Shield, AlertTriangle, Ban, Undo } from 'lucide-react';
import Link from 'next/link';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadUser();
    }
  }, [params.id]);

  const loadUser = async () => {
    const response = await api.users.get(Number(params.id));
    if (response.success && response.data) {
      setUser(response.data);
    }
    setLoading(false);
  };

  const handleWarn = async () => {
    if (!user) return;
    const reason = prompt('Enter warning reason:');
    if (!reason) return;

    setActionLoading(true);
    const response = await api.users.warn(user.id, reason);
    if (response.success) {
      alert('User warned successfully');
      loadUser();
    } else {
      alert('Failed to warn user: ' + response.error);
    }
    setActionLoading(false);
  };

  const handleSuspend = async () => {
    if (!user) return;
    const reason = prompt('Enter suspension reason:');
    if (!reason) return;

    setActionLoading(true);
    const response = await api.users.suspend(user.id, reason);
    if (response.success) {
      alert('User suspended successfully');
      loadUser();
    } else {
      alert('Failed to suspend user: ' + response.error);
    }
    setActionLoading(false);
  };

  const handleBan = async () => {
    if (!user) return;
    if (!confirm('Are you sure you want to ban this user? This action is severe.')) return;
    const reason = prompt('Enter ban reason:');
    if (!reason) return;

    setActionLoading(true);
    const response = await api.users.ban(user.id, reason);
    if (response.success) {
      alert('User banned successfully');
      loadUser();
    } else {
      alert('Failed to ban user: ' + response.error);
    }
    setActionLoading(false);
  };

  const handleRestore = async () => {
    if (!user) return;
    setActionLoading(true);
    const response = await api.users.restore(user.id);
    if (response.success) {
      alert('User restored successfully');
      loadUser();
    } else {
      alert('Failed to restore user: ' + response.error);
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User not found</h2>
          <Link
            href="/admin/users"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            Back to Users
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/users"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Details</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Viewing profile for {user.username}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Profile Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 h-20 w-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">@{user.username}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Email
                  </label>
                  <p className="text-gray-900 dark:text-white flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Role
                  </label>
                  <p className="text-gray-900 dark:text-white flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    {user.role.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </label>
                  <p className="text-gray-900 dark:text-white capitalize">{user.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Joined
                  </label>
                  <p className="text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {user.profile && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Additional Information
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Bio
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {user.profile.bio || 'No bio provided'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Country
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {user.profile.country_code || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Gender
                    </label>
                    <p className="text-gray-900 dark:text-white capitalize">
                      {user.profile.gender || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              {user.status === 'active' && (
                <>
                  <button
                    onClick={handleWarn}
                    disabled={actionLoading}
                    className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Warn User
                  </button>
                  <button
                    onClick={handleSuspend}
                    disabled={actionLoading}
                    className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Ban className="w-4 h-4" />
                    Suspend User
                  </button>
                  <button
                    onClick={handleBan}
                    disabled={actionLoading}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Ban className="w-4 h-4" />
                    Ban User
                  </button>
                </>
              )}
              {(user.status === 'suspended' || user.status === 'banned') && (
                <button
                  onClick={handleRestore}
                  disabled={actionLoading}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Undo className="w-4 h-4" />
                  Restore Account
                </button>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Statistics
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Followers</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {user.profile?.followers_count || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Following</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {user.profile?.following_count || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
