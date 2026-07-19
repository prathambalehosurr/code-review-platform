import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={clsx('flex flex-col items-center justify-center text-center py-16 px-6', className)}
  >
    {icon && (
      <div className="mb-4 p-4 rounded-2xl bg-zinc-800/50 border border-zinc-800 text-zinc-500">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    {description && <p className="text-sm text-zinc-500 max-w-sm mb-6">{description}</p>}
    {action && <div>{action}</div>}
  </motion.div>
);
