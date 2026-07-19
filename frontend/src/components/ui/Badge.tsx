import { clsx } from 'clsx';
import type { Severity } from '../../types/review';

type BadgeVariant = 'default' | 'success' | 'danger' | 'warning' | 'info' | 'primary' | 'blue';

type BadgeProps = {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
};

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-zinc-800 text-zinc-300 border-zinc-700/50',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  danger: 'bg-red-500/10 text-red-400 border-red-500/30',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  primary: 'bg-red-500/10 text-red-400 border-red-500/30',
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
};

const dotStyles: Record<BadgeVariant, string> = {
  default: 'bg-zinc-400',
  success: 'bg-emerald-400',
  danger: 'bg-red-400',
  warning: 'bg-amber-400',
  info: 'bg-blue-400',
  primary: 'bg-red-400',
  blue: 'bg-blue-400',
};

export const severityVariant = (severity: Severity): BadgeVariant => {
  const map: Record<Severity, BadgeVariant> = {
    critical: 'danger',
    high: 'warning',
    medium: 'info',
    low: 'success',
    info: 'default',
  };
  return map[severity];
};

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', children, className, dot }) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variantStyles[variant],
        className
      )}
    >
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', dotStyles[variant])} />}
      {children}
    </span>
  );
};
