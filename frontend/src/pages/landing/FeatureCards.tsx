import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, GitMerge, Star, ArrowRight, X, Check } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'AI-Powered Reviews',
    desc: 'Gemini AI analyzes every PR automatically, catching issues humans miss.',
    color: 'red',
    delay: 0,
  },
  {
    icon: Shield,
    title: 'Security Scanning',
    desc: 'Real-time vulnerability detection before your code ships to production.',
    color: 'blue',
    delay: 0.08,
  },
  {
    icon: GitMerge,
    title: 'GitHub Integration',
    desc: 'Seamless webhook automation — zero config, just connect and go.',
    color: 'emerald',
    delay: 0.16,
  },
  {
    icon: Star,
    title: 'Quality Scores',
    desc: 'Objective, consistent code quality metrics surfaced per pull request.',
    color: 'amber',
    delay: 0.24,
  },
];

const colorMap = {
  red: {
    icon: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    glow: 'hover:shadow-red-500/10',
    bar: 'from-red-600 to-red-400',
  },
  blue: {
    icon: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    glow: 'hover:shadow-blue-500/10',
    bar: 'from-blue-500 to-blue-400',
  },
  emerald: {
    icon: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    glow: 'hover:shadow-emerald-500/10',
    bar: 'from-emerald-500 to-emerald-400',
  },
  amber: {
    icon: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    glow: 'hover:shadow-amber-500/10',
    bar: 'from-amber-500 to-amber-400',
  },
};

const featureDetails = {
  'AI-Powered Reviews': {
    title: 'AI-Powered Reviews',
    icon: Zap,
    subtitle: 'Automated PR analysis powered by Gemini AI',
    bullets: [
      { label: 'Automated PR Reviews', text: 'Gemini AI automatically scans and reviews pull requests as soon as they are opened, saving hours of manual inspection.' },
      { label: 'Code Quality Analysis', text: 'Performs deep analysis of structural, stylistic, and architectural patterns to ensure your codebase stays clean.' },
      { label: 'Bug Detection', text: 'Identifies potential race conditions, null pointer exceptions, logic flaws, and memory leaks before they reach production.' },
      { label: 'Best Practices', text: 'Suggests idiomatic improvements, design patterns, and cleaner code structures tailored to your language and framework.' },
      { label: 'Gemini AI Integration', text: "Powered by Google's state-of-the-art Gemini models for unmatched semantic understanding of multi-file contexts." }
    ]
  },
  'Security Scanning': {
    title: 'Security Scanning',
    icon: Shield,
    subtitle: 'Real-time vulnerability and compliance monitoring',
    bullets: [
      { label: 'Vulnerability Detection', text: 'Continuously scans your source files to discover known vulnerabilities and security anti-patterns in real time.' },
      { label: 'Secret Detection', text: 'Prevents credential leaks by identifying API keys, database passwords, private keys, and tokens committed in code.' },
      { label: 'Dependency Scanning', text: 'Scans package locks and manifest files against the latest CVE databases to alert you of vulnerable upstream modules.' },
      { label: 'Security Recommendations', text: 'Provides step-by-step remediation plans and safe alternative configurations to fix security flaws instantly.' },
      { label: 'Safe Coding Practices', text: 'Enforces OWASP Top 10 compliance and highlights insecure patterns like SQL injection or cross-site scripting (XSS).' }
    ]
  },
  'GitHub Integration': {
    title: 'GitHub Integration',
    icon: GitMerge,
    subtitle: 'Seamless, zero-config workspace connectivity',
    bullets: [
      { label: 'GitHub OAuth Login', text: 'Authenticate securely using your GitHub identity. Zero password hassle, instantly pulling your profile and organizations.' },
      { label: 'Repository Connection', text: 'Easily select and authorize specific public or private repositories you want the platform to monitor.' },
      { label: 'Webhook Integration', text: 'Automated webhooks set up on your repository in one click to receive real-time pull request and commit events.' },
      { label: 'Automatic PR Reviews', text: 'Reviews are generated dynamically in line comments on the GitHub interface, making interaction seamless for developers.' },
      { label: 'Repository Synchronization', text: 'Keeps repository state, open branch lists, and pull request events synchronized with the platform dashboard.' }
    ]
  },
  'Quality Scores': {
    title: 'Quality Scores',
    icon: Star,
    subtitle: 'Objective health metrics for your code ecosystem',
    bullets: [
      { label: 'Scoring Methodology', text: 'Aggregates code issues, cognitive complexity, test coverage, and documentation levels into a clear, weighted score.' },
      { label: 'Code Quality Metrics', text: 'Calculates structural soundness, cyclomatic complexity, code duplication, and modularity levels in every branch.' },
      { label: 'Maintainability Analysis', text: 'Predicts codebase health and technical debt over time, highlighting areas that will be difficult to refactor.' },
      { label: 'Performance Impact', text: 'Finds inefficient loops, excessive rendering, slow database operations, or memory-heavy code snippets.' },
      { label: 'Readability & Documentation', text: 'Ensures code clarity, proper commenting, descriptive naming conventions, and docstring presence.' },
      { label: 'Security Score', text: 'Generates a dedicated security rating reflecting the safety profile and patch urgency of your current code state.' }
    ]
  }
};

