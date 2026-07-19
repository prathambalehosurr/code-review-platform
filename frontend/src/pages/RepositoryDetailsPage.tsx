import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GitBranch,
  Globe,
  Lock,
  Zap,
  ZapOff,
  ArrowLeft,
  ExternalLink,
  Trash2,
  MessageSquareCode,
} from 'lucide-react';
import { useRepository, useConnectRepository, useDisconnectRepository, useDeleteRepository, useRepositoryReviews } from '../hooks/useRepositories';
import { RepositorySettings } from '../components/repository/RepositorySettings';
import { ReviewCard } from '../components/cards/ReviewCard';
import { SkeletonCard, SkeletonTable, Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { formatDate } from '../utils/date';

const tabs = ['Overview', 'Reviews', 'Settings'] as const;
type Tab = (typeof tabs)[number];

export const RepositoryDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [deleteModal, setDeleteModal] = useState(false);

  const { data: repo, isLoading: repoLoading } = useRepository(id!);
  const { data: reviews, isLoading: reviewsLoading } = useRepositoryReviews(id!, { limit: 20 });
  const { mutate: connect, isPending: isConnecting } = useConnectRepository();
  const { mutate: disconnect, isPending: isDisconnecting } = useDisconnectRepository();
  const { mutate: deleteRepo, isPending: isDeleting } = useDeleteRepository();

  const handleDelete = () => {
    deleteRepo(id!, { onSuccess: () => navigate('/repositories') });
  };

  if (repoLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <SkeletonCard />
        <SkeletonTable />
      </div>
    );
  }

  if (!repo) {
    return (
      <EmptyState
        title="Repository not found"
        description="This repository doesn't exist or you don't have access to it."
        action={<Button variant="outline" onClick={() => navigate('/repositories')} leftIcon={<ArrowLeft className="w-4 h-4" />}>Back to Repositories</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate('/repositories')}
        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Repositories
      </button>

      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <GitBranch className="w-6 h-6 text-zinc-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-white">{repo.name}</h1>
                {repo.private ? (
                  <Lock className="w-4 h-4 text-zinc-500" />
                ) : (
                  <Globe className="w-4 h-4 text-zinc-500" />
                )}
                <Badge variant={repo.isConnected ? 'success' : 'default'} dot>
                  {repo.isConnected ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
              <p className="text-sm text-zinc-500 mt-0.5">{repo.fullName}</p>
              {repo.description && <p className="text-sm text-zinc-400 mt-1">{repo.description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={repo.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 h-9 rounded-xl text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              GitHub
            </a>
            {repo.isConnected ? (
              <Button
                variant="danger"
                size="md"
                leftIcon={<ZapOff className="w-4 h-4" />}
                isLoading={isDisconnecting}
                onClick={() => disconnect(repo.id)}
              >
                Disconnect
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                leftIcon={<Zap className="w-4 h-4" />}
                isLoading={isConnecting}
                onClick={() => connect(repo.id)}
              >
                Connect
              </Button>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 mt-5 pt-5 border-t border-zinc-800 flex-wrap text-sm text-zinc-500">
          <span>Branch: <span className="text-zinc-300">{repo.defaultBranch}</span></span>
          {repo.language && <span>Language: <span className="text-zinc-300">{repo.language}</span></span>}
          {repo.lastSyncedAt && <span>Synced: <span className="text-zinc-300">{formatDate(repo.lastSyncedAt)}</span></span>}
          <span>Added: <span className="text-zinc-300">{formatDate(repo.createdAt)}</span></span>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-zinc-800">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-all relative ${
              activeTab === tab ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {activeTab === tab && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"
              />
            )}
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'Overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5 text-center">
            <p className="text-2xl font-bold text-white">{reviews?.total ?? 0}</p>
            <p className="text-xs text-zinc-500 mt-1">Total Reviews</p>
          </div>
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5 text-center">
            <p className="text-2xl font-bold text-emerald-400">
              {reviews?.items?.filter((r) => r.status === 'published').length ?? 0}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Published</p>
          </div>
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5 text-center">
            <p className="text-2xl font-bold text-red-400">
              {reviews?.items?.filter((r) => r.status === 'failed').length ?? 0}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Failed</p>
          </div>
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5 text-center">
            <p className="text-2xl font-bold text-amber-400">
              {reviews?.items && reviews.items.length > 0
                ? (reviews.items.reduce((acc, r) => acc + (r.overallScore ?? 0), 0) / reviews.items.length).toFixed(1)
                : '—'}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Avg Score</p>
          </div>
        </motion.div>
      )}

      {activeTab === 'Reviews' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          {reviewsLoading ? (
            <SkeletonTable />
          ) : reviews?.items && reviews.items.length > 0 ? (
            reviews.items.map((review) => <ReviewCard key={review.id} review={review} />)
          ) : (
            <EmptyState
              icon={<MessageSquareCode className="w-8 h-8" />}
              title="No reviews yet"
              description="Open a Pull Request on GitHub to trigger an AI review."
            />
          )}
        </motion.div>
      )}

      {activeTab === 'Settings' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <RepositorySettings repositoryId={id!} />
          <div className="mt-8 pt-6 border-t border-zinc-800">
            <h3 className="text-sm font-semibold text-red-400 mb-3">Danger Zone</h3>
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white">Remove Repository</p>
                <p className="text-xs text-zinc-500 mt-0.5">Remove this repository from the platform. This cannot be undone.</p>
              </div>
              <Button variant="danger" size="sm" leftIcon={<Trash2 className="w-4 h-4" />} onClick={() => setDeleteModal(true)}>
                Remove
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Delete modal */}
      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Remove Repository">
        <p className="text-sm text-zinc-400 mb-6">
          Are you sure you want to remove <strong className="text-white">{repo.name}</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" isLoading={isDeleting} onClick={handleDelete} leftIcon={<Trash2 className="w-4 h-4" />}>
            Remove Repository
          </Button>
        </div>
      </Modal>
    </div>
  );
};
