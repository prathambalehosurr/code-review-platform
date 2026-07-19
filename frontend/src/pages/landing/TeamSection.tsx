import { useState } from 'react';
import { motion } from 'framer-motion';

import teamPhoto from '../../assets/images/team-photo.jpg';

const TEAM_PHOTO_SRC = teamPhoto;


// ─── Data ─────────────────────────────────────────────────────────────────

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  github: string;
  linkedin: string;
}

const team: TeamMember[] = [
  {
    name: 'Prashanth Malagi',
    role: 'Full Stack Developer',
    bio: 'Architecting the platform end-to-end — scalable APIs to pixel-perfect interfaces.',
    github: 'https://github.com/prashantmalagi',
    linkedin: 'https://www.linkedin.com/in/prashanthmalagi/',
  },
  {
    name: 'Pratham Balehosur',
    role: 'Full Stack Developer',
    bio: 'Integrating Gemini AI to deliver intelligent, context-aware code review analysis.',
    github: 'https://github.com/prathambalehosurr',
    linkedin: 'https://www.linkedin.com/in/prathambalehosur/',
  },
  {
    name: 'Sumeeth Vernekar',
    role: 'Full Stack Developer',
    bio: 'Crafting seamless developer experiences with thoughtful UI and micro-interactions.',
    github: 'https://github.com/SumeethVernekar',
    linkedin: 'https://www.linkedin.com/in/sumeethvernekar/',
  },
  {
    name: 'Varun BS',
    role: 'Full Stack Developer',
    bio: 'Building robust infrastructure and GitHub webhook pipelines that never go down.',
    github: 'https://github.com/varun29s',
    linkedin: 'https://www.linkedin.com/in/varun-bs?utm_source=share_via&utm_content=profile&utm_medium=member_android',
  },
  {
    name: 'Vinayak kudlamath',
    role: 'Full Stack Developer',
    bio: 'Keeping deployments fast and reliable through CI/CD automation and cloud infrastructure.',
    github: 'https://github.com/vinayakkudlamath',
    linkedin: 'https://www.linkedin.com/in/vinayak-kudlamath/',
  },
];

const roleColors: Record<string, { text: string; bg: string; border: string }> = {
  'Full Stack Developer': { text: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/25' },
};

// ─── Icons ────────────────────────────────────────────────────────────────

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

// ─── Group Photo ──────────────────────────────────────────────────────────

const GroupPhoto = () => {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[960px] mx-auto"
    >
      <div
        className="relative overflow-hidden rounded-[20px] border border-red-500/20
          shadow-2xl shadow-black/60"
      >
        {/* Thin red top-line accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent z-10" />

        {imgFailed ? (
          /* ── Graceful fallback ── */
          <div className="w-full aspect-[16/7] bg-zinc-900 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
            <p className="text-sm text-zinc-500 text-center">
              Place your photo at{' '}
              <code className="text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded text-xs">
                src/assets/images/team-photo.jpg
              </code>
            </p>
          </div>
        ) : (
          <img
            src={TEAM_PHOTO_SRC}
            alt="The CodeReview.ai team"
            className="w-full h-auto object-contain block"
            onError={() => setImgFailed(true)}
          />
        )}
      </div>
    </motion.div>
  );
};

// ─── Name Card ────────────────────────────────────────────────────────────

const NameCard = ({ member, index }: { member: TeamMember; index: number }) => {
  const colors = roleColors[member.role] ?? {
    text: 'text-zinc-400',
    bg: 'bg-zinc-800',
    border: 'border-zinc-700',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-32px' }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -5, transition: { duration: 0.18, ease: 'easeOut' } }}
      className="group relative flex flex-col gap-3 p-5 rounded-2xl overflow-hidden
        border border-zinc-800 hover:border-zinc-700
        hover:shadow-2xl hover:shadow-red-500/5
        transition-all duration-300"
      style={{
        background: 'rgba(24, 18, 18, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(220,38,38,0.08) 0%, transparent 65%)',
        }}
      />

      {/* Top accent line — animates in on hover */}
      <div className="absolute top-0 left-0 h-[2px] w-0 group-hover:w-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500 ease-out rounded-t-2xl" />

      {/* Name + role */}
      <div>
        <h3 className="text-sm font-semibold text-white leading-snug">{member.name}</h3>
        <span
          className={`inline-block mt-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border
            ${colors.text} ${colors.bg} ${colors.border}`}
        >
          {member.role}
        </span>
      </div>

      {/* Bio */}
      <p className="text-xs text-zinc-500 leading-relaxed">{member.bio}</p>

      {/* Social links */}
      <div className="flex items-center gap-2 mt-auto pt-1">
        <a
          href={member.github}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${member.name} on GitHub`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
            text-zinc-400 bg-zinc-800/80 border border-zinc-700
            hover:text-white hover:border-zinc-600 hover:bg-zinc-700
            transition-all duration-200"
        >
          <GitHubIcon />
          GitHub
        </a>
        <a
          href={member.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${member.name} on LinkedIn`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
            text-zinc-400 bg-zinc-800/80 border border-zinc-700
            hover:text-blue-400 hover:border-blue-500/40 hover:bg-blue-500/10
            transition-all duration-200"
        >
          <LinkedInIcon />
          LinkedIn
        </a>
      </div>
    </motion.div>
  );
};

// ─── Section ──────────────────────────────────────────────────────────────

export const TeamSection = () => (
  <section className="relative py-28 px-6 overflow-hidden">
    {/* Subtle background tint */}
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-950/5 to-transparent pointer-events-none" />
    {/* Section separator line */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent via-zinc-700 to-transparent" />

    <div className="max-w-6xl mx-auto">

      {/* ── Section header ── */}
      <div className="mb-14 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="inline-flex items-center gap-2 mb-5"
        >
          <span className="h-px w-8 bg-red-500" />
          <span className="text-xs font-semibold tracking-widest text-red-400 uppercase">Team</span>
          <span className="h-px w-8 bg-red-500" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.06 }}
          className="text-4xl font-bold text-white tracking-tight"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Meet the team
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="mt-3 text-zinc-500 text-base"
        >
          Built by passionate developers behind{' '}
          <span className="text-red-400 font-medium">CodeReview.ai</span>
        </motion.p>
      </div>

      {/* ── Large group photo ── */}
      <GroupPhoto />

      {/* ── Name cards ── */}
      <div className="mt-10 space-y-4">
        {/* Top row: 3 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.slice(0, 3).map((member, i) => (
            <NameCard key={member.name} member={member} index={i} />
          ))}
        </div>
        {/* Bottom row: 2 cards centered */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:max-w-[66%] lg:mx-auto">
          {team.slice(3).map((member, i) => (
            <NameCard key={member.name} member={member} index={i + 3} />
          ))}
        </div>
      </div>

    </div>
  </section>
);
