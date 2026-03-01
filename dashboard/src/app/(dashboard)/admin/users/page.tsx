'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import DataTable from '@/components/ui/DataTable';
import Input from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { Search, Users, UserCheck } from 'lucide-react';
import Link from 'next/link';

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
  status: string;
  email_verified_at: string | null;
  last_seen_at: string | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const response = await api.users.list();
    if (response.success && response.data) {
      setUsers(response.data.data || response.data);
    }
    setLoading(false);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: 'username',
      label: 'User',
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-medium text-slate-100">{user.username}</div>
            <div className="text-xs text-slate-400">{user.name}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (user: User) => (
        <div>
          <div className="text-sm text-slate-300">{user.email}</div>
          {user.email_verified_at && (
            <div className="text-xs text-green-400 flex items-center gap-1 mt-1">
              <UserCheck className="w-3 h-3" />
              Verified
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (user: User) => (
        <Badge variant={
          user.role === 'super_admin' ? 'info' :
          user.role === 'admin' ? 'success' : 'default'
        }>
          {user.role.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (user: User) => (
        <Badge variant={
          user.status === 'active' ? 'success' :
          user.status === 'suspended' ? 'warning' : 'error'
        }>
          {user.status}
        </Badge>
      ),
    },
    {
      key: 'last_seen_at',
      label: 'Last Seen',
      render: (user: User) => (
        <span className="text-sm text-slate-400">
          {user.last_seen_at ? new Date(user.last_seen_at).toLocaleDateString() : 'Never'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (user: User) => (
        <Link
          href={`/admin/users/${user.id}`}
          className="text-blue-400 hover:text-blue-300 text-sm"
        >
          View Details
        </Link>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">User Management</h1>
          <p className="text-slate-400 text-sm mt-1">Manage all users on the platform</p>
        </div>
        <Link
          href="/admin/users/verified"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Verified Users
        </Link>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by username, email, or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-md text-slate-100 text-sm"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
        <DataTable
          data={filteredUsers}
          columns={columns}
          loading={loading}
          emptyState={<EmptyState icon={Users} title="No users found" description="Try adjusting your search or filter" />}
        />
      </div>
    </div>
  );
}
