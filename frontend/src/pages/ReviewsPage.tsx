import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquareCode } from 'lucide-react';
import { useReviews } from '../hooks/useReviews';
import { useRepositories } from '../hooks/useRepositories';
import { SkeletonTable } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Pagination } from '../components/ui/Pagination';
import { ReviewCard } from '../components/cards/ReviewCard';

type SortOption = 'newest' | 'oldest' | 'highestScore' | 'lowestScore';

export const ReviewsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortOption>('newest');
  const [repoFilter, setRepoFilter] = useState('');

  const { data: repos } = useRepositories();
  const { data: reviewsData, isLoading } = useReviews({
    page,
    limit: 20,
    sort,
    repository: repoFilter || undefined,
  });

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'highestScore', label: 'Highest Score' },
    { value: 'lowestScore', label: 'Lowest Score' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Reviews</h1>
          <p className="text-zinc-500 mt-1 text-sm">
            {reviewsData?.total ?? 0} total reviews
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Sort */}
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setSort(opt.value); setPage(1); }}
              className={`px-3 h-7 rounded-lg text-xs font-medium transition-all ${
                sort === opt.value
                  ? 'bg-red-600 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Repository filter */}
        <select
          value={repoFilter}
          onChange={(e) => { setRepoFilter(e.target.value); setPage(1); }}
          className="h-9 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 focus:outline-none focus:border-red-500/50 transition-all"
        >
          <option value="">All Repositories</option>
          {repos?.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      {/* Reviews list */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        {isLoading ? (
          <div className="p-6"><SkeletonTable rows={8} /></div>
        ) : reviewsData?.items && reviewsData.items.length > 0 ? (
          <>
            <div className="p-4 space-y-2">
              {reviewsData.items.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
            <div className="px-6 pb-6">
              <Pagination
                page={reviewsData.page}
                totalPages={reviewsData.totalPages}
                total={reviewsData.total}
                limit={reviewsData.limit}
                onPageChange={setPage}
              />
            </div>
          </>
        ) : (
          <EmptyState
            icon={<MessageSquareCode className="w-8 h-8" />}
            title="No reviews yet"
            description="Connect a repository and open a Pull Request on GitHub to get started."
            className="py-20"
          />
        )}
      </div>
    </motion.div>
  );
};
