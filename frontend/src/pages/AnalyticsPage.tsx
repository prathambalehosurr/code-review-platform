import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  AlertCircle,
  Info,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useStatistics } from '../hooks/useDashboard';
import { SkeletonCard } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { StatCard } from '../components/cards/StatCard';

const COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#3b82f6',
  low: '#22c55e',
  info: '#6b7280',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm">
        <p className="text-zinc-400 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color ?? p.fill }} className="font-semibold">
            {p.value} {p.name}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const AnalyticsPage: React.FC = () => {
  const { data: stats, isLoading } = useStatistics();

  const pieData = stats
    ? Object.entries(stats.severityCounts).map(([name, value]) => ({ name, value }))
    : [];

  const trendData = stats?.reviewTrend?.map((point) => ({
    ...point,
    date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  })) ?? [];

  const barData = stats
    ? Object.entries(stats.severityCounts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        fill: COLORS[name as keyof typeof COLORS],
      }))
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-zinc-500 mt-1 text-sm">Code quality trends and review statistics</p>
      </div>

      {/* Stat cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            label="Average Quality Score"
            value={stats?.averageScore ? stats.averageScore.toFixed(1) : '—'}
            suffix="/10"
            icon={<TrendingUp className="w-5 h-5" />}
            accent="primary"
          />
          <StatCard
            label="Repositories Reviewed"
            value={stats?.repositoriesReviewed ?? 0}
            icon={<BarChart3 className="w-5 h-5" />}
            accent="blue"
          />
        </div>
      )}

      {/* Review Trend */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-red-400" />
          Review Trend
        </h2>
        {isLoading ? (
          <div className="h-64 animate-pulse bg-zinc-800 rounded-xl" />
        ) : trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trendData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#dc2626" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#dc2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#dc2626"
                strokeWidth={2}
                fill="url(#trendGrad)"
                dot={{ fill: '#dc2626', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#dc2626' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState
            title="Not enough data"
            description="Reviews will appear here once your first AI review completes."
            className="py-12"
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Bar Chart */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            Findings by Severity
          </h2>
          {isLoading ? (
            <div className="h-52 animate-pulse bg-zinc-800 rounded-xl" />
          ) : barData.length > 0 && barData.some((d) => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={barData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No findings data" className="py-8" />
          )}
        </div>

        {/* Severity Pie Chart */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-400" />
            Severity Distribution
          </h2>
          {isLoading ? (
            <div className="h-52 animate-pulse bg-zinc-800 rounded-xl" />
          ) : pieData.length > 0 && pieData.some((d) => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie
                  data={pieData.filter((d) => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.filter((d) => d.value > 0).map((entry, i) => (
                    <Cell key={i} fill={COLORS[entry.name as keyof typeof COLORS] ?? '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: '#a1a1aa', fontSize: '12px' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No distribution data" className="py-8" />
          )}
        </div>
      </div>
    </motion.div>
  );
};
