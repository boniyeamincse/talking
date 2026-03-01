'use client';

import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md px-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20">
          <ShieldAlert className="w-10 h-10 text-red-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Access Denied</h1>
          <p className="text-slate-400">
            You don't have permission to access this page. Please contact your administrator.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button variant="ghost" onClick={() => router.back()}>
            Go Back
          </Button>
          <Button onClick={() => router.push('/login')}>
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
}