export const FeatureCards = () => {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveFeature(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeDetails = activeFeature ? featureDetails[activeFeature as keyof typeof featureDetails] : null;
  const ActiveIcon = activeDetails?.icon || Zap;

  return (
    <section className="relative py-28 px-6 overflow-hidden">
      {/* Subtle section separator */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent via-zinc-700 to-transparent" />

      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 mb-4"
          >
            <span className="h-px w-8 bg-red-500" />
            <span className="text-xs font-semibold tracking-widest text-red-400 uppercase">Features</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-4xl font-bold text-white tracking-tight leading-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Everything your team needs
            <br />
            <span className="text-zinc-500">in one intelligent platform.</span>
          </motion.h2>
        </div>

        {/* Cards grid — intentionally asymmetric */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            const c = colorMap[feature.color as keyof typeof colorMap];
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: feature.delay, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, transition: { duration: 0.2, ease: 'easeOut' } }}
                onClick={() => setActiveFeature(feature.title)}
                className={`group relative flex flex-col gap-4 p-6 rounded-2xl border bg-zinc-900/60 backdrop-blur-sm
                  border-zinc-800 hover:border-zinc-700 shadow-xl hover:shadow-2xl ${c.glow}
                  transition-all duration-300 cursor-pointer overflow-hidden`}
              >
                {/* Animated top border line */}
                <div className={`absolute top-0 left-0 h-[2px] w-0 group-hover:w-full bg-gradient-to-r ${c.bar} transition-all duration-500 ease-out rounded-t-2xl`} />

                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${c.icon}`} strokeWidth={1.75} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <h3 className="text-sm font-semibold text-white leading-snug">{feature.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">{feature.desc}</p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveFeature(feature.title);
                  }}
                  className={`mt-auto flex items-center gap-1 text-xs font-medium ${c.icon} opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:outline-none`}
                >
                  <span>Learn more</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Feature Details Modal Overlay */}
      <AnimatePresence>
        {activeFeature && activeDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveFeature(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden z-10 p-6 sm:p-8"
            >
              {/* Top Accent Bar */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-600 via-red-500 to-red-600" />

              {/* Close Button */}
              <button
                onClick={() => setActiveFeature(null)}
                className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/5">
                  <ActiveIcon className="w-6 h-6 text-red-500" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">{activeDetails.title}</h3>
                  <p className="text-xs text-zinc-400 mt-1">{activeDetails.subtitle}</p>
                </div>
              </div>

              {/* Content List */}
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {activeDetails.bullets.map((bullet, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800/80 transition-all duration-200"
                  >
                    <div className="w-5 h-5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-red-400" strokeWidth={3} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-white">{bullet.label}</span>
                      <span className="text-[11px] text-zinc-400 leading-relaxed">{bullet.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

