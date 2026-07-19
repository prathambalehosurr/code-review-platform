import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import React from 'react';

type CardProps = {
  hover?: boolean;
  glass?: boolean;
  gradient?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
};

export const Card: React.FC<CardProps> = ({
  hover = false,
  glass = false,
  gradient = false,
  className,
  children,
  onClick,
}) => {
  const base = clsx(
    'rounded-2xl border border-zinc-800 bg-zinc-900',
    glass && 'backdrop-blur-md bg-zinc-900/60',
    gradient && 'bg-gradient-to-br from-zinc-900 to-zinc-950',
    onClick && 'cursor-pointer',
    className
  );

  if (hover || onClick) {
    return (
      <motion.div
        className={base}
        whileHover={{ scale: 1.005, borderColor: 'rgba(124,58,237,0.3)' }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }

  return <div className={base}>{children}</div>;
};
