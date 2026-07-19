import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, RefreshCw, Search } from 'lucide-react';
import { RepositoryCard } from '../components/cards/RepositoryCard';
import { SkeletonCard } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { SearchBar } from '../components/ui/SearchBar';
import { useRepositories, useConnectRepository, useDisconnectRepository, useSyncRepositories } from '../hooks/useRepositories';
import { useNavigate } from 'react-router-dom';

const pageVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export const RepositoriesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'connected' | 'disconnected'>('all');
  const navigate = useNavigate();

  const { data: repos, isLoading } = useRepositories();
  const { mutate: sync, isPending: isSyncing } = useSyncRepositories();
  const { mutate: connect, isPending: isConnecting, variables: connectingId } = useConnectRepository();
  const { mutate: disconnect, isPending: isDisconnecting, variables: disconnectingId } = useDisconnectRepository();

  const filtered = (repos ?? []).filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.fullName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'connected' && r.isConnected) ||
      (filter === 'disconnected' && !r.isConnected);
    return matchesSearch && matchesFilter;
  });

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Repositories</h1>
          <p className="text-zinc-500 mt-1 text-sm">
            {repos?.length ?? 0} repositories · {repos?.filter((r) => r.isConnected).length ?? 0} connected
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />}
          isLoading={isSyncing}
          onClick={() => sync()}
        >
          Sync Repositories
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex items-center gap-3 flex-wrap">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search repositories…"
          className="w-64"
        />
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
          {(['all', 'connected', 'disconnected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 h-7 rounded-lg text-xs font-medium transition-all capitalize ${
                filter === f
                  ? 'bg-red-600 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Repository grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((repo) => (
            <RepositoryCard
              key={repo.id}
              repo={repo}
              onConnect={(id) => connect(id)}
              onDisconnect={(id) => disconnect(id)}
              isConnecting={isConnecting && connectingId === repo.id}
              isDisconnecting={isDisconnecting && disconnectingId === repo.id}
              onClick={() => navigate(`/repositories/${repo.id}`)}
            />
          ))}
        </div>
      ) : repos?.length === 0 ? (
        <EmptyState
          icon={<GitBranch className="w-8 h-8" />}
          title="No repositories synced yet"
          description="Click Sync Repositories to import your GitHub repositories."
          action={
            <Button
              variant="primary"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              isLoading={isSyncing}
              onClick={() => sync()}
            >
              Sync Now
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={<Search className="w-8 h-8" />}
          title="No results found"
          description={`No repositories match "${search}"`}
        />
      )}
    </motion.div>
  );
};
