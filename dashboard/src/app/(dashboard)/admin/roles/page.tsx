'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Shield, Users, Crown } from 'lucide-react';

interface Role {
  id: number;
  name: string;
  slug: string;
  permissions: string[];
}

const AVAILABLE_PERMISSIONS = [
  { key: 'users.view', label: 'View Users', category: 'Users' },
  { key: 'users.edit', label: 'Edit Users', category: 'Users' },
  { key: 'users.suspend', label: 'Suspend Users', category: 'Users' },
  { key: 'users.ban', label: 'Ban Users', category: 'Users' },
  { key: 'content.moderate', label: 'Moderate Content', category: 'Content' },
  { key: 'content.delete', label: 'Delete Content', category: 'Content' },
  { key: 'reports.view', label: 'View Reports', category: 'Reports' },
  { key: 'reports.resolve', label: 'Resolve Reports', category: 'Reports' },
  { key: 'analytics.view', label: 'View Analytics', category: 'Analytics' },
  { key: 'settings.manage', label: 'Manage Settings', category: 'Settings' },
  { key: 'admins.manage', label: 'Manage Admins', category: 'Admins' },
];

export default function RolesPermissionsPage() {
  const [roles, setRoles] = useState<Role[]>([
    {
      id: 1,
      name: 'Super Admin',
      slug: 'super_admin',
      permissions: AVAILABLE_PERMISSIONS.map(p => p.key),
    },
    {
      id: 2,
      name: 'Admin',
      slug: 'admin',
      permissions: [
        'users.view',
        'users.edit',
        'users.suspend',
        'content.moderate',
        'content.delete',
        'reports.view',
        'reports.resolve',
      ],
    },
  ]);
  const { showToast } = useToast();

  const handleTogglePermission = (roleId: number, permission: string) => {
    setRoles(roles.map(role => {
      if (role.id === roleId) {
        const hasPermission = role.permissions.includes(permission);
        return {
          ...role,
          permissions: hasPermission
            ? role.permissions.filter(p => p !== permission)
            : [...role.permissions, permission],
        };
      }
      return role;
    }));
  };

  const handleSave = async () => {
    showToast('Permissions updated successfully', 'success');
  };

  const groupedPermissions = AVAILABLE_PERMISSIONS.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_PERMISSIONS>);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Roles & Permissions</h1>
          <p className="text-slate-400 text-sm mt-1">Manage role-based access control</p>
        </div>
        <Button onClick={handleSave}>
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {roles.map(role => (
          <Card key={role.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                {role.slug === 'super_admin' ? (
                  <Crown className="w-5 h-5 text-purple-400" />
                ) : (
                  <Shield className="w-5 h-5 text-green-400" />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">{role.name}</h3>
                  <Badge variant={role.slug === 'super_admin' ? 'info' : 'success'}>
                    {role.permissions.length} permissions
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(groupedPermissions).map(([category, perms]) => (
                  <div key={category}>
                    <h4 className="text-sm font-medium text-slate-300 mb-2">{category}</h4>
                    <div className="space-y-2">
                      {perms.map(perm => (
                        <label key={perm.key} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={role.permissions.includes(perm.key)}
                            onChange={() => handleTogglePermission(role.id, perm.key)}
                            disabled={role.slug === 'super_admin'}
                            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-slate-400">{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
