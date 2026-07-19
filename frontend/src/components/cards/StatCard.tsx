import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { clsx } from 'clsx';

type StatCardProps = {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  suffix?: string;
  accent?: 'primary' | 'blue' | 'green' | 'orange';
  delay?: number;
};

const accentColors = {
  primary: {
    icon: 'bg-red-500/10 border-red-500/20 text-red-400',
    glow: 'shadow-red-500/10',
  },
  blue: {
    icon: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    glow: 'shadow-blue-500/10',
  },
  green: {
    icon: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    glow: 'shadow-emerald-500/10',
  },
  orange: {
    icon: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
    glow: 'shadow-orange-500/10',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  trend,
  suffix,
  accent = 'primary',
  delay = 0,
}) => {
  const colors = accentColors[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 30 }}
      whileHover={{ scale: 1.02 }}
      className={clsx(
        'rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-lg',
        colors.glow
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={clsx(
            'w-10 h-10 rounded-xl flex items-center justify-center border',
            colors.icon
          )}
        >
          {icon}
        </div>
        {trend !== undefined && (
          <div
            className={clsx(
              'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg',
              trend > 0
                ? 'text-emerald-400 bg-emerald-500/10'
                : trend < 0
                ? 'text-red-400 bg-red-500/10'
                : 'text-zinc-400 bg-zinc-800'
            )}
          >
            {trend > 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : trend < 0 ? (
              <TrendingDown className="w-3 h-3" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-3xl font-bold text-white tabular-nums">
          {value}
          {suffix && <span className="text-lg text-zinc-500 ml-1">{suffix}</span>}
        </p>
        <p className="text-sm text-zinc-500 mt-1">{label}</p>
      </div>
    </motion.div>
  );
};
