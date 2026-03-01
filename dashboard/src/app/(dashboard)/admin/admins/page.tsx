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
import { Shield, Search, Plus, Edit, Trash2, Ban } from 'lucide-react';

interface Admin {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
  status: 'active' | 'suspended';
  last_login: string;
  created_at: string;
}

export default function AdminAccountsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'super_admin'>('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    setLoading(true);
    const response = await api.admins.list();
    if (response.success && response.data) {
      setAdmins(response.data);
    }
    setLoading(false);
  };

  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         admin.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || admin.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleEdit = (admin: Admin) => {
    setSelectedAdmin(admin);
    setEditModalOpen(true);
  };

  const handleSuspend = async (admin: Admin) => {
    if (!confirm(`Suspend ${admin.name}?`)) return;
    const response = await api.admins.update(admin.id, { status: 'suspended' });
    if (response.success) {
      showToast('Admin suspended successfully', 'success');
      loadAdmins();
    } else {
      showToast(response.error || 'Failed to suspend admin', 'error');
    }
  };

  const handleDelete = async (admin: Admin) => {
    if (!confirm(`Delete ${admin.name}? This action cannot be undone.`)) return;
    const response = await api.admins.remove(admin.id);
    if (response.success) {
      showToast('Admin deleted successfully', 'success');
      loadAdmins();
    } else {
      showToast(response.error || 'Failed to delete admin', 'error');
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: (admin: Admin) => (
        <Badge variant={admin.role === 'super_admin' ? 'info' : 'success'}>
          {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (admin: Admin) => (
        <Badge variant={admin.status === 'active' ? 'success' : 'error'}>
          {admin.status}
        </Badge>
      ),
    },
    { key: 'last_login', label: 'Last Login' },
    {
      key: 'actions',
      label: 'Actions',
      render: (admin: Admin) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleEdit(admin)}>
            <Edit className="w-4 h-4" />
          </Button>
          {admin.status === 'active' && (
            <Button size="sm" variant="ghost" onClick={() => handleSuspend(admin)}>
              <Ban className="w-4 h-4" />
            </Button>
          )}
          <Button size="sm" variant="danger" onClick={() => handleDelete(admin)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Admin Accounts</h1>
          <p className="text-slate-400 text-sm mt-1">Manage administrator accounts and permissions</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Admin
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as any)}
          className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-md text-slate-100 text-sm"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
      </div>

      <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
        <DataTable
          data={filteredAdmins}
          columns={columns}
          loading={loading}
          emptyState={<EmptyState icon={Shield} title="No admins found" />}
        />
      </div>

      <CreateAdminModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          loadAdmins();
          setCreateModalOpen(false);
        }}
      />

      <EditAdminModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        admin={selectedAdmin}
        onSuccess={() => {
          loadAdmins();
          setEditModalOpen(false);
        }}
      />
    </div>
  );
}

function CreateAdminModal({ isOpen, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const response = await api.admins.create(formData);
    setLoading(false);

    if (response.success) {
      showToast('Admin created successfully', 'success');
      onSuccess();
      setFormData({ name: '', email: '', password: '', role: 'admin' });
    } else {
      showToast(response.error || 'Failed to create admin', 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Admin" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          placeholder="John Doe"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <Input
          label="Email"
          type="email"
          placeholder="admin@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-md text-slate-100"
          >
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
        <div className="flex gap-2 justify-end pt-4">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create Admin
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function EditAdminModal({ isOpen, onClose, admin, onSuccess }: any) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'admin',
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (admin) {
      setFormData({
        name: admin.name,
        email: admin.email,
        role: admin.role,
      });
    }
  }, [admin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admin) return;

    setLoading(true);
    const response = await api.admins.update(admin.id, formData);
    setLoading(false);

    if (response.success) {
      showToast('Admin updated successfully', 'success');
      onSuccess();
    } else {
      showToast(response.error || 'Failed to update admin', 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Admin" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-md text-slate-100"
          >
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
        <div className="flex gap-2 justify-end pt-4">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Update Admin
          </Button>
        </div>
      </form>
    </Modal>
  );
}
