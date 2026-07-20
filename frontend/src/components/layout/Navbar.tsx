import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ChevronDown, LogOut, Settings, ExternalLink, BellOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'New PR Review Completed',
      description: 'Gemini AI successfully completed review for pull request #45 on backend-service.',
      time: '2 minutes ago',
      read: false,
    },
    {
      id: '2',
      title: 'Security Vulnerability Found',
      description: 'Critical vulnerability detected in package lodash (version 4.17.20). Upgrade recommended.',
      time: '1 hour ago',
      read: false,
    },
    {
      id: '3',
      title: 'New Repository Synced',
      description: 'Repository code-review-platform was successfully connected and webhooks initialized.',
      time: '1 day ago',
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setNotificationsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
      {/* Left: breadcrumb or empty */}
      <div />

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Notifications bell and Popover Container */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className={`relative w-9 h-9 rounded-xl flex items-center justify-center border transition-all focus:outline-none focus:ring-2 focus:ring-red-500/30 ${
              notificationsOpen
                ? 'text-white bg-zinc-850 border-zinc-700'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800 border-transparent'
            }`}
            aria-label="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white ring-2 ring-zinc-950">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden"
              >
                {/* Header */}
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-white">Notifications</h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-red-400 hover:text-red-300 font-medium transition-all"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                      <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
                        <BellOff className="w-5 h-5 text-zinc-500" />
                      </div>
                      <p className="text-sm font-medium text-white">No new notifications</p>
                      <p className="text-xs text-zinc-500 mt-1">You're all caught up!</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-900">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleMarkAsRead(notif.id)}
                          className={`p-4 transition-all duration-200 relative cursor-pointer hover:bg-zinc-900/60 ${
                            !notif.read ? 'bg-red-500/[0.01]' : ''
                          }`}
                        >
                          {/* Unread Left Border Highlight */}
                          {!notif.read && (
                            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-red-600" />
                          )}

                          <div className="flex items-start justify-between gap-3">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-semibold ${!notif.read ? 'text-white' : 'text-zinc-400'}`}>
                                  {notif.title}
                                </span>
                                {!notif.read && (
                                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-[11px] text-zinc-500 leading-relaxed">
                                {notif.description}
                              </p>
                              <span className="text-[10px] text-zinc-600 mt-1">
                                {notif.time}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 pl-2 pr-3 h-9 rounded-xl hover:bg-zinc-800 transition-all"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-zinc-700"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-xs text-white font-semibold">
                {user?.displayName?.[0] ?? 'U'}
              </div>
            )}
            <span className="text-sm text-zinc-300 font-medium hidden sm:block">
              {user?.displayName ?? user?.username ?? 'User'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="absolute right-0 top-full mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl shadow-black/50 overflow-hidden"
              >
                <div className="p-3 border-b border-zinc-800">
                  <p className="text-sm font-semibold text-white">{user?.displayName ?? 'User'}</p>
                  <p className="text-xs text-zinc-500">@{user?.username}</p>
                </div>
                <div className="p-1.5">
                  <Link
                    to="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  {user?.profileUrl && (
                    <a
                      href={user.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      GitHub Profile
                    </a>
                  )}
                  <button
                    onClick={() => { setMenuOpen(false); logout(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
