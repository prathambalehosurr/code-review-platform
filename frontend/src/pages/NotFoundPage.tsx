import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => (
  <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center px-6"
    >
      <p className="text-9xl font-black text-zinc-800 mb-4">404</p>
      <h1 className="text-3xl font-bold text-white mb-2">Page not found</h1>
      <p className="text-zinc-500 mb-8 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/dashboard">
        <Button variant="primary" leftIcon={<Home className="w-4 h-4" />}>
          Back to Dashboard
        </Button>
      </Link>
    </motion.div>
  </div>
);
