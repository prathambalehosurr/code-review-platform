import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Bell, Palette, Webhook, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

// Inline GitHub SVG
const GithubIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 mx-auto max-w-5xl"
    >
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-zinc-500 mt-1 text-sm">Manage your account and application preferences</p>
      </div>

      {/* GitHub Account */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <GithubIcon />
            GitHub Account
          </h2>
        </div>
        <div className="p-6 flex items-center gap-4">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.displayName} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-zinc-700" />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-red-600/20 border border-red-500/20 flex items-center justify-center text-xl font-bold text-red-400">
              {user?.displayName?.[0] ?? 'U'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-white">{user?.displayName}</p>
            <p className="text-sm text-zinc-500">@{user?.username}</p>
            {user?.email && <p className="text-xs text-zinc-600 mt-0.5">{user.email}</p>}
          </div>
          {user?.profileUrl && (
            <a
              href={user.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 h-9 rounded-xl text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              Profile
            </a>
          )}
        </div>
      </div>

      {/* App Theme */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Appearance
          </h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Theme</p>
              <p className="text-xs text-zinc-500 mt-0.5">The platform uses dark mode by default</p>
            </div>
            <Badge variant="primary">Dark Mode</Badge>
          </div>
        </div>
      </div>

      {/* Webhook Status */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Webhook className="w-4 h-4" />
            Webhook Configuration
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-800/50 border border-zinc-800">
            <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white">Webhook Endpoint</p>
              <p className="text-xs font-mono text-zinc-400 mt-1">POST /api/v1/webhooks/github</p>
              <p className="text-xs text-zinc-500 mt-1">
                Configure this URL in your GitHub repository settings. Reviews are automatically triggered on new pull requests.
              </p>
            </div>
          </div>
          <p className="text-xs text-zinc-600">
            Webhooks are verified using HMAC-SHA256 signature validation. Ensure your repository settings include the correct webhook secret.
          </p>
        </div>
      </div>

      {/* Notifications placeholder */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-zinc-500">
            Notification preferences will be available in a future update. Reviews are posted as GitHub PR comments.
          </p>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-red-500/20">
          <h2 className="text-sm font-semibold text-red-400">Danger Zone</h2>
        </div>
        <div className="p-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white">Sign Out</p>
            <p className="text-xs text-zinc-500 mt-0.5">Sign out of your account on this device</p>
          </div>
          <Button
            variant="danger"
            leftIcon={<LogOut className="w-4 h-4" />}
            onClick={logout}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
