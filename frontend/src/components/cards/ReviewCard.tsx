import React from 'react';
import { motion } from 'framer-motion';
import { GitPullRequest, Calendar, Star } from 'lucide-react';
import { Badge } from '../ui/Badge';
import type { Review } from '../../types/review';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from '../../utils/date';

type ReviewCardProps = {
  review: Review;
};

const statusVariant = (status: Review['status']) => {
  const map = {
    published: 'success' as const,
    completed: 'blue' as const,
    pending: 'warning' as const,
    failed: 'danger' as const,
  };
  return map[status] ?? 'default';
};

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ scale: 1.005, borderColor: 'rgba(124,58,237,0.2)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onClick={() => navigate(`/reviews/${review.id}`)}
      className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900 cursor-pointer hover:bg-zinc-900/80 transition-colors"
    >
      <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
        <GitPullRequest className="w-4 h-4 text-zinc-400" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-white">PR #{review.pullRequestNumber}</span>
          <Badge variant={statusVariant(review.status)} dot>
            {review.status}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span className="truncate">{review.branch}</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDistanceToNow(review.createdAt)}
          </span>
        </div>
      </div>

      {review.overallScore !== undefined && (
        <div className="flex-shrink-0 flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-sm font-bold text-white tabular-nums">{review.overallScore}</span>
          <span className="text-xs text-zinc-500">/10</span>
        </div>
      )}

      {review.statistics && (
        <div className="hidden sm:flex flex-shrink-0 items-center gap-2">
          {review.statistics.critical > 0 && (
            <Badge variant="danger" className="text-xs">{review.statistics.critical} critical</Badge>
          )}
          {review.statistics.high > 0 && (
            <Badge variant="warning" className="text-xs">{review.statistics.high} high</Badge>
          )}
        </div>
      )}
    </motion.div>
  );
};
