import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { clsx } from 'clsx';

type PaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
};

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visible = pages.filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1);

  return (
    <div className="flex items-center justify-between gap-4 pt-4">
      <span className="text-sm text-zinc-500">
        Showing <span className="text-zinc-300">{start}–{end}</span> of{' '}
        <span className="text-zinc-300">{total}</span>
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          leftIcon={<ChevronLeft className="w-4 h-4" />}
        >
          Prev
        </Button>
        {visible.map((p, i) => {
          const prev = visible[i - 1];
          return (
            <React.Fragment key={p}>
              {prev && p - prev > 1 && (
                <span className="px-2 text-zinc-600">…</span>
              )}
              <button
                onClick={() => onPageChange(p)}
                className={clsx(
                  'w-8 h-8 rounded-lg text-sm font-medium transition-all',
                  p === page
                    ? 'bg-red-600 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                )}
              >
                {p}
              </button>
            </React.Fragment>
          );
        })}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          rightIcon={<ChevronRight className="w-4 h-4" />}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
