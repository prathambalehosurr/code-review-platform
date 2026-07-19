import React from 'react';
import { clsx } from 'clsx';

type SkeletonProps = {
  className?: string;
  lines?: number;
};

export const Skeleton: React.FC<SkeletonProps> = ({ className, lines }) => {
  if (lines && lines > 1) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              'animate-pulse rounded-lg bg-zinc-800',
              i === lines - 1 ? 'w-3/4' : 'w-full',
              className || 'h-4'
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={clsx('animate-pulse rounded-lg bg-zinc-800', className)} />
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={clsx('rounded-2xl border border-zinc-800 bg-zinc-900 p-6', className)}>
    <div className="flex items-center gap-3 mb-4">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <div className="flex-1">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
    <Skeleton lines={3} className="h-3" />
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>
    ))}
  </div>
);
