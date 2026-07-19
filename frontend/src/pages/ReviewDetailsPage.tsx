import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  GitPullRequest,
  GitBranch,
  FileCode,
  Star,
  CheckCircle,
  AlertCircle,
  Plus,
  Minus,
  Calendar,
} from 'lucide-react';
import { useReview } from '../hooks/useReviews';
import { FindingItem } from '../components/reviews/FindingItem';
import { Badge, severityVariant } from '../components/ui/Badge';
import { SkeletonCard, Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { formatDate } from '../utils/date';

const statusVariant = (status: string) => {
  const map: Record<string, 'success' | 'blue' | 'warning' | 'danger'> = {
    published: 'success',
    completed: 'blue',
    pending: 'warning',
    failed: 'danger',
  };
  return map[status] ?? 'default';
};

export const ReviewDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: review, isLoading } = useReview(id!);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!review) {
    return (
      <EmptyState
        title="Review not found"
        description="This review doesn't exist or you don't have access to it."
        action={
          <Button variant="outline" onClick={() => navigate('/reviews')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Reviews
          </Button>
        }
      />
    );
  }

  const severityCounts = {
    critical: review.statistics?.critical ?? 0,
    high: review.statistics?.high ?? 0,
    medium: review.statistics?.medium ?? 0,
    low: review.statistics?.low ?? 0,
    info: review.statistics?.info ?? 0,
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back */}
      <button
        onClick={() => navigate('/reviews')}
        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Reviews
      </button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
      >
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <GitPullRequest className="w-5 h-5 text-zinc-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">PR #{review.pullRequestNumber}</h1>
                <Badge variant={statusVariant(review.status) as any} dot>{review.status}</Badge>
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-zinc-500">
                <span className="flex items-center gap-1">
                  <GitBranch className="w-3.5 h-3.5" />
                  {review.branch}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(review.createdAt)}
                </span>
              </div>
            </div>
          </div>
          {review.overallScore !== undefined && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Star className="w-5 h-5 text-amber-400" />
              <span className="text-2xl font-black text-white tabular-nums">{review.overallScore}</span>
              <span className="text-sm text-zinc-500">/10</span>
            </div>
          )}
        </div>

        {/* Commit */}
        <div className="text-xs text-zinc-600 font-mono bg-zinc-800/50 px-3 py-2 rounded-lg inline-block">
          {review.commitSha.slice(0, 12)}
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-5 gap-3"
      >
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 text-center">
          <p className="text-xl font-bold text-white">{review.statistics?.filesReviewed ?? 0}</p>
          <p className="text-xs text-zinc-500 mt-1">Files Reviewed</p>
        </div>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 text-center">
          <p className="text-xl font-bold text-emerald-400 flex items-center justify-center gap-1">
            <Plus className="w-3.5 h-3.5" />{review.statistics?.additions ?? 0}
          </p>
          <p className="text-xs text-zinc-500 mt-1">Additions</p>
        </div>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 text-center">
          <p className="text-xl font-bold text-red-400 flex items-center justify-center gap-1">
            <Minus className="w-3.5 h-3.5" />{review.statistics?.deletions ?? 0}
          </p>
          <p className="text-xs text-zinc-500 mt-1">Deletions</p>
        </div>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 text-center">
          <p className="text-xl font-bold text-white">{review.statistics?.findingsCount ?? 0}</p>
          <p className="text-xs text-zinc-500 mt-1">Findings</p>
        </div>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 text-center">
          <p className="text-xl font-bold text-red-400">{severityCounts.critical}</p>
          <p className="text-xs text-zinc-500 mt-1">Critical</p>
        </div>
      </motion.div>

      {/* AI Summary */}
      {review.summary && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
        >
          <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-red-400" />
            AI Summary
          </h2>
          <p className="text-sm text-zinc-300 leading-relaxed">{review.summary}</p>
        </motion.div>
      )}

      {/* Severity breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
      >
        <h2 className="text-base font-semibold text-white mb-4">Severity Breakdown</h2>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(severityCounts) as [string, number][]).map(([key, val]) => (
            <div key={key} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700">
              <Badge variant={severityVariant(key as any)}>{key}</Badge>
              <span className="text-sm font-semibold text-white">{val}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Positives */}
      {review.positives && review.positives.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6"
        >
          <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            What's Good
          </h2>
          <ul className="space-y-2">
            {review.positives.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                {p}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Findings */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
      >
        <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          Findings ({review.findings?.length ?? 0})
        </h2>
        {review.findings && review.findings.length > 0 ? (
          <div className="space-y-2">
            {review.findings.map((f, i) => (
              <FindingItem key={i} finding={f} index={i} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm text-zinc-400">No findings — clean code!</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
