import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down';
  icon: LucideIcon;
  iconColor?: string;
}

export default function StatCard({ title, value, change, trend = 'up', icon: Icon, iconColor = 'bg-primary-600' }: StatCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-slate-100 mt-2">{value}</p>
          {change && (
            <p className={cn(
              'text-sm mt-1 flex items-center gap-1',
              trend === 'up' ? 'text-green-400' : 'text-red-400'
            )}>
              <span>{trend === 'up' ? '↑' : '↓'}</span>
              {change}
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-lg', iconColor)}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}
