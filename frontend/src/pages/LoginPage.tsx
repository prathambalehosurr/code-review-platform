import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, CheckCircle2, ArrowRight, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { HeroIllustration } from './landing/HeroIllustration';
import { FeatureCards } from './landing/FeatureCards';
import { TeamSection } from './landing/TeamSection';
import { ParticleBackground } from './landing/ParticleBackground';

// GitHub icon
const GithubIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const trustBadges = [
  { icon: CheckCircle2, label: 'No credit card required' },
  { icon: Lock, label: 'SOC 2 compliant' },
  { icon: Zap, label: 'Setup in 60 seconds' },
];

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div
      className="min-h-screen bg-zinc-950 text-white overflow-x-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
    >
      {/* ── Particle layer ── */}
      <ParticleBackground />

      {/* ── Mesh radial glow ── */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {/* Red radial behind hero */}
        <div
          className="absolute"
          style={{
            top: '-10%',
            left: '20%',
            width: '60vw',
            height: '60vh',
            background: 'radial-gradient(ellipse at center, rgba(220,38,38,0.09) 0%, transparent 70%)',
          }}
        />
        {/* Blue secondary orb */}
        <div
          className="absolute"
          style={{
            top: '30%',
            right: '-5%',
            width: '40vw',
            height: '40vh',
            background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.06) 0%, transparent 70%)',
          }}
        />
        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
          }}
        />
      </div>

      {/* ── Navbar ── */}
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 flex items-center justify-between px-6 md:px-10 py-5 max-w-[1320px] mx-auto"
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center shadow-lg shadow-red-500/30">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-base font-bold tracking-tight text-white">
            CodeReview<span className="text-red-400">.ai</span>
          </span>
        </div>

        {/* Nav right */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            v1.0 · Early Access
          </span>
        </div>
      </motion.nav>

      {/* ── Hero ── */}
      <section className="relative z-10 min-h-[calc(100vh-72px)] flex items-center">
        <div className="w-full max-w-[1320px] mx-auto px-6 md:px-10 py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px_380px] gap-10 xl:gap-14 items-center">

            {/* ── Left: Headline ── */}
            <div className="flex flex-col gap-6 lg:gap-8">
              {/* Eyebrow badge */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
              >
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-red-300 bg-red-500/10 border border-red-500/20 rounded-full px-3.5 py-1.5">
                  <Zap className="w-3 h-3" />
                  Powered by Gemini AI
                  <ArrowRight className="w-3 h-3 opacity-60" />
                </span>
              </motion.div>

              {/* Headline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <h1
                  className="text-4xl sm:text-5xl xl:text-[3.5rem] font-bold text-white leading-[1.1] tracking-tight"
                >
                  AI code reviews
                  <br />
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #f87171 0%, #ef4444 50%, #dc2626 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    on autopilot.
                  </span>
                </h1>
              </motion.div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.18 }}
                className="text-base text-zinc-400 leading-relaxed max-w-sm"
              >
                Connect your GitHub repos and get intelligent, automated code reviews on every pull request — in seconds.
              </motion.p>

              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.26 }}
                className="flex flex-wrap gap-x-5 gap-y-2"
              >
                {trustBadges.map((b) => (
                  <div key={b.label} className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <b.icon className="w-3.5 h-3.5 text-zinc-600" strokeWidth={1.75} />
                    {b.label}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* ── Center: Illustration ── */}
            <div className="hidden lg:flex items-center justify-center h-[340px]">
              <HeroIllustration />
            </div>

            {/* ── Right: Login Card ── */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              {/* Mobile illustration */}
              <div className="flex lg:hidden justify-center mb-8">
                <div className="w-64 h-52 opacity-80">
                  <HeroIllustration />
                </div>
              </div>

              {/* Glass card */}
              <div
                className="relative rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl shadow-black/60"
                style={{
                  background: 'rgba(18,12,12,0.88)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                }}
              >
                {/* Subtle top highlight — red tint */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />

                <div className="p-8">
                  {/* Card header */}
                  <div className="mb-7">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center">
                        <Zap className="w-3 h-3 text-white" strokeWidth={2.5} />
                      </div>
                      <span className="text-xs font-semibold text-zinc-400 tracking-wide">CodeReview.ai</span>
                    </div>
                    <h2 className="mt-3 text-xl font-bold text-white leading-tight">
                      Start reviewing code
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500">
                      Connect your GitHub to begin in under a minute.
                    </p>
                  </div>

                  {/* Error state */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-2"
                    >
                      <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-red-400 flex-shrink-0" />
                      <p className="text-xs text-red-400 leading-relaxed">
                        {error === 'github_auth_failed'
                          ? 'GitHub authentication failed. Please try again.'
                          : 'An error occurred. Please try again.'}
                      </p>
                    </motion.div>
                  )}

                  {/* GitHub button */}
                  <motion.button
                    onClick={login}
                    whileHover={{ scale: 1.015, y: -1 }}
                    whileTap={{ scale: 0.985 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="w-full relative flex items-center justify-center gap-2.5 h-11 px-5 rounded-xl
                      font-semibold text-sm text-white
                      bg-zinc-800 border border-zinc-700
                      hover:bg-zinc-750 hover:border-zinc-600
                      hover:shadow-lg hover:shadow-red-500/10
                      transition-all duration-200 cursor-pointer"
                  >
                    <GithubIcon />
                    Continue with GitHub
                  </motion.button>

                  {/* Divider */}
                  <div className="my-6 flex items-center gap-3">
                    <div className="flex-1 h-px bg-zinc-800" />
                    <span className="text-xs text-zinc-600">secure & private</span>
                    <div className="flex-1 h-px bg-zinc-800" />
                  </div>

                  {/* What you get list */}
                  <div className="flex flex-col gap-2.5">
                    {[
                      'AI reviews on every PR',
                      'Security vulnerability detection',
                      'Code quality scoring',
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2.5 text-xs text-zinc-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" strokeWidth={2} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card footer */}
                <div className="px-8 py-4 border-t border-zinc-800/80 bg-zinc-950/40">
                  <p className="text-[11px] text-zinc-600 leading-relaxed text-center">
                    By signing in, you allow read access to your GitHub repositories for AI code review.{' '}
                    <span className="text-zinc-500 hover:text-zinc-400 cursor-pointer transition-colors">Privacy Policy</span>
                    {' · '}
                    <span className="text-zinc-500 hover:text-zinc-400 cursor-pointer transition-colors">Terms</span>
                  </p>
                </div>
              </div>

              {/* Social proof */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-5 flex items-center justify-center gap-3 text-xs text-zinc-600"
              >
                <div className="flex -space-x-1.5">
                  {['PM', 'AS', 'NK', 'RD', 'DR'].map((initials) => (
                    <div
                      key={initials}
                      className="w-5 h-5 rounded-full bg-zinc-700 border border-zinc-800 flex items-center justify-center text-[7px] font-bold text-zinc-300 select-none"
                    >
                      {initials}
                    </div>
                  ))}
                </div>
                <span>Trusted by <strong className="text-zinc-400">200+</strong> developers</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Feature Cards ── */}
      <FeatureCards />

      {/* ── Team Section ── */}
      <TeamSection />

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-zinc-800/60 mt-8">
        <div className="max-w-[1320px] mx-auto px-6 md:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold text-white">
              CodeReview<span className="text-red-400">.ai</span>
            </span>
          </div>

          <div className="flex items-center gap-5 text-xs text-zinc-600">
            <span className="hover:text-zinc-400 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-zinc-400 cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-zinc-400 cursor-pointer transition-colors">Status</span>
            <span>© 2025 CodeReview.ai</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
