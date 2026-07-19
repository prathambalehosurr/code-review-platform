import { motion } from 'framer-motion';

export const HeroIllustration = () => {
  return (
    <motion.div
      className="relative w-full h-full flex items-center justify-center select-none pointer-events-none"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Floating container */}
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="relative w-[420px] h-[340px]"
      >
        <svg
          viewBox="0 0 420 340"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            {/* Main card gradient */}
            <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1a1215" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#1e1014" stopOpacity="0.95" />
            </linearGradient>
            {/* Red accent */}
            <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#b91c1c" />
            </linearGradient>
            {/* Blue accent */}
            <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
            {/* Green check */}
            <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            {/* Glow filter */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000" floodOpacity="0.4" />
            </filter>
            <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#dc2626" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* ---- Background glow orbs ---- */}
          <circle cx="210" cy="160" r="110" fill="#dc2626" fillOpacity="0.05" />
          <circle cx="300" cy="120" r="70" fill="#2563eb" fillOpacity="0.05" />

          {/* ---- Main code review card ---- */}
          <rect x="60" y="30" width="300" height="200" rx="16"
            fill="url(#cardGrad)" stroke="#ffffff14" strokeWidth="1"
            filter="url(#softShadow)"
          />

          {/* Card top bar */}
          <rect x="60" y="30" width="300" height="40" rx="16" fill="#ffffff08" />
          <rect x="60" y="54" width="300" height="16" fill="#ffffff08" />

          {/* Window dots */}
          <circle cx="82" cy="50" r="4.5" fill="#ef4444" fillOpacity="0.8" />
          <circle cx="96" cy="50" r="4.5" fill="#f59e0b" fillOpacity="0.8" />
          <circle cx="110" cy="50" r="4.5" fill="#22c55e" fillOpacity="0.8" />

          {/* File label */}
          <rect x="130" y="42" width="110" height="16" rx="4" fill="#ffffff10" />
          <text x="136" y="54" fontFamily="monospace" fontSize="8" fill="#a1a1aa">
            pull_request.diff
          </text>

          {/* --- Diff lines --- */}
          <rect x="60" y="70" width="28" height="152" fill="#ffffff04" />

          {/* Line 1 - removed */}
          <rect x="88" y="76" width="260" height="16" rx="2" fill="#ef444414" />
          <rect x="88" y="76" width="3" height="16" fill="#ef4444" fillOpacity="0.7" />
          <text x="68" y="88" fontFamily="monospace" fontSize="7" fill="#52525b">01</text>
          <text x="97" y="88" fontFamily="monospace" fontSize="7.5" fill="#ef4444" fillOpacity="0.85">
            - const validate = (input) =&gt; input
          </text>

          {/* Line 2 - added */}
          <rect x="88" y="96" width="260" height="16" rx="2" fill="#22c55e14" />
          <rect x="88" y="96" width="3" height="16" fill="#22c55e" fillOpacity="0.7" />
          <text x="68" y="108" fontFamily="monospace" fontSize="7" fill="#52525b">02</text>
          <text x="97" y="108" fontFamily="monospace" fontSize="7.5" fill="#22c55e" fillOpacity="0.85">
            + const validate = (input: string) =&gt; &#123;
          </text>

          {/* Line 3 - added */}
          <rect x="88" y="116" width="260" height="16" rx="2" fill="#22c55e14" />
          <rect x="88" y="116" width="3" height="16" fill="#22c55e" fillOpacity="0.7" />
          <text x="68" y="128" fontFamily="monospace" fontSize="7" fill="#52525b">03</text>
          <text x="97" y="128" fontFamily="monospace" fontSize="7.5" fill="#22c55e" fillOpacity="0.85">
            +   if (!input.trim()) throw new Error
          </text>

          {/* Line 4 - normal */}
          <text x="68" y="148" fontFamily="monospace" fontSize="7" fill="#52525b">04</text>
          <text x="97" y="148" fontFamily="monospace" fontSize="7.5" fill="#71717a">
            {'  return sanitize(input)'}
          </text>

          {/* Line 5 - normal */}
          <text x="68" y="168" fontFamily="monospace" fontSize="7" fill="#52525b">05</text>
          <text x="97" y="168" fontFamily="monospace" fontSize="7.5" fill="#71717a">
            {'&#125;'}
          </text>

          {/* AI comment bubble on the diff */}
          <rect x="100" y="178" width="220" height="42" rx="8"
            fill="#dc262618" stroke="#dc262640" strokeWidth="1"
          />
          {/* AI avatar dot */}
          <circle cx="114" cy="192" r="6" fill="url(#redGrad)" />
          <text x="111" y="196" fontFamily="sans-serif" fontSize="7" fill="white" fontWeight="bold">G</text>
          {/* Comment text */}
          <text x="126" y="190" fontFamily="sans-serif" fontSize="7.5" fill="#fca5a5" fontWeight="600">
            Gemini AI · just now
          </text>
          <text x="126" y="204" fontFamily="sans-serif" fontSize="7" fill="#a1a1aa">
            ✓ Type safety improved. Consider adding
          </text>
          <text x="126" y="214" fontFamily="sans-serif" fontSize="7" fill="#a1a1aa">
            input length validation.
          </text>

          {/* ---- AI Chip Card (bottom right) ---- */}
          <rect x="242" y="192" width="142" height="88" rx="12"
            fill="#0f0a0a" stroke="#ffffff12" strokeWidth="1"
            filter="url(#cardShadow)"
          />
          <rect x="242" y="192" width="142" height="30" rx="12" fill="#dc262618" />
          <rect x="242" y="206" width="142" height="16" fill="#dc262618" />
          <rect x="254" y="200" width="16" height="14" rx="3" fill="url(#redGrad)" />
          <text x="259" y="211" fontFamily="sans-serif" fontSize="8" fill="white">AI</text>
          <text x="276" y="210" fontFamily="sans-serif" fontSize="8" fill="#e2e8f0" fontWeight="600">
            Code Score
          </text>
          <circle cx="265" cy="246" r="18" stroke="#ffffff0a" strokeWidth="6" fill="none" />
          <circle cx="265" cy="246" r="18"
            stroke="url(#redGrad)" strokeWidth="6" fill="none"
            strokeDasharray="85 28"
            strokeLinecap="round"
            transform="rotate(-90 265 246)"
          />
          <text x="262" y="250" fontFamily="sans-serif" fontSize="10" fill="white" fontWeight="700">87</text>
          <text x="292" y="234" fontFamily="sans-serif" fontSize="7" fill="#71717a">Security</text>
          <rect x="292" y="238" width="50" height="4" rx="2" fill="#ffffff0a" />
          <rect x="292" y="238" width="38" height="4" rx="2" fill="url(#greenGrad)" />
          <text x="292" y="252" fontFamily="sans-serif" fontSize="7" fill="#71717a">Quality</text>
          <rect x="292" y="256" width="50" height="4" rx="2" fill="#ffffff0a" />
          <rect x="292" y="256" width="32" height="4" rx="2" fill="url(#redGrad)" />
          <text x="292" y="270" fontFamily="sans-serif" fontSize="7" fill="#71717a">Coverage</text>
          <rect x="292" y="274" width="50" height="4" rx="2" fill="#ffffff0a" />
          <rect x="292" y="274" width="42" height="4" rx="2" fill="url(#blueGrad)" />

          {/* ---- PR Badge (bottom left) ---- */}
          <rect x="22" y="172" width="132" height="66" rx="10"
            fill="#0f0a0a" stroke="#ffffff12" strokeWidth="1"
            filter="url(#softShadow)"
          />
          <rect x="32" y="182" width="26" height="26" rx="6" fill="#22c55e18" />
          <circle cx="37" cy="187" r="3" fill="#22c55e" />
          <circle cx="37" cy="202" r="3" fill="#22c55e" />
          <circle cx="51" cy="194" r="3" fill="#22c55e" />
          <line x1="37" y1="190" x2="37" y2="199" stroke="#22c55e" strokeWidth="1.5" />
          <path d="M37 190 Q44 184 51 191" stroke="#22c55e" strokeWidth="1.5" fill="none" />
          <path d="M51 197 Q44 204 37 199" stroke="#22c55e" strokeWidth="1.5" fill="none" />
          <text x="64" y="193" fontFamily="sans-serif" fontSize="8" fill="#86efac" fontWeight="600">PR #247</text>
          <text x="64" y="205" fontFamily="sans-serif" fontSize="7" fill="#52525b">feat: add validation</text>
          <rect x="32" y="214" width="110" height="16" rx="4" fill="#22c55e14" />
          <circle cx="40" cy="222" r="3" fill="#22c55e" />
          <text x="48" y="226" fontFamily="sans-serif" fontSize="7.5" fill="#86efac">Approved · 2 comments</text>

          {/* ---- Connecting lines ---- */}
          <path d="M88 195 Q95 175 102 175" stroke="#dc2626" strokeWidth="1"
            strokeDasharray="4 3" strokeOpacity="0.4" fill="none" />
          <path d="M300 192 Q295 175 320 175" stroke="#2563eb" strokeWidth="1"
            strokeDasharray="4 3" strokeOpacity="0.4" fill="none" />

          {/* ---- Floating badge — top right ---- */}
          <rect x="308" y="18" width="96" height="24" rx="12"
            fill="#22c55e18" stroke="#22c55e40" strokeWidth="1"
          />
          <circle cx="320" cy="30" r="3.5" fill="#22c55e" />
          <text x="329" y="34" fontFamily="sans-serif" fontSize="8" fill="#86efac" fontWeight="600">
            AI Review Ready
          </text>

          {/* ---- GitHub avatar cluster — top left ---- */}
          <circle cx="75" cy="18" r="11" fill="#1f2937" stroke="#374151" strokeWidth="1.5" />
          <circle cx="91" cy="18" r="11" fill="#1f2937" stroke="#374151" strokeWidth="1.5" />
          <circle cx="107" cy="18" r="11" fill="#1f2937" stroke="#374151" strokeWidth="1.5" />
          <circle cx="75" cy="15" r="4" fill="#818cf8" />
          <path d="M67 26 Q75 21 83 26" fill="#818cf8" fillOpacity="0.6" />
          <circle cx="91" cy="15" r="4" fill="#f472b6" />
          <path d="M83 26 Q91 21 99 26" fill="#f472b6" fillOpacity="0.6" />
          <circle cx="107" cy="15" r="4" fill="#34d399" />
          <path d="M99 26 Q107 21 115 26" fill="#34d399" fillOpacity="0.6" />
          <rect x="118" y="10" width="52" height="16" rx="8" fill="#ffffff08" stroke="#ffffff15" strokeWidth="1" />
          <text x="126" y="22" fontFamily="sans-serif" fontSize="7.5" fill="#a1a1aa">+12 team</text>
        </svg>

        {/* Floating sparkle particles */}
        <motion.div
          className="absolute top-4 right-8 w-1.5 h-1.5 rounded-full bg-red-400"
          animate={{ opacity: [0, 1, 0], y: [0, -8, -16], scale: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0 }}
        />
        <motion.div
          className="absolute top-16 left-6 w-1 h-1 rounded-full bg-blue-400"
          animate={{ opacity: [0, 1, 0], y: [0, -10, -20], scale: [0.5, 1, 0.5] }}
          transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
        />
        <motion.div
          className="absolute bottom-12 right-6 w-1.5 h-1.5 rounded-full bg-emerald-400"
          animate={{ opacity: [0, 1, 0], y: [0, -6, -12], scale: [0.5, 1, 0.5] }}
          transition={{ duration: 2.8, repeat: Infinity, delay: 2 }}
        />
      </motion.div>
    </motion.div>
  );
};
