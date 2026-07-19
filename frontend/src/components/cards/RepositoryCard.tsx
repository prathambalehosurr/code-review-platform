import React from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Lock, Globe, Zap, ZapOff, ExternalLink } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { Repository } from '../../types/repository';

type RepositoryCardProps = {
  repo: Repository;
  onConnect?: (id: string) => void;
  onDisconnect?: (id: string) => void;
  isConnecting?: boolean;
  isDisconnecting?: boolean;
  onClick?: () => void;
};

const languageColors: Record<string, string> = {
  TypeScript: 'bg-blue-400',
  JavaScript: 'bg-yellow-400',
  Python: 'bg-green-400',
  Go: 'bg-cyan-400',
  Rust: 'bg-orange-400',
  Java: 'bg-red-400',
  'C++': 'bg-pink-400',
  Ruby: 'bg-red-400',
  PHP: 'bg-indigo-400',
  default: 'bg-zinc-400',
};

export const RepositoryCard: React.FC<RepositoryCardProps> = ({
  repo,
  onConnect,
  onDisconnect,
  isConnecting,
  isDisconnecting,
  onClick,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, borderColor: 'rgba(124,58,237,0.25)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <GitBranch className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">{repo.name}</h3>
            <p className="text-xs text-zinc-500 truncate">{repo.fullName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {repo.private ? (
            <Lock className="w-3.5 h-3.5 text-zinc-600" />
          ) : (
            <Globe className="w-3.5 h-3.5 text-zinc-600" />
          )}
          <Badge variant={repo.isConnected ? 'success' : 'default'} dot>
            {repo.isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
      </div>

      {repo.description && (
        <p className="text-xs text-zinc-500 mb-3 line-clamp-2">{repo.description}</p>
      )}

      <div className="flex items-center gap-3 mb-4">
        {repo.language && (
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${languageColors[repo.language] ?? languageColors.default}`}
            />
            <span className="text-xs text-zinc-400">{repo.language}</span>
          </div>
        )}
        <span className="text-xs text-zinc-600">
          {repo.defaultBranch}
        </span>
      </div>

      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        {repo.isConnected ? (
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDisconnect?.(repo.id)}
            isLoading={isDisconnecting}
            leftIcon={<ZapOff className="w-3.5 h-3.5" />}
          >
            Disconnect
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onConnect?.(repo.id)}
            isLoading={isConnecting}
            leftIcon={<Zap className="w-3.5 h-3.5" />}
          >
            Connect
          </Button>
        )}
        <a
          href={repo.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 px-3 h-8 rounded-xl text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 border border-transparent hover:border-zinc-700 transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          GitHub
        </a>
      </div>
    </motion.div>
  );
};
