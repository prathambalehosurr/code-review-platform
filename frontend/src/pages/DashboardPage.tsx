import React from 'react';
import { motion } from 'framer-motion';
import { GitBranch, MessageSquareCode, Activity, Star, Clock } from 'lucide-react';
import { StatCard } from '../components/cards/StatCard';
import { ReviewCard } from '../components/cards/ReviewCard';
import { SkeletonCard, SkeletonTable } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { useDashboard } from '../hooks/useDashboard';
import { useReviews } from '../hooks/useReviews';
import { useAuth } from '../hooks/useAuth';

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { data: dashboard, isLoading: dashLoading } = useDashboard();
  const { data: reviewsData, isLoading: reviewsLoading } = useReviews({ limit: 5, sort: 'newest' });

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-white">
          {greeting}, {user?.displayName?.split(' ')[0] ?? 'there'} 👋
        </h1>
        <p className="text-zinc-500 mt-1">Here's what's happening with your code reviews today.</p>
      </motion.div>

      {/* Stat cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {dashLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))
        ) : (
          <>
            <StatCard
              label="Total Repositories"
              value={dashboard?.totalRepositories ?? 0}
              icon={<GitBranch className="w-5 h-5" />}
              accent="primary"
              delay={0}
            />
            <StatCard
              label="Connected Repos"
              value={dashboard?.connectedRepositories ?? 0}
              icon={<Activity className="w-5 h-5" />}
              accent="blue"
              delay={0.05}
            />
            <StatCard
              label="Total AI Reviews"
              value={dashboard?.totalReviews ?? 0}
              icon={<MessageSquareCode className="w-5 h-5" />}
              accent="green"
              delay={0.1}
            />
            <StatCard
              label="Average Score"
              value={dashboard?.averageScore ? dashboard.averageScore.toFixed(1) : '—'}
              suffix="/10"
              icon={<Star className="w-5 h-5" />}
              accent="orange"
              delay={0.15}
            />
          </>
        )}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Reviews */}
        <motion.div variants={itemVariants} className="xl:col-span-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-zinc-500" />
                Recent Reviews
              </h2>
            </div>
            {reviewsLoading ? (
              <SkeletonTable rows={4} />
            ) : reviewsData?.items && reviewsData.items.length > 0 ? (
              <div className="space-y-2">
                {reviewsData.items.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<MessageSquareCode className="w-8 h-8" />}
                title="No reviews yet"
                description="Connect a repository and open a Pull Request on GitHub to get started."
              />
            )}
          </div>
        </motion.div>

        {/* Quick stats sidebar */}
        <motion.div variants={itemVariants} className="space-y-4">
          {/* Reviews last 30 days */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="text-sm font-semibold text-zinc-400 mb-1">Last 30 Days</h3>
            <p className="text-4xl font-black text-white mb-1">
              {dashboard?.reviewsLast30Days ?? 0}
            </p>
            <p className="text-xs text-zinc-500">reviews completed</p>
          </div>

          {/* Repository summary */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="text-sm font-semibold text-zinc-400 mb-3">Repository Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Total</span>
                <span className="text-sm font-semibold text-white">{dashboard?.totalRepositories ?? 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Connected</span>
                <span className="text-sm font-semibold text-emerald-400">{dashboard?.connectedRepositories ?? 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Not Connected</span>
                <span className="text-sm font-semibold text-zinc-500">
                  {(dashboard?.totalRepositories ?? 0) - (dashboard?.connectedRepositories ?? 0)}
                </span>
              </div>
              {/* Progress bar */}
              {(dashboard?.totalRepositories ?? 0) > 0 && (
                <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${((dashboard?.connectedRepositories ?? 0) / (dashboard?.totalRepositories ?? 1)) * 100}%`,
                    }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="h-1.5 rounded-full bg-gradient-to-r from-red-600 to-red-400"
                  />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
