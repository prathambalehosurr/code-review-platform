import React from 'react';
import type { Finding } from '../../types/review';
import { Badge, severityVariant } from '../ui/Badge';
import { AlertCircle, Lightbulb, FileCode, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

type FindingItemProps = {
  finding: Finding;
  index?: number;
};

const categoryIcons: Record<string, React.ReactNode> = {
  bug: <AlertCircle className="w-4 h-4" />,
  security: <AlertCircle className="w-4 h-4" />,
  performance: <AlertCircle className="w-4 h-4" />,
  style: <FileCode className="w-4 h-4" />,
  maintainability: <FileCode className="w-4 h-4" />,
};

export const FindingItem: React.FC<FindingItemProps> = ({ finding, index = 0 }) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="border border-zinc-800 rounded-xl overflow-hidden"
    >
      <button
        className="w-full flex items-center gap-3 p-4 hover:bg-zinc-800/30 transition-colors text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={clsx(
          'flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center border',
          finding.severity === 'critical' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
          finding.severity === 'high' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
          finding.severity === 'medium' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
          'bg-zinc-800 border-zinc-700 text-zinc-400'
        )}>
          {categoryIcons[finding.category] ?? <AlertCircle className="w-4 h-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-white">{finding.title}</span>
            <Badge variant={severityVariant(finding.severity)}>{finding.severity}</Badge>
            <Badge variant="default">{finding.category}</Badge>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              <FileCode className="w-3 h-3" />
              {finding.filename}
              {finding.line ? `:${finding.line}` : ''}
            </span>
            <span className="text-xs text-zinc-600">
              {Math.round(finding.confidence * 100)}% confidence
            </span>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-zinc-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-zinc-500 flex-shrink-0" />
        )}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-zinc-800/60 pt-3">
              <p className="text-sm text-zinc-300">{finding.description}</p>
              {finding.suggestion && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/5 border border-red-500/15">
                  <Lightbulb className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-red-400 mb-1">Suggestion</p>
                    <p className="text-sm text-zinc-300">{finding.suggestion}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
